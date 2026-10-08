import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { Resend } from "resend";
import { z } from "zod";

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

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
  customerEmail: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().email().optional().nullable()
  ),
  address: z.string().min(1),
  city: z.string().min(1),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
  total: z.number().positive(),
});

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

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
        const resend = new Resend(process.env.RESEND_API_KEY);
        const itemsHtml = parsed.items
          .map((item) => {
            const variant = [
              item.size ? `Size: ${escapeHtml(item.size)}` : "",
              item.color ? `Color: ${escapeHtml(item.color)}` : "",
            ]
              .filter(Boolean)
              .join(" · ");
            return `<tr>
              <td style="padding:6px 0">${escapeHtml(item.name)}${variant ? ` (${variant})` : ""}</td>
              <td style="padding:6px 0;text-align:center">x${item.quantity}</td>
              <td style="padding:6px 0;text-align:right">$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>`;
          })
          .join("");

        const settings = await getSettings();
        if (settings.contactEmail) {
          await resend.emails.send({
            from: "Bloom Boutique <orders@bloombyreem.store>",
            to: settings.contactEmail,
            subject: `New order ${order.id.slice(0, 8)} ($${order.total.toFixed(2)})`,
            html: `<div style="font-family:sans-serif;max-width:600px">
              <h2>New order received</h2>
              <p><strong>${escapeHtml(order.customerName)}</strong> · ${escapeHtml(order.customerPhone)}${order.customerEmail ? ` · ${escapeHtml(order.customerEmail)}` : ""}</p>
              <p>${escapeHtml(order.address)}, ${escapeHtml(order.city)}${order.notes ? `<br/>Notes: ${escapeHtml(order.notes)}` : ""}</p>
              <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee">
                ${itemsHtml}
              </table>
              <p style="text-align:right"><strong>Total: $${order.total.toFixed(2)}</strong></p>
            </div>`,
          });
        }

        if (parsed.customerEmail) {
          await resend.emails.send({
            from: "Bloom Boutique <orders@bloombyreem.store>",
            to: parsed.customerEmail,
            subject: `Thank you for your order #${order.id.slice(0, 8)} from Bloom Boutique`,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h2 style="margin-bottom:4px">Thank you, ${escapeHtml(parsed.customerName)}!</h2>
              <p style="color:#555">We received your order <strong>#${order.id.slice(0, 8)}</strong> and will contact you soon at ${escapeHtml(parsed.customerPhone)} to arrange delivery. Payment is cash on delivery.</p>
              <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee;margin-top:16px">
                ${itemsHtml}
              </table>
              <p style="text-align:right"><strong>Total: $${order.total.toFixed(2)}</strong></p>
              <p style="color:#777;font-size:13px;margin-top:16px">Delivering to: ${escapeHtml(parsed.address)}, ${escapeHtml(parsed.city)}</p>
              <p style="color:#777;font-size:13px">Bloom Boutique · bloombyreem.store</p>
            </div>`,
          });
        }
      }
    } catch (emailError) {
      console.error("Order emails failed:", emailError);
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
