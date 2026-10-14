import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const redis = getRedis();

export const ordersLimiter = redis
  ? new Ratelimit({
      redis,
      prefix: "ratelimit:orders",
      limiter: Ratelimit.slidingWindow(5, "60 s"),
    })
  : null;

export const couponLimiter = redis
  ? new Ratelimit({
      redis,
      prefix: "ratelimit:coupons",
      limiter: Ratelimit.slidingWindow(10, "60 s"),
    })
  : null;

export function getIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "anonymous";
}
