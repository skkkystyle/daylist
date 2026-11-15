import type { Task, TaskFilter } from "../types";
import { TaskItem } from "./TaskItem";
import { Icon } from "./Icon";

type Props = {
  tasks: Task[];
  total: number;
  filter: TaskFilter;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string) => boolean;
};

function EmptyIllustration() {
  return (
    <svg
      className="empty-illustration"
      viewBox="0 0 160 128"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="80" cy="110" rx="57" ry="8" fill="#edf1fb" />
      <circle cx="80" cy="61" r="51" fill="#f1f4fe" />
      <g transform="rotate(-8 80 62)">
        <rect
          x="45"
          y="20"
          width="72"
          height="88"
          rx="10"
          fill="#fff"
          stroke="#c9d4f7"
          strokeWidth="1.5"
        />
        <rect
          x="62"
          y="15"
          width="37"
          height="13"
          rx="5"
          fill="#e0e7fc"
          stroke="#b4c4f4"
          strokeWidth="1.5"
        />
        <rect x="57" y="43" width="12" height="12" rx="4" fill="#e9eeff" />
        <path
          d="m60 49 2 2 4-5"
          stroke="#5273df"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M78 49h25M78 69h19M78 89h23"
          stroke="#d8e0f4"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect
          x="57"
          y="63"
          width="12"
          height="12"
          rx="4"
          stroke="#d8e0f4"
          strokeWidth="1.5"
        />
        <rect
          x="57"
          y="83"
          width="12"
          height="12"
          rx="4"
          stroke="#d8e0f4"
          strokeWidth="1.5"
        />
      </g>
      <path d="m127 40 2-5 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#8198ed" />
      <circle cx="31" cy="72" r="3" fill="#c0cef8" />
      <path
        d="M30 34v8M26 38h8"
        stroke="#a5b7ee"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TaskList({
  tasks,
  total,
  filter,
  onToggle,
  onDelete,
  onAdd,
}: Props) {
  if (tasks.length > 0) {
    return (
      <ul className="task-list" aria-label="Список задач">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </ul>
    );
  }

  const isNew = total === 0;
  const isActive = filter === "active";
  return (
    <div className="empty-state">
      {isNew ? (
        <EmptyIllustration />
      ) : (
        <span className="empty-check">
          <Icon name="check" />
        </span>
      )}
      <h2>
        {isNew
          ? "Место для твоих планов"
          : isActive
            ? "Всё сделано. Выдыхай!"
            : "Первые галочки ещё впереди"}
      </h2>
      <p>
        {isNew ? (
          <>
            Пусть важное будет перед глазами,
            <br />а не в голове. Добавь первую задачу.
          </>
        ) : isActive ? (
          "Все задачи выполнены. Можно немного отдохнуть."
        ) : (
          "Отметь выполненную задачу — и она появится здесь."
        )}
      </p>
      {isNew && (
        <div className="suggestions">
          <span>Можно начать с малого</span>
          <div>
            {["Разобрать почту", "Прочитать 10 страниц"].map((title) => (
              <button
                className="suggestion-button"
                type="button"
                key={title}
                onClick={() => onAdd(title)}
              >
                <Icon name="plus" />
                {title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
