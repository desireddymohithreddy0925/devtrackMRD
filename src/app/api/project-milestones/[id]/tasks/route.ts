import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveAppUser } from "@/lib/resolve-user";
import { stripHtml } from "@/lib/sanitize";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.githubId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await resolveAppUser(session.githubId, session.githubLogin);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title } = body;
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const sanitizedTitle = stripHtml(title);

  // Verify milestone ownership
  const { data: milestone, error: milestoneError } = await supabaseAdmin
    .from("project_milestones")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (milestoneError || !milestone) {
    return Response.json({ error: "Milestone not found" }, { status: 404 });
  }

  const { data: task, error } = await supabaseAdmin
    .from("project_tasks")
    .insert({
      milestone_id: params.id,
      title: sanitizedTitle,
    })
    .select("*")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ task }, { status: 201 });
}
