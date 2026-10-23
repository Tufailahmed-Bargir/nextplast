"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PickupAddressFields,
  validatePickupAddress,
  type PickupAddressErrors,
  type PickupAddressValue,
} from "@/features/plastic/components/pickup-address-fields";
import { parseComposedAddress } from "@/features/geo/lib/address";
import type { AddressParts } from "@/features/geo/types";
import { updatePickupAddressAction } from "@/features/plastic/actions/sell-actions";

interface EditPickupAddressDialogProps {
  listingId: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

function initialValue(props: EditPickupAddressDialogProps): PickupAddressValue {
  return {
    addressParts: parseComposedAddress(props.address),
    latitude: props.latitude,
    longitude: props.longitude,
    pinLookup: null,
  };
}

/**
 * Lets the customer correct the pickup address after submitting.
 */
export function EditPickupAddressDialog(props: EditPickupAddressDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<PickupAddressValue>(() =>
    initialValue(props),
  );
  const [errors, setErrors] = useState<PickupAddressErrors>({});
  const [pending, startTransition] = useTransition();

  const clearErrors = useCallback((keys: (keyof AddressParts)[]) => {
    setErrors((prev) => {
      if (!keys.some((k) => prev[k])) return prev;
      const next = { ...prev };
      for (const k of keys) delete next[k];
      return next;
    });
  }, []);

  function handleOpenChange(next: boolean) {
    if (next) {
      setValue(initialValue(props));
      setErrors({});
    }
    setOpen(next);
  }

  function save() {
    const fieldErrors = validatePickupAddress(value);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      toast.error("Please fix the highlighted address fields.");
      return;
    }
    startTransition(async () => {
      const result = await updatePickupAddressAction({
        listingId: props.listingId,
        addressParts: value.addressParts,
        latitude: value.latitude,
        longitude: value.longitude,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Pickup address updated.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button type="button" variant="outline" size="sm" />}
      >
        <Pencil className="h-3.5 w-3.5" /> Edit address
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit pickup address</DialogTitle>
          <DialogDescription>
            The new address is shared with the admin team and your collector
            right away.
          </DialogDescription>
        </DialogHeader>
        <PickupAddressFields
          value={value}
          onChange={setValue}
          errors={errors}
          onFieldsEdited={clearErrors}
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={save} loading={pending}>
            {pending ? "Saving…" : "Save address"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
