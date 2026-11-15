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
    editTask,
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
          </div>
        </div>

        <section className="progress-card" aria-label="Прогресс задач">
          <div className="progress-symbol">
            <Icon name="check" />
          </div>
          <div className="progress-copy">
            <h2>
              {allDone
                ? "Все задачи выполнены"
                : tasks.length
                  ? `Выполнено ${completed} из ${tasks.length}`
                  : "Пока нет задач"}
            </h2>
            <p>
              {allDone
                ? "Можно добавить новую задачу."
                : tasks.length
                  ? "Отмечай задачи по мере выполнения."
                  : "Добавь первую задачу в поле ниже."}
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
          </div>
          <TaskList
            tasks={visibleTasks}
            total={tasks.length}
            filter={filter}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
          />
          <div className="list-footer">
            <span aria-live="polite" aria-atomic="true">
              {tasks.length > 0 && `${active} ${pluralTasks(active)} впереди`}
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
          <span>Задачи сохраняются в этом браузере.</span>
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
