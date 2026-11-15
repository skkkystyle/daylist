import { useState } from "react";
import { Icon } from "./components/Icon";
import { TaskForm } from "./components/TaskForm";
import { TaskFilters } from "./components/TaskFilters";
import { TaskList } from "./components/TaskList";
import { useTasks } from "./hooks/useTasks";
import type { TaskFilter } from "./types";

function pluralTasks(count: number) {
  const last = count % 10;
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "задач";
  return last === 1 ? "задача" : last >= 2 && last <= 4 ? "задачи" : "задач";
}

export default function App() {
  const {
    tasks,
    storageError,
    deleted,
    addTask,
    toggleTask,
    deleteTask,
    undoDelete,
    dismissUndo,
  } = useTasks();
  const [filter, setFilter] = useState<TaskFilter>("all");
  const completed = tasks.filter((task) => task.completed).length;
  const active = tasks.length - completed;
  const counts = { all: tasks.length, active, completed };
  const visibleTasks = tasks.filter(
    (task) =>
      filter === "all" ||
      (filter === "completed" ? task.completed : !task.completed),
  );
  const percentage = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  const allDone = tasks.length > 0 && active === 0;
  const date = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date());
  const weekday = new Intl.DateTimeFormat("ru-RU", { weekday: "long" }).format(
    new Date(),
  );

  function handleAdd(title: string) {
    const added = addTask(title);
    if (added && filter === "completed") setFilter("all");
    return added;
  }

  return (
    <>
      <a className="skip-link" href="#main">
        К задачам
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="./" aria-label="Daylist — главная">
            <span className="brand-mark">
              <Icon name="check" />
            </span>
            daylist<span className="brand-dot">.</span>
          </a>
          <span className="header-note">Твой день. В твоём ритме.</span>
        </div>
      </header>

      <main id="main" className="workspace">
        <div className="page-heading">
          <div>
            <div className="date-label">
              <Icon name="calendar" />
              <time dateTime={new Date().toLocaleDateString("en-CA")}>
                {weekday}, {date}
              </time>
            </div>
            <h1>
              Мои задачи<span className="heading-dot">.</span>
            </h1>
            <p>Чуть меньше в голове. Чуть больше сделано.</p>
          </div>
          <div className="sun" aria-hidden="true">
            <svg viewBox="0 0 88 88" fill="none">
              <circle cx="44" cy="44" r="20" fill="#e6edff" />
              <circle
                cx="44"
                cy="44"
                r="13"
                stroke="#5573d9"
                strokeWidth="1.6"
              />
              <path
                d="M44 9v7M44 72v7M9 44h7M72 44h7M19 19l5 5M64 64l5 5M19 69l5-5M64 24l5-5"
                stroke="#a0b3eb"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M38 47c3 4 9 4 12 0"
                stroke="#5573d9"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <circle cx="38" cy="40" r="1.5" fill="#5573d9" />
              <circle cx="50" cy="40" r="1.5" fill="#5573d9" />
            </svg>
          </div>
        </div>

        <section
          className="progress-card"
          aria-label="Прогресс задач"
        >
          <div className="progress-symbol">
            <Icon name="check" />
          </div>
          <div className="progress-copy">
            <h2>
              {allDone
                ? "Все планы стали делами!"
                : tasks.length
                  ? "Каждая галочка — маленькая победа"
                  : "Большие дела начинаются с маленьких"}
            </h2>
            <p>
              {allDone
                ? "Хорошая работа. Теперь время для себя."
                : tasks.length
                  ? `Выполнено ${completed} из ${tasks.length}. Двигайся в своём темпе.`
                  : "Не обязательно успеть всё. Начни с одного дела."}
            </p>
          </div>
          <div
            className="progress-ring"
            role="progressbar"
            aria-label="Выполнение задач"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
          >
            <svg viewBox="0 0 56 56" aria-hidden="true">
              <circle className="ring-track" cx="28" cy="28" r="23" />
              <circle
                className="ring-value"
                cx="28"
                cy="28"
                r="23"
                strokeDasharray="144.514"
                strokeDashoffset={144.514 * (1 - percentage / 100)}
              />
            </svg>
            <span>
              {percentage}
              <small>%</small>
            </span>
          </div>
        </section>

        <section className="task-panel" aria-label="Управление задачами">
          <TaskForm onAdd={handleAdd} />
          {storageError && (
            <div className="storage-error" role="alert">
              {storageError}
            </div>
          )}
          <div className="list-toolbar">
            <TaskFilters
              selected={filter}
              onChange={setFilter}
              counts={counts}
            />
            <span className="list-caption">Твой список</span>
          </div>
          <TaskList
            tasks={visibleTasks}
            total={tasks.length}
            filter={filter}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onAdd={handleAdd}
          />
          <div className="list-footer">
            <span aria-live="polite" aria-atomic="true">
              {tasks.length
                ? `${active} ${pluralTasks(active)} впереди`
                : "Чистый лист — хорошее начало"}
            </span>
            <span className="save-status">
              <span
                className={`status-dot${storageError ? " status-dot--error" : ""}`}
              />
              {storageError
                ? "Есть проблема с сохранением"
                : "Сохраняется автоматически"}
            </span>
          </div>
        </section>

        <footer className="page-footer">
          <Icon name="lock" />
          <span>Твои задачи остаются в этом браузере. Только для тебя.</span>
        </footer>
      </main>

      {deleted && (
        <div className="toast">
          <span role="status">Задача удалена</span>
          <button
            className="undo-button"
            type="button"
            onClick={() => {
              undoDelete();
              setFilter("all");
            }}
          >
            <Icon name="undo" />
            Отменить
          </button>
          <button
            className="icon-button toast-close"
            type="button"
            aria-label="Закрыть уведомление"
            onClick={dismissUndo}
          >
            <Icon name="close" />
          </button>
        </div>
      )}
    </>
  );
}
