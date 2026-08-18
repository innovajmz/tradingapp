"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/Sidebar";
import EmptyState from "@/components/EmptyState";
import AccountView from "@/components/AccountView";
import AccountModal from "@/components/AccountModal";
import DayModal from "@/components/DayModal";
import Toasts from "@/components/Toasts";

export default function Dashboard({ user, initialAccounts, initialEntries }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [entries, setEntries] = useState(initialEntries);
  const [selectedId, setSelectedId] = useState(initialAccounts[0]?.id ?? null);
  const [accountModal, setAccountModal] = useState(null); // null | 'new' | account
  const [dayModal, setDayModal] = useState(null); // null | { date }
  const [toasts, setToasts] = useState([]);
  const [busy, setBusy] = useState(false);

  const now = new Date();
  const [month, setMonth] = useState({ y: now.getFullYear(), m: now.getMonth() });

  function pushToast(text, type = "ok") {
    const id = `${text}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }

  const selectedAccount = accounts.find((a) => a.id === selectedId) || null;
  const entriesFor = (accountId) => entries.filter((e) => e.account_id === accountId);

  async function saveAccount(payload, existingId) {
    setBusy(true);
    if (existingId) {
      const { data, error } = await supabase
        .from("accounts")
        .update(payload)
        .eq("id", existingId)
        .select()
        .single();
      setBusy(false);
      if (error) return pushToast("No se pudo actualizar la cuenta", "error");
      setAccounts((prev) => prev.map((a) => (a.id === existingId ? data : a)));
      pushToast("Cuenta actualizada");
    } else {
      const { data, error } = await supabase
        .from("accounts")
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      setBusy(false);
      if (error) return pushToast("No se pudo crear la cuenta", "error");
      setAccounts((prev) => [...prev, data]);
      setSelectedId(data.id);
      pushToast("Cuenta creada");
    }
    setAccountModal(null);
  }

  async function deleteAccount(id) {
    setBusy(true);
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    setBusy(false);
    if (error) return pushToast("No se pudo eliminar la cuenta", "error");
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setEntries((prev) => prev.filter((e) => e.account_id !== id));
    if (selectedId === id) setSelectedId(null);
    pushToast("Cuenta eliminada");
  }

  async function saveEntry(accountId, date, pnl, notes) {
    const existing = entries.find((e) => e.account_id === accountId && e.date === date);
    setBusy(true);
    if (existing) {
      const { data, error } = await supabase
        .from("entries")
        .update({ pnl, notes })
        .eq("id", existing.id)
        .select()
        .single();
      setBusy(false);
      if (error) return pushToast("No se pudo guardar el día", "error");
      setEntries((prev) => prev.map((e) => (e.id === existing.id ? data : e)));
    } else {
      const { data, error } = await supabase
        .from("entries")
        .insert({ account_id: accountId, user_id: user.id, date, pnl, notes })
        .select()
        .single();
      setBusy(false);
      if (error) return pushToast("No se pudo guardar el día", "error");
      setEntries((prev) => [...prev, data]);
    }
    pushToast("Día registrado");
    setDayModal(null);
  }

  async function deleteEntry(entryId) {
    setBusy(true);
    const { error } = await supabase.from("entries").delete().eq("id", entryId);
    setBusy(false);
    if (error) return pushToast("No se pudo borrar el registro", "error");
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    pushToast("Registro borrado");
    setDayModal(null);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="app">
      <Sidebar
        accounts={accounts}
        entries={entries}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNew={() => setAccountModal("new")}
        userEmail={user.email}
        onLogout={logout}
      />
      <main className="main">
        {!selectedAccount ? (
          <EmptyState onNew={() => setAccountModal("new")} />
        ) : (
          <AccountView
            account={selectedAccount}
            entries={entriesFor(selectedAccount.id)}
            month={month}
            setMonth={setMonth}
            onEdit={() => setAccountModal(selectedAccount)}
            onDelete={() => {
              if (confirm(`¿Eliminar la cuenta "${selectedAccount.name}" y todos sus registros?`)) {
                deleteAccount(selectedAccount.id);
              }
            }}
            onDayClick={(date) => setDayModal({ date })}
          />
        )}
      </main>

      {accountModal && (
        <AccountModal
          account={accountModal === "new" ? null : accountModal}
          busy={busy}
          onClose={() => setAccountModal(null)}
          onSave={saveAccount}
        />
      )}

      {dayModal && selectedAccount && (
        <DayModal
          date={dayModal.date}
          entry={entries.find((e) => e.account_id === selectedAccount.id && e.date === dayModal.date) || null}
          busy={busy}
          onClose={() => setDayModal(null)}
          onSave={(pnl, notes) => saveEntry(selectedAccount.id, dayModal.date, pnl, notes)}
          onDelete={deleteEntry}
        />
      )}

      <Toasts toasts={toasts} />
    </div>
  );
}
