import { MAX_TITLE_LENGTH, type Task } from "../types";

export const STORAGE_KEY = "daylist.tasks.v1";

type StoredTasks = { version: 1; tasks: Task[] };

function isStoredTasks(value: unknown): value is StoredTasks {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  if (data.version !== 1 || !Array.isArray(data.tasks)) return false;

  const ids = new Set<string>();
  return data.tasks.every((item: unknown) => {
    if (typeof item !== "object" || item === null) return false;
    const task = item as Record<string, unknown>;
    if (
      typeof task.id !== "string" ||
      !task.id ||
      ids.has(task.id) ||
      typeof task.title !== "string" ||
      !task.title.trim() ||
      task.title.length > MAX_TITLE_LENGTH ||
      typeof task.completed !== "boolean"
    )
      return false;
    ids.add(task.id);
    return true;
  });
}

export function loadTasks(): { tasks: Task[]; error: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { tasks: [], error: null };
    const data: unknown = JSON.parse(raw);
    if (!isStoredTasks(data)) throw new Error("Invalid task data");
    return { tasks: data.tasks, error: null };
  } catch {
    return {
      tasks: [],
      error:
        "Не удалось прочитать сохранённые задачи. Можно начать новый список; прежние данные будут заменены при первом изменении.",
    };
  }
}

export function saveTasks(tasks: Task[]): string | null {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks }));
    return null;
  } catch {
    return "Не удалось сохранить задачи. Сейчас они доступны только на этой странице и могут пропасть после обновления.";
  }
}
