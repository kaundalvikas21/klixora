import type { Metadata } from "next";
import { Database } from "lucide-react";
import { EmptyState } from "@/components/admin/ui/primitives";
import { LeadsScreen } from "@/components/admin/leads/leads-screen";
import {
  getAdminHomeContent,
  getAdminLeads,
  getAdminUsers,
  getLeadNotes,
} from "@/server/admin";
import { isSupabaseConfigured } from "@/server/supabase";

export const metadata: Metadata = {
  title: "Contact Leads",
  robots: { index: false, follow: false },
};

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    view?: string;
    lead?: string;
  }>;
}) {
  const query = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        icon={<Database size={22} />}
        title="No database connected"
        detail="Leads are stored in Supabase. Run `npm run db:start` and copy the printed keys into .env.local. Until then the public form tells visitors to email instead of reporting a success it cannot deliver."
      />
    );
  }

  const [{ leads, counts }, users, content] = await Promise.all([
    getAdminLeads({ q: query.q, status: query.status }),
    getAdminUsers(),
    getAdminHomeContent(),
  ]);

  // The open lead comes from the URL, so a link from the Overview or a
  // shared link opens the same record, and its notes are fetched here rather
  // than from the client.
  const openLead = query.lead
    ? (leads.find((lead) => lead.id === query.lead) ?? null)
    : null;
  const openLeadNotes = openLead ? await getLeadNotes(openLead.id) : [];

  return (
    <LeadsScreen
      leads={leads}
      counts={counts}
      users={users}
      slaHours={content.contact.slaHours}
      openLead={openLead}
      openLeadNotes={openLeadNotes}
      filters={{
        q: query.q ?? "",
        status: query.status ?? "",
        view: query.view === "board" ? "board" : "table",
      }}
    />
  );
}
