export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export type TaskFilter = "all" | "active" | "completed";

export const MAX_TITLE_LENGTH = 280;
