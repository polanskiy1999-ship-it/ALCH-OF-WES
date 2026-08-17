import { pieces } from "../../catalog";

type OrderItem = {
  id: string;
  quantity: number;
};

type OrderBody = {
  name?: unknown;
  telegram?: unknown;
  comment?: unknown;
  company?: unknown;
  items?: unknown;
};

function jsonError(code: string, status: number) {
  return Response.json({ ok: false, code }, { status });
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");

  if (origin) {
    try {
      if (new URL(origin).host !== requestUrl.host) {
        return jsonError("invalid_origin", 403);
      }
    } catch {
      return jsonError("invalid_origin", 403);
    }
  }

  let body: OrderBody;
  try {
    body = (await request.json()) as OrderBody;
  } catch {
    return jsonError("invalid_json", 400);
  }

  if (cleanText(body.company, 120)) {
    return Response.json({ ok: true });
  }

  const name = cleanText(body.name, 80);
  const telegram = cleanText(body.telegram, 80);
  const comment = cleanText(body.comment, 800);

  if (name.length < 2 || telegram.length < 2 || !Array.isArray(body.items)) {
    return jsonError("invalid_order", 400);
  }

  const catalog = new Map(pieces.map((piece) => [piece.id, piece]));
  const normalizedItems: Array<{ title: string; quantity: number }> = [];

  for (const item of body.items.slice(0, 30) as OrderItem[]) {
    if (!item || typeof item.id !== "string") continue;
    const piece = catalog.get(item.id);
    const quantity = Number.isInteger(item.quantity) ? item.quantity : 0;
    if (!piece || quantity < 1 || quantity > 20) continue;
    normalizedItems.push({ title: piece.title, quantity });
  }

  if (normalizedItems.length === 0) {
    return jsonError("empty_order", 400);
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ORDER_CHAT_ID;

  if (!botToken || !chatId) {
    return jsonError("telegram_not_configured", 503);
  }

  const message = [
    "Новый заказ с сайта",
    "",
    `Имя: ${name}`,
    `Telegram: ${telegram}`,
    "",
    "Состав:",
    ...normalizedItems.map((item) => `• ${item.title} — ${item.quantity} шт.`),
    ...(comment ? ["", `Комментарий: ${comment}`] : []),
  ].join("\n");

  let telegramResponse: Response;
  try {
    telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true,
      }),
    });
  } catch {
    return jsonError("telegram_delivery_failed", 502);
  }

  if (!telegramResponse.ok) {
    return jsonError("telegram_delivery_failed", 502);
  }

  return Response.json({ ok: true });
}
