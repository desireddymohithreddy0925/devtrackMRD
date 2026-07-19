export interface ProjectTask {
  id: string;
  milestone_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface ProjectMilestone {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  due_date: string;
  created_at: string;
  tasks?: ProjectTask[];
}
