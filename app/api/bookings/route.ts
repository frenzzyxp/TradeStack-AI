import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseServer";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const sb = supabaseService();

    const public_token = randomUUID().replace(/-/g, "").slice(0, 24);
    const { data, error } = await sb
      .from("bookings")
      .insert({ ...payload, public_token })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ booking: data });
  } catch (e: any) {
    console.error("create booking error:", e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
