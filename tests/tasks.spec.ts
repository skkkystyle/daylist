import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("adds trimmed text with Enter and the button, rejects blank input", async ({
  page,
}) => {
  const input = page.getByRole("textbox", { name: "Что хочется сделать?" });
  await input.fill("   ");
  await input.press("Enter");
  await expect(page.getByRole("alert")).toHaveText(
    "Напиши, что хочешь сделать.",
  );
  await expect(page.getByRole("listitem")).toHaveCount(0);
  await input.fill("  Сделать тестовое  ");
  await input.press("Enter");
  await expect(
    page.getByRole("checkbox", { name: "Сделать тестовое", exact: true }),
  ).toBeVisible();
  await expect(input).toHaveValue("");
  await input.fill("Отправить результат");
  await page.getByRole("button", { name: "Добавить", exact: true }).click();
  await expect(page.getByRole("listitem")).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole("listitem")).toHaveCount(2);
});

test("persists completion, filters tasks, returns a completed task to active", async ({
  page,
}) => {
  const input = page.getByRole("textbox");
  for (const title of ["Первая задача", "Вторая задача"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  await page.getByRole("checkbox", { name: "Первая задача" }).check();
  await page.reload();
  await expect(
    page.getByRole("checkbox", { name: "Первая задача" }),
  ).toBeChecked();
  await page.getByRole("button", { name: /^Активные/ }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(1);
  await expect(
    page.getByRole("checkbox", { name: "Вторая задача" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Выполненные/ }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(1);
  // The task leaves this filter immediately, so verify the resulting list.
  await page.getByRole("checkbox", { name: "Первая задача" }).click();
  await expect(
    page.getByRole("heading", { name: "Первые галочки ещё впереди" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Активные/ }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(2);
  await expect(
    page.getByRole("checkbox", { name: "Первая задача" }),
  ).not.toBeChecked();
});

test("deletes persistently, restores original position and completed state", async ({
  page,
}) => {
  for (const title of ["Первая", "Вторая", "Третья"]) {
    await page.getByRole("textbox").fill(title);
    await page.getByRole("textbox").press("Enter");
  }
  await page.getByRole("checkbox", { name: "Вторая", exact: true }).check();
  await page
    .getByRole("button", { name: "Удалить задачу «Вторая»", exact: true })
    .click();
  await expect(page.getByRole("checkbox")).toHaveCount(2);
  await page.getByRole("button", { name: "Отменить", exact: true }).click();
  await expect(page.getByRole("checkbox").nth(1)).toHaveAccessibleName(
    "Вторая",
  );
  await expect(page.getByRole("checkbox").nth(1)).toBeChecked();
  await page
    .getByRole("button", { name: "Удалить задачу «Вторая»", exact: true })
    .click();
  await page.reload();
  await expect(page.getByRole("checkbox")).toHaveCount(2);
  await expect(
    page.getByRole("checkbox", { name: "Вторая", exact: true }),
  ).toHaveCount(0);
});

test("shows a newly added task when adding from the completed filter", async ({
  page,
}) => {
  await page.getByRole("button", { name: /^Выполненные/ }).click();
  await page.getByRole("textbox").fill("Новая задача");
  await page.getByRole("textbox").press("Enter");
  await expect(page.getByRole("button", { name: /^Все/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    page.getByRole("checkbox", { name: "Новая задача" }),
  ).toBeVisible();
});

test("renders user input as text and keeps a long unbroken title within viewport", async ({
  page,
}) => {
  const title = "<img src=x onerror=alert(1)> " + "длиннаязадача".repeat(18);
  await page.getByRole("textbox").fill(title);
  await page.getByRole("textbox").press("Enter");
  await expect(page.getByRole("checkbox", { name: title })).toBeVisible();
  await expect(page.locator(".task-title img")).toHaveCount(0);
  const fits = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(fits).toBe(true);
});

test("recovers from corrupt storage without overwriting it on load", async ({
  page,
}) => {
  await page.evaluate(() =>
    localStorage.setItem("daylist.tasks.v1", "{broken-json"),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("Не удалось прочитать");
  expect(
    await page.evaluate(() => localStorage.getItem("daylist.tasks.v1")),
  ).toBe("{broken-json");
  await page.getByRole("textbox").fill("Новый список");
  await page.getByRole("textbox").press("Enter");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("checkbox", { name: "Новый список" }),
  ).toBeVisible();
});

test("rejects invalid task shapes and duplicate IDs in storage", async ({
  page,
}) => {
  for (const tasks of [
    [{ id: "1", title: "Задача", completed: "yes" }],
    [
      { id: "1", title: "Первая", completed: false },
      { id: "1", title: "Вторая", completed: true },
    ],
  ]) {
    await page.evaluate(
      (value) =>
        localStorage.setItem(
          "daylist.tasks.v1",
          JSON.stringify({ version: 1, tasks: value }),
        ),
      tasks,
    );
    await page.reload();
    await expect(page.getByRole("alert")).toContainText("Не удалось прочитать");
    await expect(page.getByRole("checkbox")).toHaveCount(0);
  }
});

test("keeps working and warns when storage writes are blocked", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "QuotaExceededError");
    };
  });
  await page.reload();
  await page.getByRole("textbox").fill("Задача в памяти");
  await page.getByRole("textbox").press("Enter");
  await expect(
    page.getByRole("checkbox", { name: "Задача в памяти" }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Не удалось сохранить");
  await page.getByRole("checkbox", { name: "Задача в памяти" }).check();
  await expect(
    page.getByRole("checkbox", { name: "Задача в памяти" }),
  ).toBeChecked();
});

test("supports keyboard entry and completion with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("textbox").focus();
  await page.keyboard.type("Keyboard task");
  await page.keyboard.press("Enter");
  await page.getByRole("checkbox", { name: "Keyboard task" }).focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("checkbox", { name: "Keyboard task" }),
  ).toBeChecked();
  await expect(
    page.getByRole("heading", { name: "Все планы стали делами!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Активные/ }).click();
  await expect(
    page.getByRole("heading", { name: "Всё сделано. Выдыхай!" }),
  ).toBeVisible();
});
