import "server-only";

/**
 * Payment provider abstraction for future Razorpay / Stripe.
 * Phase 8 records cash as manually confirmed (COD / UPI noted) — no live gateway.
 */

export type CashPaymentInitResult = {
  status: "recorded" | "pending" | "failed";
  provider: string;
  externalId?: string;
  message?: string;
};

export interface PaymentProvider {
  readonly name: string;
  initiateCashPayment(input: {
    orderId: string;
    amountInr: number;
    userId: string;
  }): Promise<CashPaymentInitResult>;
}

/**
 * College-project cash provider: marks cash portion as recorded without a gateway.
 */
export class ManualCashPaymentProvider implements PaymentProvider {
  readonly name = "manual";

  async initiateCashPayment(input: {
    orderId: string;
    amountInr: number;
    userId: string;
  }): Promise<CashPaymentInitResult> {
    if (input.amountInr < 0) {
      return {
        status: "failed",
        provider: this.name,
        message: "Invalid cash amount",
      };
    }
    if (input.amountInr === 0) {
      return {
        status: "recorded",
        provider: this.name,
        externalId: `zero-${input.orderId}`,
      };
    }
    return {
      status: "recorded",
      provider: this.name,
      externalId: `manual-${input.orderId}`,
      message: "Cash / UPI recorded — gateway-ready for Razorpay/Stripe",
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  return new ManualCashPaymentProvider();
}
