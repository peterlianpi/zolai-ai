import fs from "fs";
import path from "path";

const rootDir = path.join(process.cwd(), "features");
const strict = process.argv.includes("--strict");

interface FeatureReport {
  name: string;
  entries: string[];
  issues: string[];
}

function listEntries(dirPath: string) {
  return fs.readdirSync(dirPath, { withFileTypes: true }).map((entry) => ({
    name: entry.name,
    path: path.join(dirPath, entry.name),
    isDirectory: entry.isDirectory(),
  }));
}

function listFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs.readdirSync(dirPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      return listFiles(entryPath);
    }
    return [entryPath];
  });
}

function getIssueFiles(featurePath: string, folderName: string) {
  return listFiles(path.join(featurePath, folderName)).filter((filePath) =>
    /^use(-|[A-Z])/.test(path.basename(filePath)),
  );
}

function formatRelative(filePath: string) {
  return path.relative(process.cwd(), filePath);
}

function auditFeature(featurePath: string): FeatureReport {
  const featureName = path.basename(featurePath);
  const entries = listEntries(featurePath);
  const issues: string[] = [];

  const rootNames = entries.map((entry) => entry.name);
  const componentHooks = getIssueFiles(featurePath, "components");
  const apiHooks = getIssueFiles(featurePath, "api");

  if (componentHooks.length > 0) {
    issues.push(`hooks found in components/: ${componentHooks.map(formatRelative).join(", ")}`);
  }

  if (apiHooks.length > 0) {
    issues.push(`hooks found in api/: ${apiHooks.map(formatRelative).join(", ")}`);
  }

  if (rootNames.includes("types") && rootNames.includes("types.ts")) {
    issues.push("both types.ts and types/ exist at feature root");
  }

  for (const entry of entries) {
    if (!entry.isDirectory) {
      continue;
    }

    if (listFiles(entry.path).length === 0) {
      issues.push(`empty directory: ${formatRelative(entry.path)}`);
    }
  }

  return {
    name: featureName,
    entries: entries.map((entry) => (entry.isDirectory ? `${entry.name}/` : entry.name)),
    issues,
  };
}

if (!fs.existsSync(rootDir)) {
  console.error("features/ directory not found");
  process.exit(1);
}

const features = listEntries(rootDir)
  .filter((entry) => entry.isDirectory)
  .map((entry) => entry.path)
  .sort((a, b) => a.localeCompare(b));

const reports = features.map(auditFeature);
const totalIssues = reports.reduce((sum, report) => sum + report.issues.length, 0);

console.log("Feature structure audit\n");

for (const report of reports) {
  console.log(`${report.name}: ${report.entries.join(", ") || "(empty)"}`);
  if (report.issues.length === 0) {
    console.log("  ok");
  } else {
    for (const issue of report.issues) {
      console.log(`  - ${issue}`);
    }
  }
  console.log("");
}

console.log(`Features scanned: ${reports.length}`);
console.log(`Issues found: ${totalIssues}`);

if (strict && totalIssues > 0) {
  process.exit(1);
}
