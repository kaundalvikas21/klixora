import { NextResponse } from "next/server";
import { createLead } from "@/server/leads";

/**
 * Public enquiry endpoint. Shares every rule with the form's Server Action,
 * because both call createLead().
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Send a JSON body." },
      { status: 400 },
    );
  }

  const result = await createLead(body, request.headers);

  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
