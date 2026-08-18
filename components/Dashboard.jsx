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

export default function Dashboard({ user, initialAccounts, initialTrades }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [trades, setTrades] = useState(initialTrades);
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
  const tradesFor = (accountId) => trades.filter((t) => t.account_id === accountId);

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
    setTrades((prev) => prev.filter((t) => t.account_id !== id));
    if (selectedId === id) setSelectedId(null);
    pushToast("Cuenta eliminada");
  }

  async function addTrade(accountId, date, { pnl, commission, symbol, notes }) {
    setBusy(true);
    const { data, error } = await supabase
      .from("trades")
      .insert({
        account_id: accountId,
        user_id: user.id,
        date,
        pnl,
        commission,
        symbol,
        notes,
      })
      .select()
      .single();
    setBusy(false);
    if (error) {
      pushToast("No se pudo agregar la operación", "error");
      return null;
    }
    setTrades((prev) => [...prev, data]);
    pushToast("Operación agregada");
    return data;
  }

  async function updateTrade(tradeId, { pnl, commission, symbol, notes }) {
    setBusy(true);
    const { data, error } = await supabase
      .from("trades")
      .update({ pnl, commission, symbol, notes })
      .eq("id", tradeId)
      .select()
      .single();
    setBusy(false);
    if (error) {
      pushToast("No se pudo actualizar la operación", "error");
      return null;
    }
    setTrades((prev) => prev.map((t) => (t.id === tradeId ? data : t)));
    pushToast("Operación actualizada");
    return data;
  }

  async function deleteTrade(tradeId) {
    setBusy(true);
    const { error } = await supabase.from("trades").delete().eq("id", tradeId);
    setBusy(false);
    if (error) return pushToast("No se pudo borrar la operación", "error");
    setTrades((prev) => prev.filter((t) => t.id !== tradeId));
    pushToast("Operación borrada");
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
        trades={trades}
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
            trades={tradesFor(selectedAccount.id)}
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
          trades={trades.filter((t) => t.account_id === selectedAccount.id && t.date === dayModal.date)}
          busy={busy}
          onClose={() => setDayModal(null)}
          onAdd={(fields) => addTrade(selectedAccount.id, dayModal.date, fields)}
          onUpdate={updateTrade}
          onDelete={deleteTrade}
        />
      )}

      <Toasts toasts={toasts} />
    </div>
  );
}
