import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseServer";

export async function GET() {
  const sb = supabaseService();

  const [{ data: ch }, { data: ms }, { data: ai }] = await Promise.all([
    sb.from("channels").select("*", { count: "exact", head: true }),
    sb.from("messages").select("*", { count: "exact", head: true }),
    sb.from("ai_suggestions").select("*", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    channels: ch?.length ?? null, // head:true returns no rows; count is in error payload on some versions
    messages: ms?.length ?? null,
    ai_suggestions: ai?.length ?? null,
  });
}
