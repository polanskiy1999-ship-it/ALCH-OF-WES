export type OrderRequest = {
  name: string;
  telegram: string;
  comment: string;
  company: string;
  items: Array<{ id: string; quantity: number }>;
};

export type OrderCartItem = {
  piece: { id: string; title: string };
  quantity: number;
};

const cleanFormValue = (formData: FormData, name: string, maxLength: number) =>
  String(formData.get(name) ?? "").trim().slice(0, maxLength);

export function buildOrderRequest(
  formData: FormData,
  cartItems: OrderCartItem[],
): OrderRequest {
  return {
    name: cleanFormValue(formData, "name", 80),
    telegram: cleanFormValue(formData, "telegram", 80),
    comment: cleanFormValue(formData, "comment", 800),
    company: cleanFormValue(formData, "company", 120),
    items: cartItems.slice(0, 30).map(({ piece, quantity }) => ({
      id: piece.id,
      quantity,
    })),
  };
}

export function buildTelegramDraft(
  name: string,
  telegram: string,
  comment: string,
  cartItems: OrderCartItem[],
) {
  const lines = [
    "Здравствуйте! Хочу заказать:",
    "",
    ...cartItems.map(({ piece, quantity }) => `• ${piece.title} — ${quantity} шт.`),
    "",
    `Имя: ${name}`,
    `Telegram: ${telegram}`,
  ];

  if (comment) lines.push(`Комментарий: ${comment}`);
  return lines.join("\n");
}
