import { expect, test } from "@playwright/test";

test.describe("Mind (COS) 3D map", () => {
  test("loads /mind without page errors", async ({ page }) => {
    test.use({ storageState: "tests/fixtures/.auth/user.json" });

    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/mind");

    await expect(page.getByRole("heading", { name: "Cognitive Operating System (COS)" })).toBeVisible();

    // ForceGraph3D renders a canvas (WebGL)
    await expect(page.locator("canvas")).toBeVisible();

    // Give WebGL a moment to initialize
    await page.waitForTimeout(1500);

    expect(pageErrors, `Page errors: ${pageErrors.join(" | ")}`).toEqual([]);
    expect(consoleErrors, `Console errors: ${consoleErrors.join(" | ")}`).toEqual([]);
  });
});

