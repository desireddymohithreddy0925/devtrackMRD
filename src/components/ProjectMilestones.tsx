"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Target, Trash2, CheckCircle2, Circle } from "lucide-react";
import type { ProjectMilestone, ProjectTask } from "@/types/project-milestone";

export default function ProjectMilestones() {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", due_date: "" });
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});

  const loadMilestones = useCallback(async () => {
    try {
      const res = await fetch("/api/project-milestones");
      if (!res.ok) throw new Error("Failed to load milestones");
      const data = await res.json();
      setMilestones(data.milestones || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMilestones();
  }, [loadMilestones]);

  const handleCreateMilestone = async () => {
    if (!form.name || !form.due_date) return;
    try {
      const res = await fetch("/api/project-milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to create milestone");
      const data = await res.json();
      setMilestones(prev => [data.milestone, ...prev]);
      setShowForm(false);
      setForm({ name: "", description: "", due_date: "" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    try {
      const res = await fetch(`/api/project-milestones/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete milestone");
      setMilestones(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddTask = async (milestoneId: string) => {
    const title = taskInputs[milestoneId];
    if (!title?.trim()) return;

    try {
      const res = await fetch(`/api/project-milestones/${milestoneId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });
      if (!res.ok) throw new Error("Failed to add task");
      const data = await res.json();
      
      setMilestones(prev => prev.map(m => {
        if (m.id === milestoneId) {
          return { ...m, tasks: [...(m.tasks || []), data.task] };
        }
        return m;
      }));
      setTaskInputs(prev => ({ ...prev, [milestoneId]: "" }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleTask = async (milestoneId: string, task: ProjectTask) => {
    const newCompleted = !task.completed;
    
    // Optimistic UI
    setMilestones(prev => prev.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          tasks: (m.tasks || []).map(t => t.id === task.id ? { ...t, completed: newCompleted } : t)
        };
      }
      return m;
    }));

    try {
      const res = await fetch(`/api/project-milestones/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newCompleted })
      });
      if (!res.ok) throw new Error("Failed to update task");
    } catch (err: any) {
      // Revert
      alert(err.message);
      loadMilestones();
    }
  };

  const handleDeleteTask = async (milestoneId: string, taskId: string) => {
    try {
      const res = await fetch(`/api/project-milestones/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      setMilestones(prev => prev.map(m => {
        if (m.id === milestoneId) {
          return { ...m, tasks: (m.tasks || []).filter(t => t.id !== taskId) };
        }
        return m;
      }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-4 text-center text-sm text-gray-500">Loading milestones...</div>;
  if (error) return <div className="p-4 text-center text-sm text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--background)]">
        <h2 className="text-lg font-semibold flex items-center gap-2 m-0 text-[var(--foreground)]">
          <Target size={20} className="text-[#6366f1]" />
          Project Milestones
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 rounded-lg bg-[rgba(99,102,241,0.1)] text-[#6366f1] hover:bg-[rgba(99,102,241,0.2)] transition-colors border-none cursor-pointer"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {showForm && (
          <div className="mb-6 p-4 rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.02)]">
            <h3 className="text-sm font-semibold mb-4 text-[var(--foreground)] mt-0">New Milestone</h3>
            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. v1.0 Release"
                  className="w-full p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">Description</label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description"
                  className="w-full p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">Due Date *</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  className="w-full p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border)] bg-transparent text-[var(--foreground)] text-sm cursor-pointer hover:bg-[var(--accent)]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMilestone}
                disabled={!form.name || !form.due_date}
                className="px-4 py-2 rounded-lg border-none bg-[#6366f1] text-white text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4f46e5]"
              >
                Add Milestone
              </button>
            </div>
          </div>
        )}

        {milestones.length === 0 ? (
          <div className="text-center py-8 text-[var(--muted-foreground)] text-sm">
            <Target size={32} className="opacity-30 mx-auto mb-2" />
            <p className="m-0">No project milestones yet. Create one to start tracking!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {milestones.map(m => {
              const mTasks = m.tasks || [];
              const totalTasks = mTasks.length;
              const completedTasks = mTasks.filter(t => t.completed).length;
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              return (
                <div key={m.id} className="bg-[rgba(255,255,255,0.02)] border border-[var(--border)] rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="m-0 mb-1 text-lg font-semibold text-[var(--foreground)]">{m.name}</h3>
                      {m.description && <p className="m-0 mb-2 text-sm text-[var(--muted-foreground)]">{m.description}</p>}
                      <span className="text-xs text-[var(--muted-foreground)]">Due: {new Date(m.due_date).toLocaleDateString()}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteMilestone(m.id)}
                      className="p-1 bg-transparent border-none text-red-500 cursor-pointer hover:bg-red-500/10 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-1">
                      <span>Progress</span>
                      <span>{progress}% ({completedTasks}/{totalTasks})</span>
                    </div>
                    <div className="h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300 ease-out"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: progress === 100 ? '#10b981' : '#6366f1'
                        }}
                      />
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)] pt-3">
                    <h4 className="text-sm m-0 mb-2 text-[var(--foreground)]">Tasks</h4>
                    {mTasks.length === 0 ? (
                      <p className="text-xs text-[var(--muted-foreground)] italic m-0 mb-2">No tasks linked.</p>
                    ) : (
                      <ul className="list-none p-0 m-0 mb-3 flex flex-col gap-2">
                        {mTasks.map(task => (
                          <li key={task.id} className="flex items-center justify-between gap-2 text-sm">
                            <div
                              className="flex items-center gap-2 cursor-pointer flex-1"
                              onClick={() => handleToggleTask(m.id, task)}
                            >
                              {task.completed ? (
                                <CheckCircle2 size={16} className="text-[#10b981] flex-shrink-0" />
                              ) : (
                                <Circle size={16} className="text-[var(--muted-foreground)] flex-shrink-0" />
                              )}
                              <span className={`${task.completed ? 'line-through text-[var(--muted-foreground)]' : 'text-[var(--foreground)]'}`}>
                                {task.title}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteTask(m.id, task.id)}
                              className="p-1 bg-transparent border-none text-red-500 cursor-pointer opacity-70 hover:opacity-100 hover:bg-red-500/10 rounded"
                            >
                              <Trash2 size={12} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="New task title..."
                        value={taskInputs[m.id] || ''}
                        onChange={e => setTaskInputs(prev => ({ ...prev, [m.id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddTask(m.id);
                        }}
                        className="flex-1 p-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-xs"
                      />
                      <button
                        onClick={() => handleAddTask(m.id)}
                        disabled={!taskInputs[m.id]?.trim()}
                        className="px-3 py-1.5 rounded-md border-none bg-[rgba(99,102,241,0.1)] text-[#6366f1] text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgba(99,102,241,0.2)]"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
