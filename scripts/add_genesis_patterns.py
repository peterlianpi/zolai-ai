"""Add Genesis audit patterns to instructions."""
import hashlib
import json
from pathlib import Path

OUT = Path("data/master/combined/instructions.jsonl")
def md5(s): return hashlib.md5(s.encode()).hexdigest()
def c(v):   return " ".join(str(v or "").split()).strip()

seen: set[str] = set()
with OUT.open(encoding="utf-8") as f:
    for line in f:
        try:
            obj = json.loads(line.strip())
            k = c(obj.get("instruction","")) + c(obj.get("output",""))
            if k: seen.add(md5(k))
        except: pass

NEW = [
    ("What are the two forms for ordinal day numbers in Zolai?", "",
     "Two valid forms: 1. TDB77 (1977): ni khatna (1st), ni nihna (2nd), ni thumna (3rd), ni lina (4th), ni nga-na (5th), ni gukna (6th). 2. Tedim Bible 2011 (TDB): ni khat ni (1st), ni nih ni (2nd), ni thum ni (3rd), ni li ni (4th), a ni nga ni (5th), a ni guk ni (6th). Both correct.", "grammar"),
    ("Translate to Zolai (Genesis day formula, Tedim Bible 2011 (TDB)): And the evening and morning were the first day.", "",
     "Nitak hong bei-in zingsang hong tung a, ni khat ni ahi hi.", "religion"),
    ("Translate to Zolai (Genesis day formula, Tedim Bible 2011 (TDB)): And the evening and morning were the second day.", "",
     "Nitak hong bei-in zingsang hong tung a, ni nih ni ahi hi.", "religion"),
    ("Translate to Zolai (Genesis day formula, Tedim Bible 2011 (TDB)): And the evening and morning were the third day.", "",
     "Nitak hong bei-in zingsang hong tung a, ni thum ni ahi hi.", "religion"),
    ("Translate to Zolai (Genesis 1:1 TDB77).", "In the beginning God created the heaven and the earth.",
     "A kipat cil-in Pasian in vantung leh leitung a piangsak hi.", "religion"),
    ("Translate to Zolai (Genesis 1:1 Tedim Bible 2011 (TDB)).", "In the beginning God created the heaven and the earth.",
     "A kipat cilin Pasian in vantung leh leitung a piangsak hi.", "religion"),
    ("Translate to Zolai (Genesis 1:3).", "And God said, Let there be light: and there was light.",
     'Pasian in, "Khuavak om hen," ci hi; tua ciangin khuavak om pah hi.', "religion"),
    ("Translate to Zolai (Genesis 1:26).", "And God said, Let us make man in our image.",
     'Tua ciangin Pasian in, "Eima lim, eimah hong sunin mihing bawl ni."', "religion"),
    ("What is the difference between TDB77 and Tedim Bible 2011 (TDB)?", "",
     "TDB77 (1977): Traditional register, -na ordinal suffix (ni khatna), less consistent 3rd person a marker. Tedim Bible 2011 (TDB): Modern standard, ni [num] ni ordinal pattern (ni khat ni), consistent a marker before verbs, more compound words (limlemeel, neiloin). Both are correct Tedim Zolai.", "grammar"),
    ("Translate to Zolai: And God saw that it was good (Genesis 1:4 style).", "",
     "Pasian in tua khuavak hoih hi, ci-in a mu hi.", "religion"),
    ("What does 'khua mial bikbek' mean in Zolai?", "",
     "'khua mial bikbek' = pitch dark / complete darkness. 'khua mial' = darkness, 'bikbek' = completely/utterly. Used in Genesis 1:2 (Tedim ZVS): 'Tuipi tung tengah khua mial bikbek a...' (Darkness was completely upon the face of the deep.)", "grammar"),
]

added = 0
with OUT.open("a", encoding="utf-8") as f:
    for ins, inp, out, domain in NEW:
        k = md5(c(ins) + c(out))
        if k in seen: continue
        seen.add(k)
        f.write(json.dumps({"instruction": ins, "input": inp, "output": out,
            "source": "bible_genesis_audit", "domain": domain,
            "dialect": "tedim", "category": "instruction"}, ensure_ascii=False) + "\n")
        added += 1

total = sum(1 for _ in OUT.open(encoding="utf-8"))
print(f"Added {added} | Total: {total:,}")
