import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { Resend } from "resend";
import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  size: z.string().optional(),
  color: z.string().optional(),
});

const orderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().email().optional().nullable(),
  address: z.string().min(1),
  city: z.string().min(1),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
  total: z.number().positive(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: any = {};
  if (status) where.status = status;

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = orderSchema.parse(body);

    const order = await prisma.order.create({
      data: {
        customerName: parsed.customerName,
        customerPhone: parsed.customerPhone,
        customerEmail: parsed.customerEmail,
        address: parsed.address,
        city: parsed.city,
        notes: parsed.notes,
        total: parsed.total,
        items: {
          create: parsed.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
        },
      },
      include: { items: true },
    });

    try {
      if (process.env.RESEND_API_KEY) {
        const settings = await getSettings();
        if (settings.contactEmail) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const itemsHtml = parsed.items
            .map((item) => {
              const variant = [
                item.size ? `Size: ${item.size}` : "",
                item.color ? `Color: ${item.color}` : "",
              ]
                .filter(Boolean)
                .join(" · ");
              return `<tr>
                <td style="padding:6px 0">${item.name}${variant ? ` (${variant})` : ""}</td>
                <td style="padding:6px 0;text-align:center">x${item.quantity}</td>
                <td style="padding:6px 0;text-align:right">$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>`;
            })
            .join("");
          await resend.emails.send({
            from: "Bloom Boutique <orders@bloombyreem.store>",
            to: settings.contactEmail,
            subject: `New order ${order.id.slice(0, 8)} — $${order.total.toFixed(2)}`,
            html: `<div style="font-family:sans-serif;max-width:600px">
              <h2>New order received</h2>
              <p><strong>${order.customerName}</strong> · ${order.customerPhone}${order.customerEmail ? ` · ${order.customerEmail}` : ""}</p>
              <p>${order.address}, ${order.city}${order.notes ? `<br/>Notes: ${order.notes}` : ""}</p>
              <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee">
                ${itemsHtml}
              </table>
              <p style="text-align:right"><strong>Total: $${order.total.toFixed(2)}</strong></p>
            </div>`,
          });
        }
      }
    } catch (emailError) {
      console.error("Order notification email failed:", emailError);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Order creation error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create order", details: message },
      { status: 500 }
    );
  }
}
