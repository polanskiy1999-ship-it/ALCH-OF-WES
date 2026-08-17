type TelegramChat = {
  id?: number;
  title?: string;
  type?: string;
};

type TelegramUpdate = {
  update_id?: number;
  message?: { chat?: TelegramChat };
  my_chat_member?: { chat?: TelegramChat };
  chat_member?: { chat?: TelegramChat };
};

export async function POST(request: Request) {
  const setupKey = process.env.TELEGRAM_SETUP_KEY;
  const suppliedKey = request.headers.get("x-setup-key");

  if (!setupKey || suppliedKey !== setupKey) {
    return new Response(null, { status: 404 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return Response.json({ ok: false, code: "telegram_not_configured" }, { status: 503 });
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      limit: 100,
      timeout: 0,
      allowed_updates: ["message", "my_chat_member", "chat_member"],
    }),
  });

  if (!response.ok) {
    return Response.json({ ok: false, code: "telegram_lookup_failed" }, { status: 502 });
  }

  const payload = (await response.json()) as { ok?: boolean; result?: TelegramUpdate[] };
  const groups = (payload.result ?? [])
    .flatMap((update) => {
      const chat = update.message?.chat ?? update.my_chat_member?.chat ?? update.chat_member?.chat;
      return chat ? [{ updateId: update.update_id ?? 0, chat }] : [];
    })
    .filter(({ chat }) => chat.type === "group" || chat.type === "supergroup")
    .filter(({ chat }) => typeof chat.id === "number")
    .sort((a, b) => b.updateId - a.updateId);

  const latest = groups[0]?.chat;
  if (!latest?.id) {
    return Response.json({ ok: false, code: "group_not_found" }, { status: 404 });
  }

  return Response.json({
    ok: true,
    chat: { id: latest.id, title: latest.title ?? "", type: latest.type ?? "group" },
  });
}
