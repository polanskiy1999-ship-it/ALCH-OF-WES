import assert from "node:assert/strict";
import test from "node:test";

import { updateCartQuantity } from "../app/cart-quantity.ts";

test("updateCartQuantity removes a product when its quantity reaches zero", () => {
  const current = { bouquet: 2, candle: 1 };

  assert.deepEqual(updateCartQuantity(current, "bouquet", 0), { candle: 1 });
  assert.deepEqual(current, { bouquet: 2, candle: 1 });
});

test("updateCartQuantity limits a product quantity to twenty", () => {
  assert.deepEqual(updateCartQuantity({ bouquet: 19 }, "bouquet", 21), {
    bouquet: 20,
  });
});
