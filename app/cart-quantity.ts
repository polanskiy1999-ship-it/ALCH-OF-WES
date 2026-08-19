export type CartQuantities = Record<string, number>;

export function updateCartQuantity(
  current: CartQuantities,
  pieceId: string,
  quantity: number,
  max = 20,
) {
  const next = { ...current };

  if (quantity <= 0) {
    delete next[pieceId];
  } else {
    next[pieceId] = Math.min(quantity, max);
  }

  return next;
}
