export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseServer";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  const { to, body, channel_id } = await req.json();
  if (!to || !body || !channel_id) {
    return NextResponse.json({ ok: false, error: "Missing to/body/channel_id" }, { status: 400 });
  }

  const sb = supabaseService();
  const from = process.env.TWILIO_FROM_NUMBER || null;

  // ---- Dev mode: skip Twilio, just log to DB ----
  if (process.env.DISABLE_TWILIO_SEND === "true") {
    await sb.from("messages").insert({
      channel_id,
      from_number: from,
      to_number: to,
      body,
      direction: "out",
      status: "simulated",
    });
    return NextResponse.json({ ok: true, sid: "SIMULATED" });
  }

  // ---- Real Twilio send ----
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
    const msg = await client.messages.create({ to, from: process.env.TWILIO_FROM_NUMBER!, body });

    await sb.from("messages").insert({
      channel_id,
      from_number: process.env.TWILIO_FROM_NUMBER!,
      to_number: to,
      body,
      direction: "out",
      status: "sent",
      // sid: msg.sid,
    });

    return NextResponse.json({ ok: true, sid: msg.sid });
  } catch (e: any) {
    // Log failure
    await sb.from("messages").insert({
      channel_id,
      from_number: process.env.TWILIO_FROM_NUMBER || null,
      to_number: to || null,
      body: body || null,
      direction: "out",
      status: "failed",
    });
    return NextResponse.json({ ok: false, error: e?.message || "Send failed" }, { status: 500 });
  }
}
