import { Hono } from "hono";
import prisma from "@/lib/prisma";
import { ok, internalError } from "@/lib/api/response";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface LandingPageStats {
  totalUsers: number;
  totalPosts: number;
  activeUsers: number;
}

export interface ModelFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  capabilities: string[];
  category: "core" | "scheduling" | "notifications" | "security" | "analytics";
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
  rating: number;
}

export interface LandingPageData {
  stats: LandingPageStats;
  models: ModelFeature[];
  pricingPlans: PricingPlan[];
  testimonials: Testimonial[];
}

// ============================================
// LANDING PAGE ROUTER
// ============================================

const app = new Hono()
  // ============================================
  // GET /api/landing - Get all landing page data
  // ============================================
  .get("/", async (c) => {
    try {
      // Fetch statistics from database
      const [totalUsers, totalPosts] = await Promise.all([
        prisma.user.count(),
        prisma.post.count({ where: { status: "PUBLISHED" } }),
      ]);

      const stats: LandingPageStats = {
        totalUsers,
        totalPosts,
        activeUsers: totalUsers,
      };

      // Model features based on database schema
      const models: ModelFeature[] = [
        {
          id: "user-management",
          name: "User Management",
          description:
            "Comprehensive user system with role-based access control",
          icon: "users",
          capabilities: [
            "User registration and authentication via Better Auth",
            "Role-based access (USER/ADMIN)",
            "Email verification support",
            "Account banning and moderation",
            "Soft delete for data preservation",
            "Session management and security",
          ],
          category: "security",
        },
        {
          id: "content",
          name: "Content Management",
          description: "Full-featured content management system",
          icon: "file-text",
          capabilities: [
            "Create and manage posts with rich content",
            "Categories and tags for organization",
            "Status workflow (Draft, Published, Archived)",
            "Scheduled publishing",
            "Media attachments",
            "SEO optimization with metadata",
          ],
          category: "core",
        },
        {
          id: "notifications",
          name: "Notification System",
          description: "Multi-channel notification delivery",
          icon: "bell",
          capabilities: [
            "Email notification delivery",
            "Reminder system with configurable timing",
            "Notification read status tracking",
            "Type-based categorization (info, reminder, system)",
            "Related entity linking",
            "Audit trail for notifications",
          ],
          category: "notifications",
        },
        {
          id: "audit-logs",
          name: "Audit Logging",
          description: "Comprehensive activity tracking and monitoring",
          icon: "shield",
          capabilities: [
            "Track all entity changes (CREATE, UPDATE, DELETE, VIEW)",
            "Before/after value comparison with JSON",
            "User action attribution",
            "IP address and user agent logging",
            "Entity relationship tracking",
            "Historical data preservation",
          ],
          category: "analytics",
        },
        {
          id: "integrations",
          name: "Authentication & Integrations",
          description:
            "Enterprise-grade authentication and third-party connections",
          icon: "lock",
          capabilities: [
            "Better Auth framework integration",
            "OAuth provider support",
            "Session-based authentication",
            "Rate limiting for security",
            "Verification tokens",
            "Password management",
          ],
          category: "security",
        },
        {
          id: "analytics",
          name: "Analytics & Reporting",
          description: "Data-driven insights and performance metrics",
          icon: "chart",
          capabilities: [
            "Content performance tracking",
            "User engagement analytics",
            "User activity patterns",
            "System utilization metrics",
            "Export capabilities",
            "Dashboard integration",
          ],
          category: "analytics",
        },
      ];

      // Pricing plans
      const pricingPlans: PricingPlan[] = [
        {
          id: "starter",
          name: "Starter",
          price: 0,
          interval: "month",
          description: "Perfect for individuals and small practices",
          features: [
            "Up to 20 posts/month",
            "Basic content features",
            "Email notifications",
            "User authentication",
            "Mobile responsive",
            "Community support",
          ],
          ctaText: "Start Free",
        },
        {
          id: "professional",
          name: "Professional",
          price: 29,
          interval: "month",
          description: "Ideal for growing businesses",
          features: [
            "Unlimited posts",
            "Advanced content management",
            "SMS & Email notifications",
            "Audit logging",
            "Analytics dashboard",
            "Priority email support",
            "API access",
          ],
          highlighted: true,
          ctaText: "Start Trial",
        },
        {
          id: "enterprise",
          name: "Enterprise",
          price: 99,
          interval: "month",
          description: "For large organizations with advanced needs",
          features: [
            "Everything in Professional",
            "Unlimited users",
            "Custom integrations",
            "Dedicated account manager",
            "SLA guarantee",
            "Custom development",
            "On-premise deployment option",
          ],
          ctaText: "Contact Sales",
        },
      ];

      // Testimonials (kept for social proof)
      const testimonials: Testimonial[] = [
        {
          id: "1",
          name: "Sarah Johnson",
          role: "Practice Manager",
          company: "HealthFirst Clinic",
          content:
            "The audit logging and content management system has transformed how we manage our articles. Highly recommended!",
          rating: 5,
        },
        {
          id: "2",
          name: "Michael Chen",
          role: "IT Director",
          company: "TechServe Solutions",
          content:
            "Enterprise-grade security with Better Auth, excellent analytics, and seamless integrations. Our team loves it.",
          rating: 5,
        },
      ];

      const data: LandingPageData = {
        stats,
        models,
        pricingPlans,
        testimonials,
      };

      return ok(c, data);
    } catch (_err) {
      return internalError(c, "Failed to fetch landing page data");
    }
  });

export default app;

export type AppType = typeof app;
