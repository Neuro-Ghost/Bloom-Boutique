import { prisma } from "./prisma";

export interface SiteSettings {
  storeName: string;
  storeTagline: string;
  contactEmail: string;
  address: string;
  instagramUrl: string;
  whatsappNumber: string;
}

const defaultSettings: SiteSettings = {
  storeName: "Bloom Boutique",
  storeTagline: "Where femininity meets modesty",
  contactEmail: "",
  address: "Lebanon",
  instagramUrl: "https://www.instagram.com/bloom.byreem/",
  whatsappNumber: "",
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return { ...defaultSettings, ...settingsMap };
  } catch {
    return defaultSettings;
  }
}
