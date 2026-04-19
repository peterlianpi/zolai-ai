import fs from "fs";
import path from "path";

const featureName = process.argv[2];

if (!featureName) {
  console.error("Please provide a feature name (e.g., bun run scripts/generate-feature.ts my-feature)");
  process.exit(1);
}

const kebabCase = featureName.toLowerCase().replace(/ /g, "-");
const pascalCase = kebabCase
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join("");
const camelCase = pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);

const paths = {
  honoRouter: `app/api/[[...route]]/${kebabCase}.ts`,
  featureDir: `features/${kebabCase}`,
  featureApi: `features/${kebabCase}/api/index.ts`,
  featureHooks: `features/${kebabCase}/hooks/use-${kebabCase}.ts`,
  featureHooksIndex: `features/${kebabCase}/hooks/index.ts`,
  featureActions: `features/${kebabCase}/actions.ts`,
  featureTypes: `features/${kebabCase}/types.ts`,
  featureSchema: `features/${kebabCase}/schemas/index.ts`,
  featureComponent: `features/${kebabCase}/components/${kebabCase}-view.tsx`,
  featureComponentsIndex: `features/${kebabCase}/components/index.ts`,
};

// Ensure directories exist
Object.values(paths).forEach((p) => {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 1. Hono Router Template
const honoTemplate = `import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ok, created, list, error, notFound } from "@/lib/api/response";
// import prisma from "@/lib/prisma";

const app = new Hono()
  /**
   * GET /api/${kebabCase}
   */
  .get("/", async (c) => {
    return ok(c, { message: "Hello from ${pascalCase} API!" });
  });

export default app;
`;

// 2. Feature API Template
const apiTemplate = `import { client } from "@/lib/api/hono-client";

export async function get${pascalCase}Data() {
  const res = await client.api["${kebabCase}"].$get();
  const json = await res.json();
  
  if (!res.ok) {
    throw new Error(json.error?.message || "Failed to fetch ${kebabCase}");
  }
  
  return json.data;
}
`;

// 3. Feature Hooks Template
const hooksTemplate = `import { useQuery } from "@tanstack/react-query";
import { get${pascalCase}Data } from "../api";

export function use${pascalCase}() {
  return useQuery({
    queryKey: ["${kebabCase}"],
    queryFn: () => get${pascalCase}Data(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
`;

const hooksIndexTemplate = `export { use${pascalCase} } from "./use-${kebabCase}";
`;

// 4. Server Actions Template
const actionsTemplate = `"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Sample Server Action for ${pascalCase}
 */
export async function sample${pascalCase}Action() {
  try {
    // const result = await prisma.${camelCase}.create({ data: ... });
    revalidatePath("/admin/${kebabCase}");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to perform action" };
  }
}
`;

// 5. Component Template
const componentTemplate = `"use client";

import { use${pascalCase} } from "../hooks/use-${kebabCase}";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ${pascalCase}View() {
  const { data, isLoading, error } = use${pascalCase}();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Failed to load ${kebabCase}"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-bold">${pascalCase} Feature</h3>
      <pre className="text-sm bg-muted p-2 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
`;

const componentsIndexTemplate = `export { ${pascalCase}View } from "./${kebabCase}-view";
`;

// 6. Types Template
const typesTemplate = `// import type { ${pascalCase}Model } from "@/lib/generated/prisma/models";

export interface ${pascalCase} {
  id: string;
  name: string;
  createdAt: string;
}
`;

// 7. Schema Template
const schemaTemplate = `import { z } from "zod";

export const ${camelCase}Schema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type ${pascalCase}Input = z.infer<typeof ${camelCase}Schema>;
`;

// Write files
fs.writeFileSync(paths.honoRouter, honoTemplate);
fs.writeFileSync(paths.featureApi, apiTemplate);
fs.writeFileSync(paths.featureHooks, hooksTemplate);
fs.writeFileSync(paths.featureHooksIndex, hooksIndexTemplate);
fs.writeFileSync(paths.featureActions, actionsTemplate);
fs.writeFileSync(paths.featureComponent, componentTemplate);
fs.writeFileSync(paths.featureComponentsIndex, componentsIndexTemplate);
fs.writeFileSync(paths.featureTypes, typesTemplate);
fs.writeFileSync(paths.featureSchema, schemaTemplate);

console.log(`\n✅ Feature "${pascalCase}" generated successfully!\n`);
console.log(`Files created:`);
Object.entries(paths).forEach(([key, value]) => {
  console.log(`  - ${key}: ${value}`);
});

console.log(`\n🚀 Next Steps:`);
console.log(`1. Mount the router in "app/api/[[...route]]/route.ts":`);
console.log(`   import ${camelCase} from "./${kebabCase}";`);
console.log(`   ...`);
console.log(`   const routes = app`);
console.log(`     .route("/${kebabCase}", ${camelCase})`);
console.log(`\n2. Keep client fetchers in "${paths.featureApi}" and React Query hooks in "${paths.featureHooks}".`);
console.log(`3. (Optional) Define Prisma model for "${pascalCase}" in "prisma/schema.prisma".`);
console.log(`4. Update types in "${paths.featureTypes}" to use generated Prisma models.`);
console.log(`5. Run "bun run audit:features" after wiring the feature.\n`);
