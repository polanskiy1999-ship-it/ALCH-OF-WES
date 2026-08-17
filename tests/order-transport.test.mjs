import assert from "node:assert/strict";
import test from "node:test";

import { submitOrderRequest } from "../app/order-transport.ts";

const payload = {
  name: "Анна",
  telegram: "@anna",
  comment: "",
  company: "",
  items: [{ id: "first-light", quantity: 1 }],
};

test("static site sends orders to the configured Supabase Edge Function", async () => {
  const requests = [];
  const fetchImpl = async (url, init) => {
    requests.push({ url, init });
    return Response.json({ ok: true });
  };

  const response = await submitOrderRequest(payload, {
    config: {
      supabaseUrl: "https://example.supabase.co/",
      publishableKey: "publishable-key",
    },
    fetchImpl,
  });

  assert.equal(response.ok, true);
  assert.equal(requests[0].url, "https://example.supabase.co/functions/v1/order");
  assert.equal(requests[0].init.headers.apikey, "publishable-key");
  assert.equal(requests[0].init.headers.authorization, "Bearer publishable-key");
});

test("Sites deployment keeps using its same-origin API as a rollback", async () => {
  const requests = [];
  const fetchImpl = async (url, init) => {
    requests.push({ url, init });
    return Response.json({ ok: true });
  };

  await submitOrderRequest(payload, {
    config: { supabaseUrl: "", publishableKey: "" },
    fetchImpl,
  });

  assert.equal(requests[0].url, "/api/order");
  assert.equal(requests[0].init.headers.apikey, undefined);
});
