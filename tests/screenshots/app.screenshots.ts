import { mkdir } from "node:fs/promises";
import path from "node:path";
import { test, expect } from "@playwright/test";

test("empty, populated and completed layouts", async ({ page }, testInfo) => {
  const output = path.join(
    "tests",
    "screenshots",
    "output",
    testInfo.project.name,
  );
  await mkdir(output, { recursive: true });
  await page.clock.setFixedTime(new Date("2026-11-16T12:00:00+03:00"));
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => document.fonts.ready);
  await expect(
    page.getByRole("heading", { name: "Мои задачи." }),
  ).toBeVisible();
  await page.screenshot({
    path: path.join(output, "empty.png"),
    fullPage: true,
    scale: "css",
  });

  for (const title of [
    "Закончить то самое тестовое",
    "Прогуляться без телефона",
    "Прочитать 10 страниц любимой книги",
    "Оставить немного времени для себя",
  ]) {
    await page.getByRole("textbox").fill(title);
    await page.getByRole("textbox").press("Enter");
  }
  await page
    .getByRole("checkbox", { name: "Прогуляться без телефона" })
    .check();
  await expect(
    page.getByRole("heading", { name: "Выполнено 1 из 4", exact: true }),
  ).toBeVisible();
  await page.getByRole("heading", { name: "Мои задачи." }).click();
  await page.screenshot({
    path: path.join(output, "populated.png"),
    fullPage: true,
    scale: "css",
  });
  await page.getByRole("button", { name: "Редактировать задачу «Закончить то самое тестовое»", exact: true }).click();
  await page.screenshot({ path: path.join(output, "editing.png"), fullPage: true, scale: "css" });
  await page.getByRole("textbox", { name: "Название задачи", exact: true }).press("Escape");
  for (const checkbox of await page.getByRole("checkbox").all())
    await checkbox.check();
  await page.getByRole("button", { name: /^Активные/ }).click();
  await page.getByRole("heading", { name: "Мои задачи." }).click();
  await page.screenshot({
    path: path.join(output, "completed.png"),
    fullPage: true,
    scale: "css",
  });
});
