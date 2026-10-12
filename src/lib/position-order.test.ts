import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_POSITION_ORDER, orderPositions } from "./position-order.ts";

const catalog = [
  "standing",
  "spider",
  "lasso",
  "open_guard",
  "de_la_riva",
  "reverse_dlr",
  "single_x",
  "closed_guard",
  "half_guard",
  "deep_half",
  "butterfly",
  "fifty_fifty",
  "turtle",
  "knee_cut_mid",
  "side_control",
  "north_south",
  "knee_on_belly",
  "mount",
  "back",
].map((id) => ({ id }));
const ids = (list: { id: string }[]) => list.map((n) => n.id);
const cards = (...from: (string | null)[]) => from.map((fromNode) => ({ fromNode }));

describe("orderPositions", () => {
  it("uses the BJJ default order for a new athlete", () => {
    const out = ids(orderPositions(catalog, [], "2026-09-30"));
    assert.deepEqual(out, [...DEFAULT_POSITION_ORDER]);
    assert.deepEqual(out.slice(0, 2), ["closed_guard", "half_guard"]);
  });

  it("puts the most-used position first", () => {
    const out = ids(
      orderPositions(
        catalog,
        [{ trainedOn: "2026-09-29", cards: cards("mount", "back", "back", null) }],
        "2026-09-30",
      ),
    );
    assert.deepEqual(out.slice(0, 4), ["back", "mount", "closed_guard", "half_guard"]);
    assert.equal(out.length, catalog.length);
  });

  it("lets recent usage outrank older, heavier usage", () => {
    const out = ids(
      orderPositions(
        catalog,
        [
          { trainedOn: "2026-09-29", cards: cards("half_guard", "half_guard") },
          { trainedOn: "2026-06-01", cards: cards("side_control", "side_control", "side_control") },
        ],
        "2026-09-30",
      ),
    );
    assert.deepEqual(out.slice(0, 2), ["half_guard", "side_control"]);
  });

  it("breaks equal scores by recency, then default order", () => {
    const out = ids(
      orderPositions(
        catalog,
        [{ trainedOn: "2026-09-20", cards: cards("turtle", "spider") }],
        "2026-09-30",
      ),
    );
    assert.deepEqual(out.slice(0, 3), ["turtle", "spider", "closed_guard"]);
  });

  it("keeps unknown catalog ids after the defaults, in catalog order", () => {
    const out = ids(orderPositions([{ id: "zz" }, { id: "mount" }, { id: "yy" }], [], "2026-09-30"));
    assert.deepEqual(out, ["mount", "zz", "yy"]);
  });
});
