import { NextResponse } from "next/server";
import { publicClient } from "@/server/supabase";
import { clientIp, rateLimit } from "@/server/rate-limit";

/**
 * Hero CTA click counter.
 *
 * Calls a SECURITY DEFINER function rather than updating the table: the
 * public site must be able to add 1 to one column and nothing else, and a
 * table-level policy cannot express "this column only".
 */
export async function POST(request: Request) {
  const limit = rateLimit(`cta:${clientIp(request.headers)}`, 60, 60_000);
  if (!limit.ok) return new NextResponse(null, { status: 429 });

  const db = publicClient();
  if (!db) return new NextResponse(null, { status: 204 });

  try {
    const { id } = (await request.json()) as { id?: string };
    if (!id) return new NextResponse(null, { status: 400 });

    await db.rpc("increment_cta_click", { cta_id: id });
  } catch {
    // A missing or deleted CTA id is not worth a log line or an error page.
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, { status: 204 });
}
