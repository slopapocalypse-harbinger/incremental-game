import { expect, test, type Page } from "@playwright/test";

import { EVENTS } from "../src/game/content";
import { createInitialState } from "../src/game/engine";
import { dismissTip, finishIntro } from "../src/game/guide";
import { encodeSave } from "../src/game/save";
import type { GameState } from "../src/game/types";

const PHONES = [
  { name: "390x844", width: 390, height: 844 },
  { name: "412x915", width: 412, height: 915 },
] as const;

const TABS = ["flock", "plans", "study", "world", "log"] as const;

test("fresh game and Act II stay inside the phone viewport", async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    const mode = sessionStorage.getItem("boot-mode");
    if (mode === "fresh") {
      localStorage.removeItem("bve.campaign");
      localStorage.removeItem("bve.campaign.backup");
      sessionStorage.removeItem("boot-mode");
    }
    const raw = sessionStorage.getItem("boot-save");
    if (raw) {
      localStorage.setItem("bve.campaign", raw);
      sessionStorage.removeItem("boot-save");
    }
  });
  for (const phone of PHONES) {
    await page.setViewportSize({ width: phone.width, height: phone.height });
    await page.goto("/");
    await page.evaluate(() => sessionStorage.setItem("boot-mode", "fresh"));
    await page.reload();
    await expect(page.getByTestId("intro")).toBeVisible();
    await expectNoDocumentOverflow(page, `${phone.name} intro`);
    await shot(page, phone.name, "intro");

    await page.getByTestId("skip-intro").click();
    await expect(page.getByTestId("tip")).toBeVisible();
    await expect(page.getByTestId("tip")).toContainText("Plans");
    await fits(page, `${phone.name} fresh plans`, true);
    await shot(page, phone.name, "tip-plans");

    for (const tab of TABS) {
      await page.getByTestId(`tab-${tab}`).click({ force: true });
      const open = await page.getByTestId(`tab-${tab}`).getAttribute("data-open");
      if (open === "true") {
        await fits(page, `${phone.name} fresh ${tab}`, tab === "plans" || tab === "flock");
        await shot(page, phone.name, `fresh-${tab}`);
      } else {
        await expect(page.getByTestId("tab-locked")).toBeVisible();
        await expectNoDocumentOverflow(page, `${phone.name} locked ${tab}`);
        await expectTabBarOnScreen(page, `${phone.name} locked ${tab}`);
        await shot(page, phone.name, `fresh-${tab}-locked`);
      }
    }

    const payload = encodeSave(actTwo(Date.now()), Date.now());
    await page.evaluate((value) => sessionStorage.setItem("boot-save", value), payload);
    await page.reload();
    await expect(page.getByTestId("intro")).toHaveCount(0);
    await page.getByTestId("tab-plans").click();
    await expect(page.getByTestId("tip")).toContainText("Migration");
    await fits(page, `${phone.name} act II plans`, true);
    await shot(page, phone.name, "act2-plans");
    for (const tab of ["flock", "study", "world", "log"] as const) {
      await page.getByTestId(`tab-${tab}`).click({ force: true });
      await expect(page.getByTestId(`tab-${tab}`)).toHaveAttribute("data-open", "true");
      await fits(page, `${phone.name} act II ${tab}`, tab === "flock" || tab === "world");
    }
  }
});

test("desktop keeps a single screen", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByTestId("skip-intro").click();
  await expectNoDocumentOverflow(page, "desktop fresh");
  await expectTabBarOnScreen(page, "desktop fresh");
  await expect(page.locator(".panel-flock")).toBeVisible();
  await expect(page.locator(".panel-plans")).toBeVisible();
  await expect(page.locator(".panel-world")).toBeHidden();
  await shot(page, "1280x800", "desktop-plans");
});

test("event, season, and doctrine stay inside the phone", async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    const raw = sessionStorage.getItem("boot-save");
    if (raw) {
      localStorage.setItem("bve.campaign", raw);
      sessionStorage.removeItem("boot-save");
    }
  });
  for (const phone of PHONES) {
    await page.setViewportSize({ width: phone.width, height: phone.height });

    await boot(page, eventSave(Date.now()));
    await expect(page.getByTestId("event-sheet")).toBeVisible();
    await expectNoDocumentOverflow(page, `${phone.name} event`);
    await shot(page, phone.name, "event");

    await boot(page, rainy(Date.now()));
    await expect(page.getByTestId("canopy")).toBeVisible();
    await expect(page.getByTestId("season")).toContainText("Soft rain");
    await page.getByTestId("tab-plans").click();
    await fits(page, `${phone.name} rain plans`, true);
    await shot(page, phone.name, "season-rain");

    await boot(page, actTwo(Date.now()));
    await page.getByTestId("tab-study").click();
    await expect(page.getByTestId("doctrine-stewardship")).toBeVisible();
    await expectNoDocumentOverflow(page, `${phone.name} doctrine`);
    await expectTabBarOnScreen(page, `${phone.name} doctrine`);
    await page.locator(".panel-study .plate").scrollIntoViewIfNeeded();
    await shot(page, phone.name, "doctrine");
  }
});

test("knowledge cap is not clipped at phone width", async ({ page }) => {
  await page.addInitScript(() => {
    const raw = sessionStorage.getItem("boot-save");
    if (raw) {
      localStorage.setItem("bve.campaign", raw);
      sessionStorage.removeItem("boot-save");
    }
  });
  await page.setViewportSize({ width: 412, height: 915 });
  let state = finishIntro(createInitialState(Date.now()));
  for (const id of ["plans", "study", "seasons", "doctrine", "migration"]) state = dismissTip(state, id);
  state = {
    ...state,
    act: 2,
    elapsed: 3 * 120 + 20,
    flags: ["seed-cache", "first-nest", "survey", "roost"],
    counts: { nest: 2, archive: 1 },
    doctrine: "stewardship",
    resources: { ...state.resources, seeds: 80, twigs: 40, knowledge: 40 },
    flock: 12,
    roles: { ...state.roles, foragers: 6, weavers: 2, scholars: 0, scouts: 0 },
  };
  await boot(page, state);
  await expect(page.getByTestId("season")).toContainText("Dearth");
  const clip = await page.evaluate(() => {
    const cap = document.querySelector("[data-testid='resource-knowledge'] .chip-inline-cap");
    if (!(cap instanceof HTMLElement)) return "missing";
    const text = cap.textContent ?? "";
    if (!text.includes("350")) return `text:${text}`;
    const capBox = cap.getBoundingClientRect();
    const chip = cap.closest(".chip")?.getBoundingClientRect();
    if (!chip) return "nochip";
    if (capBox.right > chip.right + 1 || capBox.left < chip.left - 1) return "clipped";
    return "ok";
  });
  expect(clip).toBe("ok");
});

async function boot(page: Page, state: GameState): Promise<void> {
  const payload = encodeSave(state, Date.now());
  await page.goto("/");
  await page.evaluate((value) => sessionStorage.setItem("boot-save", value), payload);
  await page.reload();
}

function eventSave(now: number): GameState {
  let state = finishIntro(createInitialState(now));
  for (const id of ["plans", "staffing", "events", "study"]) state = dismissTip(state, id);
  return {
    ...state,
    flags: ["seed-cache", "first-nest", "survey"],
    counts: { nest: 1 },
    pendingEvent: "summer-gale",
    seenEvents: ["summer-gale"],
    resources: { ...state.resources, seeds: 80, twigs: 30, knowledge: 0, influence: 0, starlight: 0 },
  };
}

function rainy(now: number): GameState {
  return { ...actTwo(now), elapsed: 240 };
}

async function shot(page: Page, viewport: string, name: string): Promise<void> {
  const dir = process.env.SCREENSHOT_DIR;
  if (!dir) return;
  if (viewport !== "412x915" && viewport !== "1280x800") return;
  await page.screenshot({ path: `${dir}/${viewport}-${name}.png`, fullPage: false });
}

function actTwo(now: number): GameState {
  let state = finishIntro(createInitialState(now));
  for (const id of ["plans", "staffing", "seasons", "log", "study"]) state = dismissTip(state, id);
  return {
    ...state,
    act: 2,
    elapsed: 180,
    flags: ["seed-cache", "first-nest", "survey", "roost"],
    counts: { nest: 2 },
    resources: { ...state.resources, seeds: 120, twigs: 60, knowledge: 24 },
    flock: 10,
    roles: {
      ...state.roles,
      foragers: 4,
      weavers: 2,
      scouts: 1,
    },
    seenEvents: EVENTS.map((event) => event.id),
  };
}

async function expectNoDocumentOverflow(page: Page, label: string): Promise<void> {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollHeight - root.clientHeight;
  });
  expect(overflow, label).toBeLessThanOrEqual(1);
}

async function expectTabBarOnScreen(page: Page, label: string): Promise<void> {
  const box = await page.evaluate(() => {
    const tab = document.querySelector(".tabs");
    const objective = document.querySelector("[data-testid='objective']");
    if (!tab || !objective) return null;
    const tabBox = tab.getBoundingClientRect();
    const now = objective.getBoundingClientRect();
    return {
      tabTop: tabBox.top,
      tabBottom: tabBox.bottom,
      nowBottom: now.bottom,
      height: window.innerHeight,
    };
  });
  expect(box, label).not.toBeNull();
  if (!box) return;
  expect(box.tabBottom, `${label} tab bar`).toBeLessThanOrEqual(box.height + 1);
  expect(box.tabTop, `${label} tab bar`).toBeGreaterThan(120);
  expect(box.nowBottom, `${label} now card`).toBeLessThanOrEqual(box.tabTop + 1);
}

async function fits(page: Page, label: string, wholeCard: boolean): Promise<void> {
  await expectNoDocumentOverflow(page, label);
  await expectTabBarOnScreen(page, label);
  if (!wholeCard) return;
  const card = await page.evaluate(() => {
    const tab = document.querySelector(".tabs");
    const node = document.querySelector(".panel.on .card, .panel.on .role, .panel.on .scene");
    if (!tab || !node) return null;
    const rect = node.getBoundingClientRect();
    return { bottom: rect.bottom, top: rect.top, tabTop: tab.getBoundingClientRect().top };
  });
  expect(card, `${label} primary`).not.toBeNull();
  if (!card) return;
  expect(card.top, `${label} primary top`).toBeLessThan(card.tabTop);
  expect(card.bottom, `${label} primary bottom`).toBeLessThanOrEqual(card.tabTop + 1);
}
