import assert from "node:assert/strict";
import test from "node:test";
import {
  chartKeyTarget,
  chartMaximum,
  formatChartValue,
  trendSegments,
  validChartValue,
} from "../src/chart-data.ts";

test("earned zero remains distinct from unavailable or invalid academic values", () => {
  assert.equal(formatChartValue(0, "grade"), "0.00 / 5.00");
  assert.equal(formatChartValue(null, "grade"), "Unavailable");
  assert.equal(formatChartValue(5, "grade"), "5.00 / 5.00");
  assert.equal(validChartValue(5.01, "grade"), null);
  assert.equal(validChartValue(Number.NaN, "count"), null);
  assert.equal(validChartValue(-1, "count"), null);
  assert.equal(validChartValue(1.25, "count"), null);
  assert.equal(formatChartValue(1200, "count"), "1,200");
});

test("grade scales stay fixed and a requested count axis never clips real values", () => {
  const data = [{ id: "one", label: "One", value: 7 }];
  assert.equal(chartMaximum(data, "count", 3), 7);
  assert.equal(chartMaximum(data, "count", 12), 12);
  assert.equal(chartMaximum([{ id: "zero", label: "Zero", value: 0 }], "count"), 1);
  assert.equal(chartMaximum([], "grade", 10), 5);
});

test("missing periods break the trend instead of inventing or connecting values", () => {
  const values = [4, null, 0, 3.5];
  const data = values.map((value, index) => ({
    id: String(index),
    label: String(index),
    value,
  }));
  assert.deepEqual(trendSegments(data, "grade"), [
    [{ index: 0, value: 4 }],
    [
      { index: 2, value: 0 },
      { index: 3, value: 3.5 },
    ],
  ]);
  assert.deepEqual(trendSegments([{ id: "one", label: "One", value: 4 }], "grade"), [
    [{ index: 0, value: 4 }],
  ]);
  assert.deepEqual(trendSegments([], "grade"), []);
});

test("keyboard selection reaches both ends without leaving the available data", () => {
  assert.equal(chartKeyTarget("Home", 3, 4), 0);
  assert.equal(chartKeyTarget("End", 0, 4), 3);
  assert.equal(chartKeyTarget("ArrowLeft", 0, 4), 0);
  assert.equal(chartKeyTarget("ArrowRight", 3, 4), 3);
  assert.equal(chartKeyTarget("ArrowDown", 0, 4), 1);
  assert.equal(chartKeyTarget("End", 0, 0), null);
  assert.equal(chartKeyTarget("Tab", 0, 4), null);
});
