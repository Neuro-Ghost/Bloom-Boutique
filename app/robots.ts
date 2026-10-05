import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/cart", "/checkout", "/order-success"],
      },
    ],
    sitemap: "https://www.bloombyreem.store/sitemap.xml",
  };
}
