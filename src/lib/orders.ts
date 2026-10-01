import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getOrderForUser(id: string, userId: string) {
  if (!UUID.test(id)) return null;
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, userId)))
    .limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return { order, items };
}

export async function listOrdersForUser(userId: string) {
  const list = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  if (list.length === 0) return [];
  const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, list.map((o) => o.id)));
  return list.map((o) => ({ order: o, items: items.filter((i) => i.orderId === o.id) }));
}
