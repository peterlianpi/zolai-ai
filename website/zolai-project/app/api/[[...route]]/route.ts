import { Hono } from "hono";
import { handle } from "hono/vercel";

import admin from "@/features/admin/server/router";
import checkRole from "@/features/auth/server/check-role";
import checkVerification from "@/features/auth/server/check-verification";
import cookieConsent from "@/features/security/server/cookie-consent-router";
import health from "./health";
import landing from "@/features/home/server/landing-router";
import preferences from "@/features/settings/server/preferences-router";
import revisions from "@/features/content/server/revisions-router";
import roleManagement from "@/features/users/server/role-management-router";
import seo from "@/features/settings/server/seo-router";
import upload from "@/features/media/server/upload-router";

import comments from "@/features/comments/server/router";
import content from "@/features/content/server/router";
import contentSubmission from "@/features/content-submission/api";
import forms from "@/features/form/api";
import media from "@/features/media/server/router";
import menus from "@/features/menus/server/router";
import newsletter from "@/features/newsletter/api";
import notifications from "@/features/notifications/api";
import organizations from "@/features/organization/api";
import profile from "@/features/users/api";
import redirects from "@/features/redirects/server/router";
import security from "@/features/security/api";
import siteSettings from "@/features/settings/server/public-router";
import templates from "@/features/templates/api";
import zolai from "@/features/zolai/api";
import dictionary from "@/features/dictionary/api";
import grammar from "@/features/grammar/api";
import forum from "@/features/forum/api";
import audioPronunciation from "@/features/audio-pronunciation/api";
import translationTools from "@/features/translation-tools/api";
import lessons from "@/features/lessons/api";
import agentMemory from "@/features/agent-memory/api";
import inboundEmail from "@/features/inbound-email/api";
import telegram from "@/features/telegram/api";
import curriculum from "@/features/curriculum/api";
import support from "@/features/support/api";

import { rateLimiter } from "@/lib/rate-limit";
import { csrfMiddleware } from "@/lib/auth/csrf";

const app = new Hono().basePath("/api");
app.use("*", rateLimiter());
app.use("*", csrfMiddleware);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);
export const OPTIONS = handle(app);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/admin", admin)
  .route("/check-role", checkRole)
  .route("/check-verification", checkVerification)
  .route("/comments", comments)
  .route("/content", content)
  .route("/cookie-consent", cookieConsent)
  .route("/content-submission", contentSubmission)
  .route("/forms", forms)
  .route("/health", health)
  .route("/landing", landing)
  .route("/media", media)
  .route("/menus", menus)
  .route("/newsletter", newsletter)
  .route("/notifications", notifications)
  .route("/organizations", organizations)
  .route("/preferences", preferences)
  .route("/profile", profile)
  .route("/redirects", redirects)
  .route("/revisions", revisions)
  .route("/roles", roleManagement)
  .route("/security", security)
  .route("/seo", seo)
  .route("/site-settings", siteSettings)
  .route("/templates", templates)
  .route("/upload", upload)
  .route("/zolai", zolai)
  .route("/dictionary", dictionary)
  .route("/grammar", grammar)
  .route("/forum", forum)
  .route("/audio", audioPronunciation)
  .route("/translation", translationTools)
  .route("/lessons", lessons)
  .route("/agent-memory", agentMemory)
  .route("/inbound-email", inboundEmail)
  .route("/telegram", telegram)
  .route("/curriculum", curriculum)
  .route("/support", support) as const;

export type AppType = typeof routes;
