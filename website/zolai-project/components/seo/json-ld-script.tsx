import Script from "next/script";

export function JsonLdScript({ data }: { data: object }) {
  const record = data as Record<string, unknown>;
  return (
    <Script
      id={`json-ld-${typeof record["@type"] === "string" ? (record["@type"] as string).toLowerCase() : "custom"}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
