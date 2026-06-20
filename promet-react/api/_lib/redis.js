import { Redis } from "@upstash/redis";
import { defaultContent } from "./defaults.js";

// Upstash to'g'ridan-to'g'ri yoki Vercel integratsiyasi nomlarini ham qo'llaydi
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const redisReady = Boolean(url && token);
const redis = redisReady ? new Redis({ url, token }) : null;

const CONTENT_KEY = "promet:content";
const LEADS_KEY = "promet:leads";

export async function getContent() {
  if (!redis) return defaultContent;
  const data = await redis.get(CONTENT_KEY);
  return data && typeof data === "object" ? { ...defaultContent, ...data } : defaultContent;
}
export async function setContent(content) {
  if (!redis) throw new Error("Baza ulanmagan (Upstash sozlanmagan)");
  await redis.set(CONTENT_KEY, content);
}
export async function getLeads() {
  if (!redis) return [];
  const data = await redis.get(LEADS_KEY);
  return Array.isArray(data) ? data : [];
}
export async function setLeads(leads) {
  if (!redis) throw new Error("Baza ulanmagan (Upstash sozlanmagan)");
  await redis.set(LEADS_KEY, leads);
}
