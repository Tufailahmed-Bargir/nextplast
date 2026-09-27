"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  LocateFixed,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { INDIAN_STATES } from "@/constants/indian-states";
import { PIN_CODE_REGEX, pickupAddressSchema } from "@/validations/plastic";
import { mergeAddressParts } from "@/features/geo/lib/address";
import type {
  AddressParts,
  GeoAddressSuggestion,
  PincodeLookupResult,
  ReverseGeocodeResult,
} from "@/features/geo/types";

export interface PickupAddressValue {
  addressParts: AddressParts;
  latitude: number | null;
  longitude: number | null;
  pinLookup: PincodeLookupResult | null;
}

export type PickupAddressErrors = Partial<Record<keyof AddressParts, string>>;

/** Field-level address errors, including the India Post PIN check result. */
export function validatePickupAddress(value: PickupAddressValue): PickupAddressErrors {
  const errors: PickupAddressErrors = {};
  const parsed = pickupAddressSchema.safeParse(value.addressParts);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof AddressParts | undefined;
      if (key && !errors[key]) errors[key] = issue.message;
    }
  }

  const pin = value.addressParts.pinCode.trim();
  const lookup = value.pinLookup?.pinCode === pin ? value.pinLookup : null;
  if (!errors.pinCode && lookup?.status === "not_found") {
    errors.pinCode = "This PIN code doesn't exist";
  }
  if (
    !errors.state &&
    lookup?.status === "found" &&
    lookup.state &&
    value.addressParts.state &&
    lookup.state !== value.addressParts.state
  ) {
    errors.state = `PIN ${pin} is in ${lookup.state}`;
  }
  return errors;
}

interface PickupAddressFieldsProps<T extends PickupAddressValue> {
  value: T;
  onChange: Dispatch<SetStateAction<T>>;
  errors?: PickupAddressErrors;
  onFieldsEdited?: (keys: (keyof AddressParts)[]) => void;
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  const body = (await res.json().catch(() => null)) as
    | { success: true; data: T }
    | { success: false; error?: { message?: string } }
    | null;
  if (!res.ok || !body || !body.success) {
    const message =
      body && !body.success ? body.error?.message : undefined;
    throw new Error(message ?? "Request failed");
  }
  return body.data;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/**
 * Structured pickup address: OSM search, current location, India Post PIN check.
 */
export function PickupAddressFields<T extends PickupAddressValue>({
  value,
  onChange,
  errors = {},
  onFieldsEdited,
}: PickupAddressFieldsProps<T>) {
  const parts = value.addressParts;
  const houseRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoAddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [locating, setLocating] = useState(false);
  const [pinChecking, setPinChecking] = useState(false);

  // Latest callbacks for async effects without re-running them every render.
  const onChangeRef = useRef(onChange);
  const onFieldsEditedRef = useRef(onFieldsEdited);
  useEffect(() => {
    onChangeRef.current = onChange;
    onFieldsEditedRef.current = onFieldsEdited;
  });

  function setField(key: keyof AddressParts, next: string) {
    onChange((prev) => ({
      ...prev,
      addressParts: { ...prev.addressParts, [key]: next },
    }));
    onFieldsEdited?.([key]);
  }

  function applyLookup(
    incoming: Partial<AddressParts>,
    coords: { latitude: number; longitude: number },
  ) {
    onChange((prev) => ({
      ...prev,
      addressParts: mergeAddressParts(prev.addressParts, incoming),
      latitude: coords.latitude,
      longitude: coords.longitude,
    }));
    onFieldsEdited?.(
      (Object.keys(incoming) as (keyof AddressParts)[]).filter((k) =>
        incoming[k]?.trim(),
      ),
    );
    if (!incoming.house?.trim() && !parts.house.trim()) {
      requestAnimationFrame(() => houseRef.current?.focus());
    }
  }

  // Photon type-ahead (debounced).
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({ q });
        if (value.latitude != null && value.longitude != null) {
          params.set("lat", String(value.latitude));
          params.set("lng", String(value.longitude));
        }
        const data = await getJson<{ suggestions: GeoAddressSuggestion[] }>(
          `/api/geo/search?${params}`,
          controller.signal,
        );
        setSuggestions(data.suggestions);
        setActiveIndex(-1);
      } catch {
        if (!controller.signal.aborted) setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 400);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, value.latitude, value.longitude]);

  // India Post PIN lookup whenever a new valid PIN is entered.
  const pin = parts.pinCode.trim();
  const lookedUpPin = value.pinLookup?.pinCode;
  useEffect(() => {
    if (!PIN_CODE_REGEX.test(pin) || lookedUpPin === pin) return;
    const controller = new AbortController();
    setPinChecking(true);
    getJson<PincodeLookupResult>(
      `/api/geo/pincode?pin=${pin}`,
      controller.signal,
    )
      .then((result) => {
        onChangeRef.current((prev) => {
          if (prev.addressParts.pinCode.trim() !== pin) return prev;
          const prevAutoCity =
            prev.pinLookup?.status === "found" ? prev.pinLookup.city : "";
          const nextParts = { ...prev.addressParts };
          if (result.status === "found") {
            if (!nextParts.city.trim() || nextParts.city === prevAutoCity) {
              nextParts.city = result.city;
            }
            if ((INDIAN_STATES as readonly string[]).includes(result.state)) {
              nextParts.state = result.state;
            }
          }
          return { ...prev, addressParts: nextParts, pinLookup: result };
        });
        if (result.status === "found") {
          onFieldsEditedRef.current?.(["city", "state", "pinCode"]);
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        onChangeRef.current((prev) =>
          prev.addressParts.pinCode.trim() === pin
            ? { ...prev, pinLookup: { status: "unavailable", pinCode: pin } }
            : prev,
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setPinChecking(false);
      });
    return () => {
      controller.abort();
      setPinChecking(false);
    };
  }, [pin, lookedUpPin]);

  function selectSuggestion(s: GeoAddressSuggestion) {
    applyLookup(s.parts, { latitude: s.latitude, longitude: s.longitude });
    setQuery("");
    setSuggestions([]);
    setSearchOpen(false);
  }

  function fillFromCurrentLocation() {
    if (!("geolocation" in navigator)) {
      toast.error("Your browser does not support location. Please type your address.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = Number(pos.coords.latitude.toFixed(7));
        const longitude = Number(pos.coords.longitude.toFixed(7));
        onChange((prev) => ({ ...prev, latitude, longitude }));
        try {
          const data = await getJson<ReverseGeocodeResult>(
            `/api/geo/reverse?lat=${latitude}&lng=${longitude}`,
          );
          applyLookup(data.parts, { latitude, longitude });
          toast.success(
            "Address filled from your location. Please check it and add your house / flat number.",
          );
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Couldn't find an address for your location.",
          );
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        toast.error(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. You can type your address instead."
            : "Couldn't get your location. Please type your address.",
        );
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }

  function addLocality(locality: string) {
    const street = parts.street.trim();
    if (street.toLowerCase().includes(locality.toLowerCase())) return;
    setField("street", street ? `${street}, ${locality}` : locality);
  }

  const lookup = value.pinLookup?.pinCode === pin ? value.pinLookup : null;
  const showNoMatches =
    searchOpen && !searching && query.trim().length >= 3 && suggestions.length === 0;
  const hasCoords = value.latitude != null && value.longitude != null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            onKeyDown={(e) => {
              if (!searchOpen || suggestions.length === 0) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => (i + 1) % suggestions.length);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
              } else if (e.key === "Enter" && activeIndex >= 0) {
                e.preventDefault();
                selectSuggestion(suggestions[activeIndex]);
              } else if (e.key === "Escape") {
                setSearchOpen(false);
              }
            }}
            placeholder="Search your area, society or street…"
            className="pl-9 pr-9"
            aria-label="Search address"
            autoComplete="off"
          />
          {searching ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : null}

          {searchOpen && (suggestions.length > 0 || showNoMatches) ? (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
              {suggestions.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSuggestion(s);
                  }}
                  className={cn(
                    "flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
                    idx === activeIndex && "bg-muted",
                  )}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>
                    <span className="block font-medium">{s.label}</span>
                    {s.secondary ? (
                      <span className="block text-xs text-muted-foreground">
                        {s.secondary}
                      </span>
                    ) : null}
                  </span>
                </button>
              ))}
              {showNoMatches ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  No matches. Type your address in the fields below.
                </p>
              ) : null}
              <p className="border-t border-border px-3 py-1 text-[10px] text-muted-foreground">
                Suggestions © OpenStreetMap contributors
              </p>
            </div>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={fillFromCurrentLocation}
          disabled={locating}
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          {locating ? "Locating…" : "Use my current location"}
        </Button>
      </div>

      {hasCoords ? (
        <p className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <MapPin className="h-3.5 w-3.5" />
          Map location saved for the collector.
          <button
            type="button"
            className="inline-flex items-center gap-0.5 text-muted-foreground underline hover:text-foreground"
            onClick={() =>
              onChange((prev) => ({ ...prev, latitude: null, longitude: null }))
            }
          >
            <X className="h-3 w-3" /> Remove
          </button>
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-6">
        <Field
          id="addr-house"
          label="House / Flat no."
          error={errors.house}
          className="sm:col-span-3"
        >
          <Input
            id="addr-house"
            ref={houseRef}
            value={parts.house}
            onChange={(e) => setField("house", e.target.value)}
            placeholder="Flat 12, Sai Residency"
            autoComplete="address-line1"
            aria-invalid={Boolean(errors.house)}
          />
        </Field>
        <Field
          id="addr-landmark"
          label="Landmark (optional)"
          error={errors.landmark}
          className="sm:col-span-3"
        >
          <Input
            id="addr-landmark"
            value={parts.landmark}
            onChange={(e) => setField("landmark", e.target.value)}
            placeholder="Opposite City Bus Stand"
          />
        </Field>
        <Field
          id="addr-street"
          label="Street / Area"
          error={errors.street}
          className="sm:col-span-6"
        >
          <Input
            id="addr-street"
            value={parts.street}
            onChange={(e) => setField("street", e.target.value)}
            placeholder="MG Road, Kothrud"
            autoComplete="address-line2"
            aria-invalid={Boolean(errors.street)}
          />
          {lookup?.status === "found" && lookup.localities.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-muted-foreground">Areas in this PIN:</span>
              {lookup.localities.map((locality) => (
                <button
                  key={locality}
                  type="button"
                  onClick={() => addLocality(locality)}
                  className="rounded-full border border-border px-2 py-0.5 text-xs hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                >
                  {locality}
                </button>
              ))}
            </div>
          ) : null}
        </Field>
        <Field
          id="addr-pin"
          label="PIN code"
          error={errors.pinCode}
          className="sm:col-span-2"
        >
          <Input
            id="addr-pin"
            value={parts.pinCode}
            onChange={(e) =>
              setField("pinCode", e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="411038"
            inputMode="numeric"
            autoComplete="postal-code"
            aria-invalid={Boolean(errors.pinCode)}
          />
          {!errors.pinCode ? <PinStatus checking={pinChecking} lookup={lookup} /> : null}
        </Field>
        <Field
          id="addr-city"
          label="City"
          error={errors.city}
          className="sm:col-span-2"
        >
          <Input
            id="addr-city"
            value={parts.city}
            onChange={(e) => setField("city", e.target.value)}
            placeholder="Pune"
            autoComplete="address-level2"
            aria-invalid={Boolean(errors.city)}
          />
        </Field>
        <Field
          id="addr-state"
          label="State"
          error={errors.state}
          className="sm:col-span-2"
        >
          <select
            id="addr-state"
            className={selectClass}
            value={parts.state}
            onChange={(e) => setField("state", e.target.value)}
            autoComplete="address-level1"
            aria-invalid={Boolean(errors.state)}
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function PinStatus({
  checking,
  lookup,
}: {
  checking: boolean;
  lookup: PincodeLookupResult | null;
}) {
  if (checking) {
    return (
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Checking PIN…
      </p>
    );
  }
  if (!lookup) return null;
  if (lookup.status === "found") {
    return (
      <p className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="h-3 w-3" />
        {[lookup.city, lookup.state].filter(Boolean).join(", ")}
      </p>
    );
  }
  if (lookup.status === "not_found") {
    return (
      <p className="flex items-center gap-1 text-xs text-destructive">
        <AlertCircle className="h-3 w-3" /> This PIN code doesn&apos;t exist
      </p>
    );
  }
  return (
    <p className="text-xs text-muted-foreground">
      Couldn&apos;t verify PIN right now. You can still continue.
    </p>
  );
}
