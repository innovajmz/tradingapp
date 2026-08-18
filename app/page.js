import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Dashboard from "@/components/Dashboard";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: accounts }, { data: entries }] = await Promise.all([
    supabase.from("accounts").select("*").order("created_at", { ascending: true }),
    supabase.from("entries").select("*"),
  ]);

  return (
    <Dashboard
      user={{ id: user.id, email: user.email }}
      initialAccounts={accounts || []}
      initialEntries={entries || []}
    />
  );
}
