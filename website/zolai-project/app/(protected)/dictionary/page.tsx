import { DictionarySearch } from "@/features/dictionary/components/dictionary-search";
import { getDictionaryStats } from "@/features/dictionary/server/queries";
import { BookOpen, Star } from "lucide-react";

async function Stats() {
  const { total, confirmed } = await getDictionaryStats();
  return (
    <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
      <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{total.toLocaleString()} words</span>
      <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" />{confirmed.toLocaleString()} confirmed</span>
    </div>
  );
}

export default function DictionaryPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Zolai Dictionary</h1>
        <p className="text-muted-foreground text-sm mt-1">ZO ↔ EN · 24,891 entries with synonyms, antonyms, and bilingual examples</p>
        <Stats />
      </div>
      <DictionarySearch />
    </div>
  );
}
