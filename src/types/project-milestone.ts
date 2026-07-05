export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  taskIds: string[];
}
