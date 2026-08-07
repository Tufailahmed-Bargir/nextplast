/**
 * Application-level configuration constants.
 */
export const appConfig = {
  name: "NexPlast",
  tagline: "Convert Plastic Into Value.",
  description:
    "AI-powered Circular Economy Platform that rewards users with Nature Coins for recycling plastic waste.",
  url: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  supportEmail: "support@nexplast.com",
} as const;

export const natureCoinConfig = {
  /** 1 Nature Coin = 100 grams of standard recyclable plastic */
  gramsPerCoin: 100,
  /** Internal reward value in INR (not cash-convertible) */
  internalValueInr: 0.5,
  /** Coins cannot be exchanged for cash */
  cashConvertible: false,
} as const;
