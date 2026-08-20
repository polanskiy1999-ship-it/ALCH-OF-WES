import assert from "node:assert/strict";
import test from "node:test";

import { calculateFloatingOrderShift } from "../app/floating-order-position.ts";

test("floating order stays fixed while the footer is below it", () => {
  assert.equal(calculateFloatingOrderShift(900, 920, 24), 0);
});

test("floating order stops when its lower edge reaches the footer", () => {
  assert.equal(calculateFloatingOrderShift(900, 840, 24), -36);
  assert.equal(calculateFloatingOrderShift(900, 700, 24), -176);
});
