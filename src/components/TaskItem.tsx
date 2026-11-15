import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { MAX_TITLE_LENGTH, type Task } from "../types";
import { Icon } from "./Icon";

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => boolean;
};

export function TaskItem({ task, onToggle, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const errorId = useId();

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else if (restoreFocus.current) {
      editButtonRef.current?.focus();
      restoreFocus.current = false;
    }
  }, [editing]);

  function closeEditor() {
    restoreFocus.current = true;
    setEditing(false);
    setError("");
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) {
      setError("Введи название задачи.");
      inputRef.current?.focus();
      return;
    }
    if (onEdit(task.id, draft)) closeEditor();
  }

  if (editing) {
    return (
      <li className="task-item">
        <form
          className="task-edit-form"
          onSubmit={save}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              closeEditor();
            }
          }}
        >
          <div className="task-edit-controls">
            <input
              ref={inputRef}
              aria-label="Название задачи"
              maxLength={MAX_TITLE_LENGTH}
              value={draft}
              autoComplete="off"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              onChange={(event) => {
                setDraft(event.target.value);
                setError("");
              }}
            />
            <button
              type="submit"
              className="icon-button save-edit-button"
              aria-label="Сохранить изменения"
            >
              <Icon name="check" />
            </button>
            <button
              type="button"
              className="icon-button cancel-edit-button"
              aria-label="Отменить редактирование"
              onClick={closeEditor}
            >
              <Icon name="close" />
            </button>
          </div>
          {error && (
            <p className="form-error" id={errorId} role="alert">
              {error}
            </p>
          )}
        </form>
      </li>
    );
  }

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
      <div className="task-actions">
        <button
          ref={editButtonRef}
          type="button"
          className="icon-button edit-button"
          aria-label={`Редактировать задачу «${task.title}»`}
          onClick={() => {
            setDraft(task.title);
            setEditing(true);
          }}
        >
          <Icon name="edit" />
        </button>
        <button
          type="button"
          className="icon-button delete-button"
          aria-label={`Удалить задачу «${task.title}»`}
          onClick={() => onDelete(task.id)}
        >
          <Icon name="trash" />
        </button>
      </div>
    </li>
  );
}
