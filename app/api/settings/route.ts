import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

const settingsSchema = z.record(z.string(), z.string());

export async function GET() {
  const settings = await prisma.setting.findMany();
  const settingsMap = settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);

  return NextResponse.json(settingsMap);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = settingSchema.parse(body);

    const setting = await prisma.setting.upsert({
      where: { key: parsed.key },
      update: { value: parsed.value },
      create: { key: parsed.key, value: parsed.value },
    });

    return NextResponse.json(setting);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save setting" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = settingsSchema.parse(body) as Record<string, string>;

    await prisma.$transaction(
      Object.entries(settings).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
