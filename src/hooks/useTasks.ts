import { useEffect, useState } from "react";
import { loadTasks, saveTasks } from "../lib/storage";
import { MAX_TITLE_LENGTH, type Task } from "../types";

type DeletedTask = { task: Task; index: number };

export function useTasks() {
  const [initial] = useState(loadTasks);
  const [tasks, setTasks] = useState(initial.tasks);
  const [storageError, setStorageError] = useState(initial.error);
  const [hasChanged, setHasChanged] = useState(false);
  const [deleted, setDeleted] = useState<DeletedTask | null>(null);

  // Do not overwrite unreadable storage just by opening the application.
  useEffect(() => {
    if (hasChanged) setStorageError(saveTasks(tasks));
  }, [tasks, hasChanged]);

  function addTask(value: string): boolean {
    const title = value.trim();
    if (!title || title.length > MAX_TITLE_LENGTH) return false;
    const task: Task = { id: crypto.randomUUID(), title, completed: false };
    setTasks((current) => [...current, task]);
    setHasChanged(true);
    return true;
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
    setHasChanged(true);
  }

  function deleteTask(id: string) {
    const index = tasks.findIndex((task) => task.id === id);
    if (index < 0) return;
    setDeleted({ task: tasks[index], index });
    setTasks((current) => current.filter((task) => task.id !== id));
    setHasChanged(true);
  }

  function undoDelete() {
    if (!deleted) return;
    const { task, index } = deleted;
    setTasks((current) => {
      if (current.some((item) => item.id === task.id)) return current;
      const restored = [...current];
      restored.splice(Math.min(index, restored.length), 0, task);
      return restored;
    });
    setDeleted(null);
    setHasChanged(true);
  }

  return {
    tasks,
    storageError,
    deleted,
    addTask,
    toggleTask,
    deleteTask,
    undoDelete,
    dismissUndo: () => setDeleted(null),
  };
}
