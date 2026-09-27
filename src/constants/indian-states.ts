/** Indian states and union territories (names as used by India Post). */
export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];

const STATE_ALIASES: Record<string, IndianState> = {
  "national capital territory of delhi": "Delhi",
  "nct of delhi": "Delhi",
  "new delhi": "Delhi",
  orissa: "Odisha",
  pondicherry: "Puducherry",
  "dadra and nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
  "daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
  "the dadra and nagar haveli and daman and diu":
    "Dadra and Nagar Haveli and Daman and Diu",
  uttaranchal: "Uttarakhand",
};

/** Map a free-text state name (OSM / India Post) to our canonical list. */
export function normalizeIndianState(
  raw: string | null | undefined,
): IndianState | "" {
  if (!raw) return "";
  const key = raw
    .trim()
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/\s+/g, " ");
  if (!key) return "";
  const exact = INDIAN_STATES.find((s) => s.toLowerCase() === key);
  return exact ?? STATE_ALIASES[key] ?? "";
}
