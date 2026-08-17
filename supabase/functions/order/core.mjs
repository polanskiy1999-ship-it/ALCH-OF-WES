function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function responseHeaders(origin, allowedOrigins) {
  const headers = { "content-type": "application/json; charset=utf-8" };
  if (origin && allowedOrigins.includes(origin)) {
    headers["access-control-allow-origin"] = origin;
    headers.vary = "Origin";
  }
  return headers;
}

function jsonResponse(body, status, origin, allowedOrigins) {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(origin, allowedOrigins),
  });
}

export function createOrderHandler({
  allowedOrigins,
  catalog,
  saveOrder,
  notifyTelegram,
  markDeliveryError,
}) {
  return async function handleOrder(request) {
    const origin = request.headers.get("origin") ?? "";

    if (origin && !allowedOrigins.includes(origin)) {
      return jsonResponse({ ok: false, code: "invalid_origin" }, 403, origin, allowedOrigins);
    }

    if (request.method === "OPTIONS") {
      const headers = responseHeaders(origin, allowedOrigins);
      headers["access-control-allow-headers"] = "authorization, apikey, content-type";
      headers["access-control-allow-methods"] = "POST, OPTIONS";
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return jsonResponse({ ok: false, code: "method_not_allowed" }, 405, origin, allowedOrigins);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ ok: false, code: "invalid_json" }, 400, origin, allowedOrigins);
    }

    if (cleanText(body?.company, 120)) {
      return jsonResponse({ ok: true }, 200, origin, allowedOrigins);
    }

    const name = cleanText(body?.name, 80);
    const telegram = cleanText(body?.telegram, 80);
    const comment = cleanText(body?.comment, 800);

    if (name.length < 2 || telegram.length < 2 || !Array.isArray(body?.items)) {
      return jsonResponse({ ok: false, code: "invalid_order" }, 400, origin, allowedOrigins);
    }

    const quantities = new Map();
    for (const item of body.items.slice(0, 30)) {
      if (!item || typeof item.id !== "string") continue;
      const title = catalog.get(item.id);
      if (!title || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
        continue;
      }
      const nextQuantity = (quantities.get(item.id) ?? 0) + item.quantity;
      if (nextQuantity <= 20) quantities.set(item.id, nextQuantity);
    }

    const items = [...quantities.entries()].map(([id, quantity]) => ({
      id,
      title: catalog.get(id),
      quantity,
    }));

    if (items.length === 0) {
      return jsonResponse({ ok: false, code: "empty_order" }, 400, origin, allowedOrigins);
    }

    const order = { name, telegram, comment, items };
    let id;
    try {
      id = await saveOrder(order);
    } catch {
      return jsonResponse({ ok: false, code: "storage_failed" }, 500, origin, allowedOrigins);
    }

    try {
      await notifyTelegram({ id, ...order });
    } catch {
      await markDeliveryError(id).catch(() => {});
      return jsonResponse(
        { ok: false, code: "telegram_delivery_failed", orderId: id },
        502,
        origin,
        allowedOrigins,
      );
    }

    return jsonResponse({ ok: true, orderId: id }, 200, origin, allowedOrigins);
  };
}
