import { prisma } from "./prisma";

export async function validateCoupon(code: string, subtotal: number) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim() },
  });

  if (!coupon || !coupon.active) {
    return { valid: false, error: "Invalid or inactive coupon" };
  }

  const discountAmount = subtotal * (coupon.discountPercent / 100);

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount,
    },
  };
}
