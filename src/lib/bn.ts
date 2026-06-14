// Bengali numeral helpers
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBn(n: number | string): string {
  return String(n).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

export function bnCurrency(n: number): string {
  return `৳${toBn(n.toLocaleString("en-US"))}`;
}