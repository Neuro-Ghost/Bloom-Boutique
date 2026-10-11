import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = schema.parse(body);

    const result = await validateCoupon(code, subtotal);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, error: "Invalid request" },
        { status: 400 }
      );
    }
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
