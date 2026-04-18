import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { ok, internalError, list, unauthorized } from "@/lib/api/response";
import { getSessionUserId } from "@/lib/auth/server-guards";

const agentMemory = new Hono()

  // GET /api/agent-memory/:userId/:agentId — load agent memory for a user session
  .get("/:userId/:agentId", async (c) => {
    try {
      const { userId, agentId } = c.req.param();
      const memories = await prisma.agentMemory.findMany({
        where: { userId, agentId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
        orderBy: { updatedAt: "desc" },
      });
      // Return as key→value map for easy consumption
      const map = Object.fromEntries(memories.map(m => [m.key, m.value]));
      return ok(c, map);
    } catch { return internalError(c, "Failed to load agent memory"); }
  })

  // PUT /api/agent-memory — upsert a memory key
  .put(
    "/",
    zValidator("json", z.object({
      userId:    z.string(),
      agentId:   z.string(),
      key:       z.string(),
      value:     z.unknown(),
      ttlHours:  z.number().optional(),
    })),
    async (c) => {
      const sessionUserId = await getSessionUserId(c);
      if (!sessionUserId) return unauthorized(c);
      try {
        const { userId, agentId, key, value, ttlHours } = c.req.valid("json");
        const expiresAt = ttlHours ? new Date(Date.now() + ttlHours * 3_600_000) : null;
        const memory = await prisma.agentMemory.upsert({
          where: { userId_agentId_key: { userId, agentId, key } },
          create: { userId, agentId, key, value: value as never, expiresAt },
          update: { value: value as never, expiresAt, updatedAt: new Date() },
        });
        return ok(c, memory);
      } catch { return internalError(c, "Failed to save agent memory"); }
    }
  )

  // POST /api/agent-memory/learn — log what the agent learned after a task
  .post(
    "/learn",
    zValidator("json", z.object({
      agentId:  z.string(),
      taskType: z.string(),
      input:    z.unknown().optional(),
      output:   z.unknown().optional(),
      feedback: z.string().optional(),
      lesson:   z.string().optional(),
    })),
    async (c) => {
      const sessionUserId = await getSessionUserId(c);
      if (!sessionUserId) return unauthorized(c);
      try {
        const { agentId, taskType, input, output, feedback, lesson } = c.req.valid("json");
        const log = await prisma.agentLearnLog.create({
          data: { agentId, taskType, input: input as never, output: output as never, feedback, lesson },
        });
        return ok(c, log);
      } catch { return internalError(c, "Failed to log agent learning"); }
    }
  )

  // GET /api/agent-memory/learn/:agentId?taskType=X&limit=20 — retrieve learning history
  .get(
    "/learn/:agentId",
    zValidator("query", z.object({
      taskType: z.string().optional(),
      limit:    z.coerce.number().int().min(1).max(100).default(20),
      page:     z.coerce.number().int().min(1).default(1),
    })),
    async (c) => {
      try {
        const agentId = c.req.param("agentId");
        const { taskType, limit, page } = c.req.valid("query");
        const where = { agentId, ...(taskType && { taskType }) };
        const [logs, total] = await Promise.all([
          prisma.agentLearnLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
          prisma.agentLearnLog.count({ where }),
        ]);
        return list(c, logs, { total, page, limit, totalPages: Math.ceil(total / limit) });
      } catch { return internalError(c, "Failed to fetch learning logs"); }
    }
  );

export default agentMemory;
