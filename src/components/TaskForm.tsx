import { useRef, useState, type FormEvent } from "react";
import { MAX_TITLE_LENGTH } from "../types";
import { Icon } from "./Icon";

export function TaskForm({ onAdd }: { onAdd: (title: string) => boolean }) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Напиши, что хочешь сделать.");
      inputRef.current?.focus();
      return;
    }
    if (onAdd(title)) {
      setTitle("");
      setError("");
      inputRef.current?.focus();
    }
  }

  return (
    <form className="task-form" onSubmit={submit}>
      <label htmlFor="new-task">Что хочется сделать?</label>
      <div className={`input-group${error ? " input-group--error" : ""}`}>
        <Icon name="plus" className="input-icon" />
        <input
          ref={inputRef}
          id="new-task"
          name="task"
          autoComplete="off"
          placeholder="Например, выйти на прогулку"
          maxLength={MAX_TITLE_LENGTH}
          value={title}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "task-error" : "task-hint"}
          onChange={(event) => {
            setTitle(event.target.value);
            setError("");
          }}
        />
        <button className="button button--primary" type="submit">
          <span>Добавить</span>
          <Icon name="arrow" />
        </button>
      </div>
      {error ? (
        <p className="form-error" id="task-error" role="alert">
          {error}
        </p>
      ) : (
        <p className="form-hint" id="task-hint">
          Напиши задачу и нажми «Добавить».{" "}
          <span className="enter-hint">
            <kbd>Enter</kbd> для добавления
          </span>
        </p>
      )}
    </form>
  );
}
