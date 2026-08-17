import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOrderRequest,
  buildTelegramDraft,
} from "../app/order-payload.ts";

const cartItems = [
  {
    piece: { id: "first-light", title: "Первый свет" },
    quantity: 2,
  },
  {
    piece: { id: "honey-sun", title: "Медовое солнце" },
    quantity: 1,
  },
];

test("buildOrderRequest trims contacts and preserves selected quantities", () => {
  const formData = new FormData();
  formData.set("name", "  Анна  ");
  formData.set("telegram", "  @anna  ");
  formData.set("comment", "  К пятнице  ");
  formData.set("company", "  bot-field  ");

  assert.deepEqual(buildOrderRequest(formData, cartItems), {
    name: "Анна",
    telegram: "@anna",
    comment: "К пятнице",
    company: "bot-field",
    items: [
      { id: "first-light", quantity: 2 },
      { id: "honey-sun", quantity: 1 },
    ],
  });
});

test("buildTelegramDraft lists every chosen product and contact", () => {
  assert.equal(
    buildTelegramDraft("Анна", "@anna", "К пятнице", cartItems),
    [
      "Здравствуйте! Хочу заказать:",
      "",
      "• Первый свет — 2 шт.",
      "• Медовое солнце — 1 шт.",
      "",
      "Имя: Анна",
      "Telegram: @anna",
      "Комментарий: К пятнице",
    ].join("\n"),
  );
});
