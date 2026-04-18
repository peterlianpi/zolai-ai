import type { Metadata } from "next";
import { PageTitle } from "@/features/home/components";
import { PublicDictionarySearch } from "@/features/dictionary/components/public-dictionary-search";

export const metadata: Metadata = {
  title: "Zolai Dictionary — Search 24,891 Zolai-English Words",
  description: "Search the Zolai-English dictionary with 24,891 Tedim Zolai words, definitions, example sentences, and part-of-speech tags. Free, no account required.",
};

export default function PublicDictionaryPage() {
  return (
    <>
      <PageTitle title="Dictionary" description="Search 24,891 Tedim Zolai words, definitions, and examples." />
      <div className="container mx-auto px-4 py-8">
        <PublicDictionarySearch />
      </div>
    </>
  );
}
