import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) =>
  JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));

const plugin = read(".claude-plugin/plugin.json");
const marketplace = read(".claude-plugin/marketplace.json");
const pkg = read("package.json");

test("the marketplace lists exactly this plugin, sourced from the root", () => {
  assert.equal(marketplace.plugins.length, 1);
  const [entry] = marketplace.plugins;
  assert.equal(entry.name, plugin.name);
  assert.equal(entry.source, "./");
});

test("plugin, marketplace and package agree on the version", () => {
  assert.equal(marketplace.plugins[0].version, plugin.version);
  assert.equal(pkg.version, plugin.version);
});
