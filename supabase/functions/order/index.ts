import { createClient } from "npm:@supabase/supabase-js@2";

import { createOrderHandler } from "./core.mjs";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const telegramOrderChatId = Deno.env.get("TELEGRAM_ORDER_CHAT_ID") ?? "";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const allowedOrigins = [
  "https://alchemyofwishes.ru",
  "https://www.alchemyofwishes.ru",
  "https://polanskiy1999-ship-it.github.io",
  "http://localhost:3000",
  "http://localhost:5173",
];

async function loadCatalog() {
  const { data, error } = await supabase
    .from("products")
    .select("id,title")
    .eq("active", true);
  if (error) throw error;
  return new Map((data ?? []).map((product) => [product.id, product.title]));
}

async function saveOrder(order: {
  name: string;
  telegram: string;
  comment: string;
  items: Array<{ id: string; title: string; quantity: number }>;
}) {
  const { data, error } = await supabase.rpc("create_order_with_items", {
    p_customer_name: order.name,
    p_telegram: order.telegram,
    p_comment: order.comment,
    p_items: order.items,
  });
  if (error) throw error;
  return data as string;
}

async function notifyTelegram(order: {
  id: string;
  name: string;
  telegram: string;
  comment: string;
  items: Array<{ title: string; quantity: number }>;
}) {
  if (!telegramBotToken || !telegramOrderChatId) {
    throw new Error("Telegram secrets are not configured");
  }

  const message = [
    "Новый заказ с сайта",
    `Номер: ${order.id}`,
    "",
    `Имя: ${order.name}`,
    `Telegram: ${order.telegram}`,
    "",
    "Состав:",
    ...order.items.map((item) => `• ${item.title} — ${item.quantity} шт.`),
    ...(order.comment ? ["", `Комментарий: ${order.comment}`] : []),
  ].join("\n");

  const response = await fetch(
    `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramOrderChatId,
        text: message,
        disable_web_page_preview: true,
      }),
    },
  );

  if (!response.ok) throw new Error(`Telegram returned ${response.status}`);
}

async function markDeliveryError(id: string) {
  const { error } = await supabase
    .from("orders")
    .update({ status: "delivery_error" })
    .eq("id", id);
  if (error) throw error;
}

Deno.serve(async (request) => {
  try {
    const catalog = await loadCatalog();
    const handler = createOrderHandler({
      allowedOrigins,
      catalog,
      saveOrder,
      notifyTelegram,
      markDeliveryError,
    });
    return await handler(request);
  } catch {
    return Response.json({ ok: false, code: "service_unavailable" }, { status: 503 });
  }
});
