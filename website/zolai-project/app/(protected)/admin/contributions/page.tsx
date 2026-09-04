"use client";
import { useEffect, useState } from "react";

type Contribution = {
  id: string;
  type: string;
  zolaiText: string;
  englishText: string;
  notes?: string;
  status: string;
  createdAt: string;
  submitter?: { name: string; email: string } | null;
};

export default function AdminContributionsPage() {
  const [items, setItems] = useState<Contribution[]>([]);

  async function load() {
    const res = await fetch("/api/contributions");
    setItems(await res.json());
  }

  async function act(id: string, action: "approve" | "reject") {
    await fetch(`/api/contributions/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    load();
  }

  useEffect(() => { load(); }, []);

  const pending = items.filter((i) => i.status === "pending");
  const done = items.filter((i) => i.status !== "pending");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Contributions ({pending.length} pending)</h1>

      {pending.length === 0 && <p className="text-gray-500">No pending contributions.</p>}

      {pending.map((c) => (
        <div key={c.id} className="border rounded p-4 mb-3 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mr-2">{c.type}</span>
              <span className="font-semibold">{c.zolaiText}</span>
              <span className="text-gray-500 mx-2">→</span>
              <span>{c.englishText}</span>
              {c.notes && <p className="text-sm text-gray-500 mt-1">{c.notes}</p>}
              {c.submitter && <p className="text-xs text-gray-400 mt-1">by {c.submitter.name}</p>}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => act(c.id, "approve")}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => act(c.id, "reject")}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}

      {done.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-gray-500 text-sm">Reviewed ({done.length})</summary>
          <div className="mt-2">
            {done.map((c) => (
              <div key={c.id} className="border rounded p-3 mb-2 opacity-60 text-sm">
                <span className={`mr-2 px-2 py-0.5 rounded text-xs ${c.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {c.status}
                </span>
                {c.zolaiText} → {c.englishText}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
