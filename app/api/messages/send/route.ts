// app/api/messages/send/route.ts
// Sends an outbound SMS via Twilio and logs it to Supabase `messages`

export const runtime = "nodejs"; // Twilio needs Node runtime (not Edge)

import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseServer";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  try {
    const { to, body, channel_id } = await req.json();

    if (!to || !body || !channel_id) {
      return NextResponse.json(
        { ok: false, error: "Missing to/body/channel_id" },
        { status: 400 }
      );
    }

    // Send the SMS with Twilio
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    const from = process.env.TWILIO_FROM_NUMBER!;
    const msg = await client.messages.create({ to, from, body });

    // Log outbound message in Supabase
    const sb = supabaseService();
    await sb.from("messages").insert({
      channel_id,
      from_number: from,
      to_number: to,
      body,
      direction: "out",
      status: "sent", // you can later update with delivery callbacks
      // sid: msg.sid,          // add this if you add a `sid` column
    });

    return NextResponse.json({ ok: true, sid: msg.sid });
  } catch (e: any) {
    console.error("send error:", e?.message || e);

    // Best effort: log a failed attempt
    try {
      const { to, body, channel_id } = await req.json();
      const sb = supabaseService();
      await sb.from("messages").insert({
        channel_id,
        from_number: process.env.TWILIO_FROM_NUMBER || null,
        to_number: to || null,
        body: body || null,
        direction: "out",
        status: "failed",
      });
    } catch {}

    return NextResponse.json(
      { ok: false, error: e?.message || "Send failed" },
      { status: 500 }
    );
  }
}
