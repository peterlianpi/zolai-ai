"use client";

import { useState } from "react";
import { zolaiToolClient } from "@/lib/api/zolai-tools";

export function Toolbox() {
  const [activeTab, setActiveTab] = useState<"dict" | "grammar">("dict");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [grammarResult, setGrammarResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (activeTab === "dict") {
        const data = await zolaiToolClient.searchDictionary(query);
        setResults(data);
      } else {
        const data = await zolaiToolClient.verifyGrammar(query);
        setGrammarResult(data);
      }
    } catch (err) {
      console.error("Tool call failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <h2 className="text-xl font-bold mb-4">Zolai Toolbox</h2>
      <div className="flex gap-4 mb-4">
        <button onClick={() => setActiveTab("dict")} className={`pb-1 ${activeTab === 'dict' ? 'border-b-2 border-primary font-bold' : ''}`}>Dictionary</button>
        <button onClick={() => setActiveTab("grammar")} className={`pb-1 ${activeTab === 'grammar' ? 'border-b-2 border-primary font-bold' : ''}`}>Grammar Check</button>
      </div>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={activeTab === "dict" ? "Search Zolai dictionary..." : "Check sentence grammar..."}
          className="flex-1 p-2 border rounded"
        />
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
        >
          {loading ? "Processing..." : "Run"}
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === "dict" && results.map((res, i) => (
          <div key={i} className="p-3 border rounded">
            <h3 className="font-bold text-lg">{res.headword}</h3>
            <p className="text-sm text-muted-foreground">{res.translations.join(", ")}</p>
          </div>
        ))}
        {activeTab === "grammar" && grammarResult && (
          <div className={`p-3 border rounded ${grammarResult.is_valid ? 'border-green-500' : 'border-red-500'}`}>
            <p className="font-bold">{grammarResult.is_valid ? "Valid" : "Needs Correction"}</p>
            <p>{grammarResult.feedback}</p>
            {grammarResult.suggestions?.map((s: string, i: number) => <p key={i} className="text-sm text-muted-foreground italic">- {s}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}
