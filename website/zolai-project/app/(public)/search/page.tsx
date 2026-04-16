import { Hero } from "@/features/home/components";
import { PublicDictionarySearch } from "@/features/dictionary/components/public-dictionary-search";

export default function PublicDictionaryPage() {
  return (
    <>
      <Hero title="Dictionary" breadcrumb={["Home", "Dictionary"]} />
      <div className="container mx-auto px-4 py-8">
        <PublicDictionarySearch />
      </div>
    </>
  );
}
