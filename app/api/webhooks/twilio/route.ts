import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseServer";
import { openai } from "@/lib/openai";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    // 1) Parse Twilio form payload
    const formData = await req.formData();
    const from = String(formData.get("From") || "");
    const to = String(formData.get("To") || "");
    const body = String(formData.get("Body") || "");

    const sb = supabaseService();

    // 2) Find (or create) a channel
    let { data: channel, error: chSelErr } = await sb
      .from("channels")
      .select("*")
      .limit(1)
      .single();

    // Ignore "no rows" (PGRST116). Any other error should throw.
    if (chSelErr && chSelErr.code !== "PGRST116") throw chSelErr;

    if (!channel) {
      const demoAccountId = randomUUID(); // Node generates a real UUID
      const { data: newChannel, error: channelError } = await sb
        .from("channels")
        .insert({
          account_id: demoAccountId,
          name: "default",
          type: "sms",        // required by your schema
          provider: "twilio", // required/expected by your schema
          status: "active",   // safe default
        })
        .select("*")
        .single();
      if (channelError) throw channelError;
      channel = newChannel;
    }

    // 3) Save inbound message (FK uses channel.id)
    const { data: msg, error: msgError } = await sb
  .from("messages")
  .insert({
    channel_id: channel.id,
    from_number: from,
    to_number: to,
    body,
    direction: "in",     // <-- add this
    status: "received",  // <-- add this (if your schema uses it)
  })
  .select("*")
  .single();


    // 4) Ask OpenAI for a short suggested reply
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Customer texted: "${body}". Write a short, friendly business reply.`,
        },
      ],
    });
    const suggestion = completion.choices?.[0]?.message?.content ?? "";

    // 5) Store AI suggestion
    const { error: aiError } = await sb
      .from("ai_suggestions")
      .insert({
        message_id: msg.id,
        suggestion_text: suggestion,
      });
    if (aiError) throw aiError;

    console.log("✅ Message + AI suggestion saved!");
    // Twilio expects XML (TwiML). Empty <Response/> is fine since we reply later.
    return new NextResponse("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (err: any) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
