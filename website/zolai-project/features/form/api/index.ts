import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { getSessionUserId, getIpAndUa } from "@/lib/auth/server-guards";
import { toAuditJson } from "@/lib/audit";
import { sendEmail } from "@/lib/email/resend";
import { ok, created, list, notFound, badRequest, forbidden } from "@/lib/api/response";
import { requireMinRole } from "@/lib/auth/server-guards";

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
interface JsonObject { [key: string]: JsonValue; }

const formQuerySchema = z.object({
  isActive: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

const createFormSchema = z.object({
  name: z.string().min(1, "Form name is required").max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(500).optional(),
  fields: z.array(z.object({
    id: z.string(),
    type: z.enum(["text", "email", "textarea", "select", "checkbox", "radio", "number", "tel", "url", "date", "file"]),
    label: z.string(),
    placeholder: z.string().optional(),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
    validation: z.record(z.string(), z.unknown()).optional(),
    order: z.number().int().default(0),
  })),
  settings: z.object({
    notifyEmail: z.string().email().optional(),
    autoReply: z.boolean().default(false),
    autoReplySubject: z.string().optional(),
    autoReplyBody: z.string().optional(),
    successMessage: z.string().optional(),
    honeypot: z.boolean().default(true),
  }).optional(),
});

const updateFormSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
  fields: z.array(z.object({
    id: z.string(),
    type: z.enum(["text", "email", "textarea", "select", "checkbox", "radio", "number", "tel", "url", "date", "file"]),
    label: z.string(),
    placeholder: z.string().optional(),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
    validation: z.record(z.string(), z.unknown()).optional(),
    order: z.number().int().default(0),
  })).optional(),
  settings: z.object({
    notifyEmail: z.string().email().optional(),
    autoReply: z.boolean().default(false),
    autoReplySubject: z.string().optional(),
    autoReplyBody: z.string().optional(),
    successMessage: z.string().optional(),
    honeypot: z.boolean().default(true),
  }).optional(),
  isActive: z.boolean().optional(),
  honeypot: z.boolean().optional(),
  notifyEmail: z.string().email().optional(),
  autoReply: z.boolean().optional(),
  autoReplySubject: z.string().optional(),
  autoReplyBody: z.string().optional(),
  successMessage: z.string().optional(),
});

const submitFormSchema = z.object({
  formSlug: z.string().min(1, "Form slug is required"),
  data: z.record(z.string(), z.unknown()),
  honeypot: z.string().optional(),
});

const forms = new Hono()

   .get("/", zValidator("query", formQuerySchema), async (c) => {
     // Check if user has sufficient role for form listing (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const { isActive, page, limit } = c.req.valid("query");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (isActive === "true") where.isActive = true;
    if (isActive === "false") where.isActive = false;

    const [forms, total] = await Promise.all([
      prisma.form.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.form.count({ where }),
    ]);

    return list(c, forms, { total, page, limit, totalPages: Math.ceil(total / limit) });
  })

  .get("/public", async (c) => {
    const forms = await prisma.form.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        fields: true,
        settings: true,
      },
      orderBy: { name: "asc" },
    });

    return ok(c, forms);
  })

   .get("/:id", async (c) => {
     // Check if user has sufficient role for form details (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const id = c.req.param("id");

    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        _count: { select: { submissions: true } },
      },
    });

    if (!form) {
      return notFound(c, "Form not found");
    }

    return ok(c, form);
  })

  .get("/slug/:slug", async (c) => {
    const slug = c.req.param("slug");

    const form = await prisma.form.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        fields: true,
        settings: true,
        isActive: true,
      },
    });

    if (!form || !form.isActive) {
      return notFound(c, "Form not found");
    }

    return ok(c, form);
  })

   .post("/", zValidator("json", createFormSchema), async (c) => {
     // Check if user has sufficient role for form creation (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    const form = await prisma.form.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        fields: JSON.parse(JSON.stringify(body.fields)),
        settings: body.settings ? JSON.parse(JSON.stringify(body.settings)) : undefined,
        notifyEmail: body.settings?.notifyEmail,
        honeypot: body.settings?.honeypot ?? true,
        autoReply: body.settings?.autoReply ?? false,
        autoReplySubject: body.settings?.autoReplySubject,
        autoReplyBody: body.settings?.autoReplyBody,
        successMessage: body.settings?.successMessage,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "Form",
        entityId: form.id,
        newValues: toAuditJson({ name: body.name, slug: body.slug }),
        ipAddress,
        userAgent,
        createdById: userId,
      },
    });

    return created(c, form);
  })

   .patch("/:id", zValidator("json", updateFormSchema), async (c) => {
     // Check if user has sufficient role for form updates (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    const existing = await prisma.form.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, "Form not found");
    }

    const form = await prisma.form.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.slug && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.fields && { fields: JSON.parse(JSON.stringify(body.fields)) }),
        ...(body.settings && { settings: JSON.parse(JSON.stringify(body.settings)) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.honeypot !== undefined && { honeypot: body.honeypot }),
        ...(body.notifyEmail !== undefined && { notifyEmail: body.notifyEmail }),
        ...(body.autoReply !== undefined && { autoReply: body.autoReply }),
        ...(body.autoReplySubject !== undefined && { autoReplySubject: body.autoReplySubject }),
        ...(body.autoReplyBody !== undefined && { autoReplyBody: body.autoReplyBody }),
        ...(body.successMessage !== undefined && { successMessage: body.successMessage }),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "Form",
        entityId: form.id,
        oldValues: toAuditJson(existing),
        newValues: toAuditJson(body),
        ipAddress,
        userAgent,
        createdById: userId,
      },
    });

    return ok(c, form);
  })

   .delete("/:id", async (c) => {
     // Check if user has sufficient role for form deletion (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const id = c.req.param("id");
    const userId = await getSessionUserId(c);

    const existing = await prisma.form.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, "Form not found");
    }

    await prisma.form.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "Form",
        entityId: id ?? "unknown",
        oldValues: toAuditJson(existing),
        createdById: userId,
      },
    });

    return ok(c, { id });
  })

  .post("/submit", zValidator("json", submitFormSchema), async (c) => {
    const { formSlug, data, honeypot } = c.req.valid("json");
    const { ipAddress, userAgent } = await getIpAndUa(c);

    const form = await prisma.form.findUnique({ where: { slug: formSlug } });
    if (!form || !form.isActive) {
      return notFound(c, "Form not found");
    }

    if (form.honeypot && honeypot) {
      return ok(c, { message: "Submission received" });
    }

    const fields = form.fields as Array<{ id: string; type: string; label: string; required: boolean }>;
    const requiredFields = fields.filter((f) => f.required);
    for (const field of requiredFields) {
      if (data[field.id] === undefined || data[field.id] === null || data[field.id] === "") {
        return badRequest(c, `${field.label} is required`);
      }
    }

    const _submission = await prisma.formSubmission.create({
      data: {
        formId: form.id,
        data: data as unknown as JsonObject,
        ip: ipAddress,
        userAgent,
        isSpam: false,
      },
    });

    await prisma.form.update({
      where: { id: form.id },
      data: { submitCount: { increment: 1 } },
    });

    if (form.notifyEmail) {
      try {
        const fieldSummary = fields
          .filter((f) => data[f.id] !== undefined)
          .map((f) => `${f.label}: ${data[f.id]}`)
          .join("\n");

        await sendEmail({
          to: form.notifyEmail,
          subject: `New submission: ${form.name}`,
          text: `Form: ${form.name}\n\n${fieldSummary}\n\nIP: ${ipAddress}\nUser Agent: ${userAgent}`,
        });
      } catch (error) {
        console.error("[Forms] Failed to send notification email:", error);
      }
    }

    return ok(c, { message: form.successMessage || "Submission received" });
  })

   .get("/:id/submissions", zValidator("query", z.object({
     page: z.coerce.number().default(1),
     limit: z.coerce.number().default(20),
     spam: z.string().optional(),
   })), async (c) => {
     // Check if user has sufficient role for form submissions (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const id = c.req.param("id");
    const { page, limit, spam } = c.req.valid("query");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { formId: id };
    if (spam === "true") where.isSpam = true;
    if (spam === "false") where.isSpam = false;

    const [submissions, total] = await Promise.all([
      prisma.formSubmission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.formSubmission.count({ where }),
    ]);

    return list(c, submissions, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  })

   .delete("/submissions/:id", async (c) => {
     // Check if user has sufficient role for deleting form submissions (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const id = c.req.param("id");

    const existing = await prisma.formSubmission.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, "Submission not found");
    }

    await prisma.formSubmission.delete({ where: { id } });

    return ok(c, { id });
  });

export default forms;
