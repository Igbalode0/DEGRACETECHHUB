export function naira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG");
}
