import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveAppUser } from "@/lib/resolve-user";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function verifyTaskOwnership(taskId: string, userId: string) {
  const { data: task, error } = await supabaseAdmin
    .from("project_tasks")
    .select("milestone_id, project_milestones(user_id)")
    .eq("id", taskId)
    .single();

  if (error || !task) return false;
  return (task.project_milestones as any).user_id === userId;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } }
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

  const { completed } = body;
  if (typeof completed !== "boolean") {
    return Response.json({ error: "completed boolean is required" }, { status: 400 });
  }

  const isOwner = await verifyTaskOwnership(params.taskId, user.id);
  if (!isOwner) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  const { data: task, error } = await supabaseAdmin
    .from("project_tasks")
    .update({ completed })
    .eq("id", params.taskId)
    .select("*")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ task });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.githubId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await resolveAppUser(session.githubId, session.githubLogin);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const isOwner = await verifyTaskOwnership(params.taskId, user.id);
  if (!isOwner) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from("project_tasks")
    .delete()
    .eq("id", params.taskId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
