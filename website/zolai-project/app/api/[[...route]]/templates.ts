import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { revalidateTag } from 'next/cache'
import prisma from '@/lib/prisma'
import { getSessionUserId, getIpAndUa } from '@/lib/auth/server-guards'
import { toAuditJson } from '@/lib/audit'
import { ok, created, list, notFound, error } from '@/lib/api/response'
import { adminMiddleware } from '@/lib/audit'
import { z } from 'zod'
import { safeDbQuery } from '@/lib/server/safe-db'

// ============================================
// TEMPLATES ROUTER
// ============================================

/**
 * Validation schemas for template operations
 */
const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
  description: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  htmlTemplate: z.string().min(1, 'HTML template is required'),
  cssTemplate: z.string().optional().nullable(),
  slots: z.array(z.string()),
  featured: z.boolean().default(false),
})

const updateTemplateSchema = createTemplateSchema.partial()

/**
 * Templates API endpoints
 */
const templates = new Hono()
  // GET /api/templates - List all templates with optional filtering
  .get('/', async (c) => {
    const page = parseInt(c.req.query('page') ?? '1')
    const limit = parseInt(c.req.query('limit') ?? '50')
    const featured = c.req.query('featured') === 'true'
    const skip = (page - 1) * limit

    const where = featured ? { featured: true } : {}

    let items: Array<{
      id: string
      name: string
      slug: string
      description: string | null
      thumbnail: string | null
      slots: unknown
      featured: boolean
      createdAt: Date
      updatedAt: Date
    }> = []
    let total = 0

    ;[items, total] = await safeDbQuery({
      key: 'templates-list',
      query: () =>
        Promise.all([
          prisma.pageTemplate.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              thumbnail: true,
              slots: true,
              featured: true,
              createdAt: true,
              updatedAt: true,
            },
          }),
          prisma.pageTemplate.count({ where }),
        ]),
      fallback: [[], 0],
      timeoutMs: 4500,
      failureThreshold: 3,
      openMs: 10000,
      logLabel: 'Templates',
    })

    const normalizedItems = items.map((item) => ({
      ...item,
      slots: Array.isArray(item.slots) ? item.slots.filter((slot): slot is string => typeof slot === "string") : [],
    }))

    return list(c, normalizedItems, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  })

  // GET /api/templates/:id - Get a single template by ID
  .get('/:id', async (c) => {
    const id = c.req.param('id')

    const item = await safeDbQuery({
      key: 'template-by-id',
      query: () => prisma.pageTemplate.findUnique({
        where: { id },
      }),
      fallback: null,
      timeoutMs: 4000,
      failureThreshold: 3,
      openMs: 10000,
      logLabel: 'Templates',
    })

    if (!item) {
      return notFound(c, 'Template not found')
    }

    return ok(c, item)
  })

  // GET /api/templates/slug/:slug - Get a template by slug
  .get('/slug/:slug', async (c) => {
    const slug = c.req.param('slug')

    const item = await safeDbQuery({
      key: 'template-by-slug',
      query: () => prisma.pageTemplate.findUnique({
        where: { slug },
      }),
      fallback: null,
      timeoutMs: 4000,
      failureThreshold: 3,
      openMs: 10000,
      logLabel: 'Templates',
    })

    if (!item) {
      return notFound(c, 'Template not found')
    }

    return ok(c, item)
  })

  // POST /api/templates - Create a new template (admin only)
  .post('/', adminMiddleware, zValidator('json', createTemplateSchema), async (c) => {
    const body = c.req.valid('json')
    const userId = await getSessionUserId(c)
    const { ipAddress, userAgent } = await getIpAndUa(c)

    try {
      const item = await prisma.pageTemplate.create({
        data: {
          name: body.name,
          slug: body.slug,
          description: body.description,
          thumbnail: body.thumbnail,
          htmlTemplate: body.htmlTemplate,
          cssTemplate: body.cssTemplate,
          slots: body.slots,
          featured: body.featured,
        },
      })

      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          entityType: 'PageTemplate',
          entityId: item.id,
          newValues: toAuditJson(body),
          ipAddress,
          userAgent,
          createdById: userId,
        },
      })

      revalidateTag('templates', 'max')
      return created(c, item)
    } catch (err) {
      if (err instanceof Error && err.message.includes('Unique constraint failed')) {
        return error(c, 'A template with this slug already exists', 'DUPLICATE_SLUG', 409)
      }
      throw err
    }
  })

  // PATCH /api/templates/:id - Update a template (admin only)
  .patch('/:id', adminMiddleware, zValidator('json', updateTemplateSchema), async (c) => {
    const id = c.req.param('id')
    const body = c.req.valid('json')
    const userId = await getSessionUserId(c)
    const { ipAddress, userAgent } = await getIpAndUa(c)

    const existing = await prisma.pageTemplate.findUnique({
      where: { id },
      select: {
        name: true,
        slug: true,
        description: true,
        thumbnail: true,
        htmlTemplate: true,
        cssTemplate: true,
        slots: true,
        featured: true,
      },
    })

    if (!existing) {
      return notFound(c, 'Template not found')
    }

    try {
      const item = await prisma.pageTemplate.update({
        where: { id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.slug && { slug: body.slug }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail }),
          ...(body.htmlTemplate && { htmlTemplate: body.htmlTemplate }),
          ...(body.cssTemplate !== undefined && { cssTemplate: body.cssTemplate }),
          ...(body.slots && { slots: body.slots }),
          ...(body.featured !== undefined && { featured: body.featured }),
        },
      })

      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          entityType: 'PageTemplate',
          entityId: item.id,
          oldValues: toAuditJson(existing),
          newValues: toAuditJson(body),
          ipAddress,
          userAgent,
          createdById: userId,
        },
      })

      revalidateTag('templates', 'max')
      return ok(c, item)
    } catch (err) {
       if (err instanceof Error && err.message.includes('Unique constraint failed')) {
         return error(c, 'A template with this slug already exists', 'DUPLICATE_SLUG', 409)
       }
       throw err
     }
   })

  // DELETE /api/templates/:id - Delete a template (admin only)
  .delete('/:id', adminMiddleware, async (c) => {
    const id = c.req.param('id')
    const userId = await getSessionUserId(c)
    const { ipAddress, userAgent } = await getIpAndUa(c)

    const existing = await prisma.pageTemplate.findUnique({
      where: { id },
      select: {
        name: true,
        slug: true,
        description: true,
        featured: true,
      },
    })

    if (!existing) {
      return notFound(c, 'Template not found')
    }

    // Check if template is in use
    const postCount = await prisma.post.count({
      where: { templateId: id },
    })

    if (postCount > 0) {
      return error(c, `Cannot delete template. It is being used by ${postCount} post(s).`, 'TEMPLATE_IN_USE', 400)
    }

    const item = await prisma.pageTemplate.delete({
      where: { id },
    })

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'PageTemplate',
        entityId: item.id,
        oldValues: toAuditJson(existing),
        ipAddress,
        userAgent,
        createdById: userId,
      },
    })

    revalidateTag('templates', 'max')
    return ok(c, { message: 'Template deleted' })
  })

export default templates
