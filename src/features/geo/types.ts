export interface AddressParts {
  house: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface GeoAddressSuggestion {
  id: string;
  label: string;
  secondary: string;
  parts: Partial<AddressParts>;
  latitude: number;
  longitude: number;
}

export type PincodeLookupResult =
  | {
      status: "found";
      pinCode: string;
      city: string;
      state: string;
      localities: string[];
    }
  | { status: "not_found"; pinCode: string }
  | { status: "unavailable"; pinCode: string };

export interface ReverseGeocodeResult {
  parts: Partial<AddressParts>;
  latitude: number;
  longitude: number;
  displayName: string;
}
