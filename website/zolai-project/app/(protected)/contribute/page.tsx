"use client";
import { useState } from "react";

export default function ContributePage() {
  const [tab, setTab] = useState<"word" | "sentence">("word");
  const [form, setForm] = useState({ zolaiText: "", englishText: "", notes: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: tab, ...form }),
    });
    setStatus(res.ok ? "done" : "error");
    if (res.ok) setForm({ zolaiText: "", englishText: "", notes: "" });
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Contribute to Zolai</h1>
      <div className="flex gap-2 mb-6">
        {(["word", "sentence"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded capitalize ${tab === t ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {tab === "word" ? "Zolai Word" : "Zolai Sentence"}
          </label>
          <input
            required
            value={form.zolaiText}
            onChange={(e) => setForm({ ...form, zolaiText: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder={tab === "word" ? "e.g. pasian" : "e.g. Ka pai hi"}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">English</label>
          <input
            required
            value={form.englishText}
            onChange={(e) => setForm({ ...form, englishText: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder={tab === "word" ? "e.g. God" : "e.g. I am going"}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows={2}
          />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {status === "sending" ? "Submitting..." : "Submit"}
        </button>
        {status === "done" && <p className="text-green-600">✅ Submitted! Thank you.</p>}
        {status === "error" && <p className="text-red-600">❌ Something went wrong. Try again.</p>}
      </form>
    </div>
  );
}
