export interface Task {
  id: string;
  title: string;
  completed: boolean;
  status: string;
  priority: string;
  dueDate?: string;
  tags: string[];
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  taskIds: string[];
}
