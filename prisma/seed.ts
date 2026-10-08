import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@bloombyreem.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "bloom123";

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Bloom Admin",
      password: await bcrypt.hash(adminPassword, 10),
    },
  });

  const dresses = await prisma.category.upsert({
    where: { slug: "dresses" },
    update: {},
    create: {
      name: "Dresses",
      slug: "dresses",
      description: "Elegant modest dresses for every occasion.",
    },
  });

  const tops = await prisma.category.upsert({
    where: { slug: "tops" },
    update: {},
    create: {
      name: "Tops",
      slug: "tops",
      description: "Feminine blouses, shirts, and modest tops.",
    },
  });

  const bottoms = await prisma.category.upsert({
    where: { slug: "bottoms" },
    update: {},
    create: {
      name: "Bottoms",
      slug: "bottoms",
      description: "Skirts, pants, and modest bottoms.",
    },
  });

  const sets = await prisma.category.upsert({
    where: { slug: "sets" },
    update: {},
    create: {
      name: "Sets",
      slug: "sets",
      description: "Matching sets curated for effortless style.",
    },
  });

  const products = [
    {
      name: "Blush Midi Dress",
      slug: "blush-midi-dress",
      description:
        "A dreamy blush pink midi dress with gentle pleats, perfect for brunches and special days.",
      price: 65,
      comparePrice: 85,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Blush", "Beige"],
      stock: 12,
      featured: true,
      categoryId: dresses.id,
      fabric: "95% polyester, 5% elastane",
      careInstructions: "Hand wash cold\nDo not bleach\nIron on low",
      measurements: [
        { label: "Length", value: "115 cm" },
        { label: "Sleeve", value: "58 cm" },
      ],
      variantStock: { "XL|Blush": 0, "XL|Beige": 0 },
      soldOut: false,
    },
    {
      name: "Linen Palazzo Pants",
      slug: "linen-palazzo-pants",
      description:
        "Flowy linen palazzo pants in a soft olive tone. Comfortable, modest, and effortlessly chic.",
      price: 48,
      sizes: ["S", "M", "L"],
      colors: ["Olive", "Cream"],
      stock: 20,
      featured: true,
      categoryId: bottoms.id,
      fabric: "100% linen",
      careInstructions: "Machine wash cold, hang to dry",
      measurements: [{ label: "Inseam", value: "72 cm" }],
      variantStock: null,
      soldOut: false,
    },
    {
      name: "Floral Chiffon Blouse",
      slug: "floral-chiffon-blouse",
      description:
        "Delicate chiffon blouse with a subtle floral print and loose fit for modest elegance.",
      price: 42,
      sizes: ["S", "M", "L"],
      colors: ["Ivory", "Sage"],
      stock: 15,
      featured: false,
      categoryId: tops.id,
      fabric: "100% polyester chiffon",
      careInstructions: "Hand wash cold, do not wring",
      measurements: [],
      variantStock: null,
      soldOut: false,
    },
    {
      name: "Sage Knit Set",
      slug: "sage-knit-set",
      description:
        "A cozy matching knit set in sage green. Includes oversized top and wide-leg pants.",
      price: 89,
      comparePrice: 110,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Sage", "Taupe"],
      stock: 8,
      featured: true,
      categoryId: sets.id,
      fabric: "70% acrylic, 30% wool",
      careInstructions: "Hand wash cold\nDry flat",
      measurements: [
        { label: "Top length", value: "68 cm" },
        { label: "Pants length", value: "100 cm" },
      ],
      variantStock: null,
      soldOut: false,
    },
    {
      name: "Pleated Midi Skirt",
      slug: "pleated-midi-skirt",
      description:
        "Classic pleated midi skirt in warm beige. A wardrobe staple for modest dressing.",
      price: 55,
      sizes: ["S", "M", "L"],
      colors: ["Beige", "Black"],
      stock: 18,
      featured: false,
      categoryId: bottoms.id,
      fabric: "100% polyester",
      careInstructions: "Machine wash cold, warm iron",
      measurements: [],
      variantStock: null,
      soldOut: false,
    },
    {
      name: "Pearl Button Cardigan",
      slug: "pearl-button-cardigan",
      description:
        "Soft knit cardigan with pearl buttons. Layer it over dresses or tops for a sweet finish.",
      price: 52,
      sizes: ["S", "M", "L"],
      colors: ["Cream", "Dusty Rose"],
      stock: 10,
      featured: false,
      categoryId: tops.id,
      fabric: "60% cotton, 40% acrylic",
      careInstructions: "Hand wash cold, dry flat",
      measurements: [],
      variantStock: null,
      soldOut: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        images: JSON.stringify(["/placeholder-product.svg"]),
        sizes: JSON.stringify(product.sizes),
        colors: JSON.stringify(product.colors),
        measurements: JSON.stringify(product.measurements),
        variantStock: product.variantStock
          ? JSON.stringify(product.variantStock)
          : null,
      },
    });
  }

  const settings = [
    { key: "storeName", value: "Bloom Boutique" },
    { key: "storeTagline", value: "Where femininity meets modesty" },
    { key: "instagramUrl", value: "https://www.instagram.com/bloom.byreem/" },
    { key: "contactEmail", value: "hello@bloombyreem.com" },
    { key: "address", value: "Lebanon" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log("Seed completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
