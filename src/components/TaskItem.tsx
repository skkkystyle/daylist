import type { Task } from "../types";
import { Icon } from "./Icon";

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TaskItem({ task, onToggle, onDelete }: Props) {
  return (
    <li className={`task-item${task.completed ? " task-item--completed" : ""}`}>
      <label className="task-label">
        <span className="checkbox-wrap">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
          />
          <span className="checkbox-mark">
            <Icon name="check" />
          </span>
        </span>
        <span className="task-title">{task.title}</span>
      </label>
      <button
        type="button"
        className="icon-button delete-button"
        aria-label={`Удалить задачу «${task.title}»`}
        onClick={() => onDelete(task.id)}
      >
        <Icon name="trash" />
      </button>
    </li>
  );
}
