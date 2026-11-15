import type { TaskFilter } from "../types";

const filters: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "completed", label: "Выполненные" },
];

type Props = {
  selected: TaskFilter;
  onChange: (filter: TaskFilter) => void;
  counts: Record<TaskFilter, number>;
};

export function TaskFilters({ selected, onChange, counts }: Props) {
  return (
    <div className="task-filters" role="group" aria-label="Фильтр задач">
      {filters.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={`filter-button${selected === value ? " filter-button--selected" : ""}`}
          aria-pressed={selected === value}
          onClick={() => onChange(value)}
        >
          {label}
          <span className="filter-count">{counts[value]}</span>
        </button>
      ))}
    </div>
  );
}
