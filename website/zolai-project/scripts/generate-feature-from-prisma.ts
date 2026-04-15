import fs from "fs";
import path from "path";

const modelName = process.argv[2];

if (!modelName) {
  console.error("Please provide a Prisma model name (e.g., bun run scripts/generate-feature-from-prisma.ts Post)");
  process.exit(1);
}

const prismaPath = path.join(process.cwd(), "prisma/schema.prisma");
const schema = fs.readFileSync(prismaPath, "utf8");

// --- 1. PARSE PRISMA MODEL ---
function parseModel(name: string) {
  const modelRegex = new RegExp(`model\\s+${name}\\s+{[^}]+}`, "s");
  const match = schema.match(modelRegex);
  if (!match) return null;

  const modelBody = match[0];
  const fieldLines = modelBody
    .split("\n")
    .filter(line => line.trim() && !line.trim().startsWith("//") && !line.trim().startsWith("@@") && !line.includes("{"));

  return fieldLines.map(line => {
    const [fieldName, type] = line.trim().split(/\s+/);
    const isOptional = type.endsWith("?");
    const cleanType = type.replace("?", "");
    const isId = line.includes("@id");
    return { fieldName, type: cleanType, isOptional, isId };
  }).filter(f => f.fieldName && f.type && !f.type.includes("[]") && !f.fieldName.startsWith("@"));
}

const fields = parseModel(modelName);
if (!fields) {
  console.error(`Model "${modelName}" not found in schema.prisma`);
  process.exit(1);
}

const kebabCase = modelName.toLowerCase().replace(/ /g, "-");
const pascalCase = modelName;
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

Object.values(paths).forEach(p => {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// --- 2. GENERATE ZOD MAPPINGS ---
const zodFields = fields
  .filter(f => !f.isId && f.fieldName !== "createdAt" && f.fieldName !== "updatedAt")
  .map(f => {
    let zodType = "z.string()";
    if (f.type === "Int" || f.type === "Float") zodType = "z.number()";
    if (f.type === "Boolean") zodType = "z.boolean()";
    if (f.type === "DateTime") zodType = "z.string().datetime()";
    return `  ${f.fieldName}: ${zodType}${f.isOptional ? ".optional()" : ""},`;
  })
  .join("\n");

// --- 3. GENERATE HONO ROUTER (CRUD) ---
const honoTemplate = `import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ok, created, list, notFound, error } from "@/lib/api/response";
import prisma from "@/lib/prisma";
import { ${camelCase}Schema } from "../../features/${kebabCase}/schemas";

const app = new Hono()
  .get("/", async (c) => {
    const items = await prisma.${camelCase}.findMany({ take: 50 });
    return ok(c, items);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const item = await prisma.${camelCase}.findUnique({ where: { id } });
    if (!item) return notFound(c);
    return ok(c, item);
  })
  .post("/", zValidator("json", ${camelCase}Schema), async (c) => {
    const data = c.req.valid("json");
    const item = await prisma.${camelCase}.create({ data });
    return created(c, item);
  })
  .patch("/:id", zValidator("json", ${camelCase}Schema.partial()), async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const item = await prisma.${camelCase}.update({ where: { id }, data });
    return ok(c, item);
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    await prisma.${camelCase}.delete({ where: { id } });
    return ok(c, { deleted: true });
  });

export default app;
`;

// --- 4. GENERATE UI COMPONENT (TABLE) ---
const componentTemplate = `"use client";

import { use${pascalCase} } from "../hooks/use-${kebabCase}";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export function ${pascalCase}View() {
  const { data, isLoading } = use${pascalCase}();

  if (isLoading) return <Loader2 className="animate-spin m-auto" />;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            ${fields.filter(f => !f.isId).map(f => `<TableHead>${f.fieldName}</TableHead>`).join("\n            ")}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item: Record<string, unknown> & { id: string }) => (
            <TableRow key={item.id}>
              ${fields.filter(f => !f.isId).map(f => `<TableCell>{String(item.${f.fieldName})}</TableCell>`).join("\n              ")}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
`;

// --- 5. GENERATE ACTIONS ---
const actionsTemplate = `"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function create${pascalCase}(data: Record<string, unknown>) {
  const item = await prisma.${camelCase}.create({ data });
  revalidatePath("/admin/${kebabCase}");
  return item;
}

export async function delete${pascalCase}(id: string) {
  await prisma.${camelCase}.delete({ where: { id } });
  revalidatePath("/admin/${kebabCase}");
}
`;

// Write remaining files
fs.writeFileSync(paths.honoRouter, honoTemplate);
fs.writeFileSync(paths.featureApi, `import { client } from "@/lib/api/hono-client";\n\nexport async function get${pascalCase}List() {\n  const res = await client.api["${kebabCase}"].$get();\n  return (await res.json()).data;\n}`);
fs.writeFileSync(paths.featureHooks, `import { useQuery } from "@tanstack/react-query";\nimport { get${pascalCase}List } from "../api";\n\nexport function use${pascalCase}() {\n  return useQuery({ queryKey: ["${kebabCase}"], queryFn: get${pascalCase}List });\n}`);
fs.writeFileSync(paths.featureHooksIndex, `export { use${pascalCase} } from "./use-${kebabCase}";\n`);
fs.writeFileSync(paths.featureActions, actionsTemplate);
fs.writeFileSync(paths.featureComponent, componentTemplate);
fs.writeFileSync(paths.featureComponentsIndex, `export { ${pascalCase}View } from "./${kebabCase}-view";\n`);
fs.writeFileSync(paths.featureTypes, `import type { ${pascalCase}Model } from "@/lib/generated/prisma/models";\n\nexport type ${pascalCase} = ${pascalCase}Model;`);
fs.writeFileSync(paths.featureSchema, `import { z } from "zod";\n\nexport const ${camelCase}Schema = z.object({\n${zodFields}\n});`);

// --- 6. AUTO-MOUNT IN route.ts ---
const routeTsPath = "app/api/[[...route]]/route.ts";
let routeTs = fs.readFileSync(routeTsPath, "utf8");

if (!routeTs.includes(`import ${camelCase} from "./${kebabCase}"`)) {
  const lastImportIndex = routeTs.lastIndexOf("import");
  const endOfImportLine = routeTs.indexOf("\n", lastImportIndex) + 1;
  routeTs = routeTs.slice(0, endOfImportLine) + `import ${camelCase} from "./${kebabCase}";\n` + routeTs.slice(endOfImportLine);

  routeTs = routeTs.replace(
    /\.route\("(.+)",\s*(.+)\)/g,
    (match, p1, p2) => match
  );
  
  // Insert before the export type AppType
  routeTs = routeTs.replace(
    /export type AppType/g,
    `  .route("/${kebabCase}", ${camelCase})\nexport type AppType`
  );

  fs.writeFileSync(routeTsPath, routeTs);
}

console.log(`\n✨ AUTOMATED: Feature "${pascalCase}" generated and mounted in API!`);
console.log(`- Scanned schema.prisma for fields.`);
console.log(`- Created CRUD API, hooks, barrels, actions, and table view.`);
console.log(`- Automatically mounted in app/api/[[...route]]/route.ts.`);
console.log(`- Run "bun run audit:features" to verify structure consistency.`);
