export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-IN');
}

export function formatCoin(n: number): string {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function formatRs(n: number): string {
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)} kg`;
  return `${grams} g`;
}

export function gramsToCoins(grams: number): number {
  return grams / 100;
}

export function coinsToRs(coins: number): number {
  return coins * 0.5;
}
