"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InvoiceButtonProps {
  orderId: string;
}

export function InvoiceButton({ orderId }: InvoiceButtonProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => window.print()}
        aria-label={`Print invoice for order ${orderId}`}
      >
        <Printer className="mr-1.5 h-4 w-4" />
        Print
      </Button>
      <a
        href={`/api/pdf/invoice?orderId=${orderId}`}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        <Download className="mr-1.5 h-4 w-4" />
        PDF
      </a>
    </div>
  );
}
