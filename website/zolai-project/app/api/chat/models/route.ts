import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getAllFreeModels,
  getFreeModelsForProvider,
  getRecommendedFreeModels,
  getProvidersWithFreeModels,
  getFreeModelsSummary,
  getAvailableModels,
} from "@/lib/ai/providers";

// GET /api/chat/models - Get all available free models
export async function GET(req: Request) {
  // Check authentication
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider");
  const action = searchParams.get("action") || "all";

  try {
    switch (action) {
      case "providers":
        // Get all providers that have free models
        const providers = getProvidersWithFreeModels();
        return NextResponse.json({
          success: true,
          data: providers,
        });

      case "recommended":
        // Get all recommended free models sorted by quality
        const recommended = getRecommendedFreeModels();
        return NextResponse.json({
          success: true,
          data: recommended,
        });

      case "summary":
        // Get summary of all free models
        const summary = getFreeModelsSummary();
        return NextResponse.json({
          success: true,
          data: summary,
        });

      case "provider":
        // Get free models for specific provider
        if (!provider) {
          return NextResponse.json(
            { error: "Provider parameter required" },
            { status: 400 }
          );
        }
        const providerModels = getFreeModelsForProvider(provider);
        return NextResponse.json({
          success: true,
          data: providerModels,
        });

      case "dynamic":
        // Fetch live models from provider APIs (when available)
        if (!provider) {
          return NextResponse.json(
            { error: "Provider parameter required" },
            { status: 400 }
          );
        }
        try {
          const liveModels = await getAvailableModels(provider);
          return NextResponse.json({
            success: true,
            data: liveModels,
          });
        } catch (error) {
          console.error(`Failed to fetch dynamic models for ${provider}:`, error);
          // Fallback to static models
          const staticModels = getFreeModelsForProvider(provider);
          return NextResponse.json({
            success: true,
            data: staticModels,
            fallback: true,
          });
        }

      case "all":
      default:
        // Get all free models organized by provider
        const allModels = getAllFreeModels();
        const providersList = getProvidersWithFreeModels();
        const recommendedModels = getRecommendedFreeModels();
        const modelsSummary = getFreeModelsSummary();

        return NextResponse.json({
          success: true,
          data: {
            byProvider: allModels,
            providers: providersList,
            recommended: recommendedModels,
            summary: modelsSummary,
          },
        });
    }
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
