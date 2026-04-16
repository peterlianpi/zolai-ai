import { useState } from "react";
import { client } from "@/lib/api/client";

interface Example {
  en?: string;
  zo?: string;
  source?: string;
  reference?: string;
}

interface DictionaryEntry {
  id: string;
  zolai: string;
  english: string;
  pos?: string;
  definition?: string;
  synonyms?: string[];
  antonyms?: string[];
  related?: string[];
  examples?: Example[];
}

export function usePublicDictionarySearch() {
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (query: string, lang: "both" | "zolai" | "english" = "both"): Promise<void> => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await client.api.dictionary.search.$get({
        query: { q: query.trim(), limit: "10", lang },
      });
      const data = await res.json();
      setResults(data.success && Array.isArray(data.data) ? data.data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, searched, search };
}
