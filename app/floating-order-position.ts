export function calculateFloatingOrderShift(
  viewportHeight: number,
  footerTop: number,
  bottomGap: number,
) {
  const naturalButtonBottom = viewportHeight - bottomGap;
  return Math.min(0, footerTop - naturalButtonBottom);
}
