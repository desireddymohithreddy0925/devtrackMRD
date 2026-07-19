import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveAppUser } from "@/lib/resolve-user";
import { stripHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";
const MAX_MILESTONES = 20;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.githubId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await resolveAppUser(session.githubId, session.githubLogin);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const { data: milestones, error } = await supabaseAdmin
    .from("project_milestones")
    .select(`
      *,
      tasks:project_tasks(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch project milestones:", error);
    return Response.json({ error: "Failed to fetch project milestones" }, { status: 500 });
  }

  return Response.json({ milestones: milestones ?? [] });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.githubId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, description, due_date } = body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }
  if (!due_date || typeof due_date !== "string") {
    return Response.json({ error: "Due date is required" }, { status: 400 });
  }

  const sanitizedName = stripHtml(name);
  const sanitizedDescription = description ? stripHtml(description) : null;
  const d = new Date(due_date);
  if (isNaN(d.getTime())) {
    return Response.json({ error: "Invalid due date format" }, { status: 400 });
  }

  const user = await resolveAppUser(session.githubId, session.githubLogin);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const { count } = await supabaseAdmin
    .from("project_milestones")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= MAX_MILESTONES) {
    return Response.json(
      { error: `You can have at most ${MAX_MILESTONES} milestones.` },
      { status: 400 }
    );
  }

  const { data: milestone, error } = await supabaseAdmin
    .from("project_milestones")
    .insert({
      user_id: user.id,
      name: sanitizedName,
      description: sanitizedDescription,
      due_date: d.toISOString().split('T')[0],
    })
    .select("*, tasks:project_tasks(*)")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ milestone }, { status: 201 });
}
