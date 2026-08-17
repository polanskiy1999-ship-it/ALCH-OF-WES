import assert from "node:assert/strict";
import test from "node:test";

import { createOrderHandler } from "../supabase/functions/order/core.mjs";

const catalog = new Map([
  ["first-light", "Первый свет"],
  ["cornflower", "Василёк"],
]);

function orderRequest(body, origin = "https://alchemyofwishes.ru") {
  return new Request("https://orders.example/functions/v1/order", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
    },
    body: JSON.stringify(body),
  });
}

test("order handler validates, stores and notifies a normalized order", async () => {
  const stored = [];
  const notified = [];
  const handler = createOrderHandler({
    allowedOrigins: ["https://alchemyofwishes.ru"],
    catalog,
    saveOrder: async (order) => {
      stored.push(order);
      return "order-1";
    },
    notifyTelegram: async (order) => notified.push(order),
    markDeliveryError: async () => {},
  });

  const response = await handler(
    orderRequest({
      name: "  Анна  ",
      telegram: "  @anna  ",
      comment: "  Упаковать в подарок  ",
      items: [
        { id: "first-light", quantity: 2 },
        { id: "missing", quantity: 4 },
      ],
    }),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(stored, [
    {
      name: "Анна",
      telegram: "@anna",
      comment: "Упаковать в подарок",
      items: [{ id: "first-light", title: "Первый свет", quantity: 2 }],
    },
  ]);
  assert.equal(notified[0].id, "order-1");
});

test("order handler blocks foreign origins before storing", async () => {
  let saveCalls = 0;
  const handler = createOrderHandler({
    allowedOrigins: ["https://alchemyofwishes.ru"],
    catalog,
    saveOrder: async () => {
      saveCalls += 1;
      return "never";
    },
    notifyTelegram: async () => {},
    markDeliveryError: async () => {},
  });

  const response = await handler(
    orderRequest(
      {
        name: "Анна",
        telegram: "@anna",
        items: [{ id: "first-light", quantity: 1 }],
      },
      "https://evil.example",
    ),
  );

  assert.equal(response.status, 403);
  assert.equal(saveCalls, 0);
});

test("order handler keeps the saved order when Telegram delivery fails", async () => {
  const marked = [];
  const handler = createOrderHandler({
    allowedOrigins: ["https://alchemyofwishes.ru"],
    catalog,
    saveOrder: async () => "order-2",
    notifyTelegram: async () => {
      throw new Error("Telegram unavailable");
    },
    markDeliveryError: async (id) => marked.push(id),
  });

  const response = await handler(
    orderRequest({
      name: "Анна",
      telegram: "@anna",
      items: [{ id: "cornflower", quantity: 1 }],
    }),
  );

  assert.equal(response.status, 502);
  assert.deepEqual(marked, ["order-2"]);
});

test("order handler silently accepts the honeypot without storing", async () => {
  let saveCalls = 0;
  const handler = createOrderHandler({
    allowedOrigins: ["https://alchemyofwishes.ru"],
    catalog,
    saveOrder: async () => {
      saveCalls += 1;
      return "never";
    },
    notifyTelegram: async () => {},
    markDeliveryError: async () => {},
  });

  const response = await handler(
    orderRequest({ company: "spam", name: "Bot", telegram: "@bot", items: [] }),
  );

  assert.equal(response.status, 200);
  assert.equal(saveCalls, 0);
});
