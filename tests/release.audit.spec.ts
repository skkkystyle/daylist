import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("accessibility in empty, populated, editing and error states", async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  const findings: unknown[] = [];
  async function audit(state: string) {
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    for (const violation of result.violations)
      findings.push({
        state,
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      });
  }
  await page.goto("/");
  await audit("empty");
  for (const title of ["Проверить клавиатуру", "Проверить контраст"]) {
    await page
      .getByRole("textbox", { name: "Что хочется сделать?" })
      .fill(title);
    await page
      .getByRole("textbox", { name: "Что хочется сделать?" })
      .press("Enter");
  }
  await page
    .getByRole("checkbox", { name: "Проверить контраст", exact: true })
    .check();
  await audit("populated");
  await page
    .getByRole("button", {
      name: "Редактировать задачу «Проверить клавиатуру»",
      exact: true,
    })
    .click();
  await page
    .getByRole("textbox", { name: "Название задачи", exact: true })
    .fill("");
  await page
    .getByRole("textbox", { name: "Название задачи", exact: true })
    .press("Enter");
  await audit("editing-error");
  await page.evaluate(() =>
    localStorage.setItem("daylist.tasks.v1", "{broken"),
  );
  await page.reload();
  await audit("storage-error");
  await testInfo.attach("accessibility-findings", {
    body: JSON.stringify(findings, null, 2),
    contentType: "application/json",
  });
  expect(findings).toEqual([]);
});

test("duplicate titles, last-item deletion and Unicode survive reload", async ({
  page,
}) => {
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "Что хочется сделать?" });
  for (const title of ["Повторяющаяся задача 📋", "Повторяющаяся задача 📋"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  await page.getByRole("checkbox").nth(0).check();
  await page
    .getByRole("button", {
      name: "Удалить задачу «Повторяющаяся задача 📋»",
      exact: true,
    })
    .nth(1)
    .click();
  await page.reload();
  await expect(page.getByRole("checkbox")).toHaveCount(1);
  await expect(page.getByRole("checkbox")).toBeChecked();
  await page
    .getByRole("button", {
      name: "Удалить задачу «Повторяющаяся задача 📋»",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Пока нет задач", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Отменить", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("checkbox")).toBeChecked();
});

test("production resources load without errors and 280-character limit holds", async ({
  page,
}) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      failures.push(`${response.status()} ${new URL(response.url()).pathname}`);
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const input = page.getByRole("textbox", { name: "Что хочется сделать?" });
  await input.fill("я".repeat(300));
  await expect(input).toHaveValue("я".repeat(280));
  await input.press("Enter");
  await page.reload();
  await expect(
    page.getByRole("checkbox", { name: "я".repeat(280), exact: true }),
  ).toBeVisible();
  expect(failures).toEqual([]);
});
