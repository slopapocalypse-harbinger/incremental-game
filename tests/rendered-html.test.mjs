import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete game shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Birds vs\. Everything<\/title>/i);
  assert.match(html, /The Sunward Canopy/);
  assert.match(html, /Flock Roles/);
  assert.match(html, /Set Aside a Seed Cache/);
  assert.match(html, /Build the seed cache/);
  assert.match(html, /Seeds(?:<!-- -->)? cap comes from/);
  assert.match(html, /seeds\/s per bird/);
  assert.match(html, /class="wildlife-layer"/);
  assert.doesNotMatch(html, /Choose a Field Plan/);
  assert.doesNotMatch(html, /Research the Next Advantage/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("renders accessible controls and game regions", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /aria-label="Current resources"/);
  assert.match(html, /aria-labelledby="roles-heading"/);
  assert.match(html, /aria-labelledby="atlas-heading"/);
  assert.match(html, /aria-labelledby="decision-heading"/);
  assert.match(html, /Open settings and save tools/);
});
