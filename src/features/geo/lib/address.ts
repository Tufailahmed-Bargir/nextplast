import type { AddressParts } from "@/features/geo/types";

export const EMPTY_ADDRESS_PARTS: AddressParts = {
  house: "",
  street: "",
  landmark: "",
  city: "",
  state: "",
  pinCode: "",
};

/**
 * Single-line address stored on PickupRequest.address, e.g.
 * "Flat 12, MG Road, Kothrud, Near Bus Stand, Pune, Maharashtra - 411038".
 * Keep in sync with parseComposedAddress.
 */
export function composeAddress(parts: AddressParts): string {
  const head = [
    parts.house.trim(),
    parts.street.trim(),
    parts.landmark.trim() ? `Near ${parts.landmark.trim()}` : "",
    parts.city.trim(),
    parts.state.trim(),
  ]
    .filter(Boolean)
    .join(", ");
  const pin = parts.pinCode.trim();
  return pin ? `${head} - ${pin}` : head;
}

const COMPOSED_ADDRESS =
  /^(.+?), (.+?)(?:, Near (.+?))?, ([^,]+), ([^,]+) - ([1-9]\d{5})$/;

/** Best-effort split of a saved address back into form fields. */
export function parseComposedAddress(address: string | null | undefined): AddressParts {
  const value = (address ?? "").trim();
  if (!value) return { ...EMPTY_ADDRESS_PARTS };

  const match = COMPOSED_ADDRESS.exec(value);
  if (!match) {
    return { ...EMPTY_ADDRESS_PARTS, street: value.slice(0, 200) };
  }

  const [, house, street, landmark, city, state, pinCode] = match;
  return {
    house: house ?? "",
    street: street ?? "",
    landmark: landmark ?? "",
    city: city ?? "",
    state: state ?? "",
    pinCode: pinCode ?? "",
  };
}

/** Overlay non-empty values from a lookup without wiping what the user typed. */
export function mergeAddressParts(
  current: AddressParts,
  incoming: Partial<AddressParts>,
): AddressParts {
  const next = { ...current };
  for (const key of Object.keys(incoming) as (keyof AddressParts)[]) {
    const value = incoming[key]?.trim();
    if (value) next[key] = value;
  }
  return next;
}
