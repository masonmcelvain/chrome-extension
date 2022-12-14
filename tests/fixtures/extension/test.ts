import { test as base, chromium, BrowserContext, Page } from "@playwright/test";
import path from "path";
import links from "./data/links.json";

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  page: Page;
  links: typeof links;
  pageWithLinks: Page;
}>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, "../../../dist/chrome");
    const context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    const page = await context.newPage();
    await page.goto("chrome://extensions/");
    await page.getByRole("button", { name: "Details" }).click();
    const extensionId = page.url().split("?id=")[1];
    await page.close();
    await use(extensionId);
  },
  page: async ({ context, extensionId }, use) => {
    const [page] = context.pages();
    await page.goto(`chrome-extension://${extensionId}/index.html`);
    await use(page);
  },
  links: async ({}, use) => {
    await use(links);
  },
  pageWithLinks: async ({ context, extensionId, links }, use) => {
    const [page] = context.pages();
    await page.goto(`chrome-extension://${extensionId}/index.html`);
    for (const link of links) {
      await addLink(page, link);
    }
    await use(page);
  },
});
export const expect = test.expect;

async function addLink(page: Page, link: typeof links[0]) {
  await page.getByRole("button", { name: "Create new link" }).click();
  await page.getByPlaceholder("Name").fill(link.name);
  await page.getByPlaceholder("Link URL").fill(link.url);
  await page.getByPlaceholder("Image URL").fill(link.imageUrl);
  await page.getByRole("button", { name: "Create", exact: true }).click();
}
