#!/usr/bin/env python3
"""
Generate simple, practical examples for core Zolai vocabulary.
Replaces long Bible verses with short usable sentences.
"""
import json, re
from pathlib import Path
from collections import defaultdict

DATA = Path(str(Path(__file__).resolve().parents[2]) + "/data")

# Simple standalone examples (verified, non-Bible)
SIMPLE = {
    "khat":    [{"zo":"Laibu khat ka nei hi.","en":"I have one book."},{"zo":"Mi khat hong pai hi.","en":"One person came."}],
    "nih":     [{"zo":"Ka tapa nih nei hi.","en":"I have two sons."},{"zo":"Ni nih sung ka om ding hi.","en":"I will stay for two days."}],
    "thum":    [{"zo":"Mi thum hong pai uh hi.","en":"Three people came."},{"zo":"Kum thum khit ciangin...","en":"After three years..."}],
    "li":      [{"zo":"Tapa li nei hi.","en":"He has four sons."}],
    "nga":     [{"zo":"Mi nga om hi.","en":"There are five people."}],
    "sagih":   [{"zo":"Ni sagih sung ka om hi.","en":"I stayed for seven days."}],
    "sawm":    [{"zo":"Mi sawm hong pai uh hi.","en":"Ten people came."}],
    "za":      [{"zo":"Mi za bang om hi.","en":"About a hundred people are there."}],
    "pai":     [{"zo":"Ka pai ding hi.","en":"I will go."},{"zo":"Na pai hiam?","en":"Did you go?"},{"zo":"Ka pai kei hi.","en":"I did not go."}],
    "hong":    [{"zo":"Amah hong pai hi.","en":"He came."},{"zo":"Pasian in eite hong it hi.","en":"God loves us."}],
    "ne":      [{"zo":"Kei in an ka ne hi.","en":"I eat rice."},{"zo":"An na ne khin hiam?","en":"Have you eaten?"}],
    "dawn":    [{"zo":"Tui ka dawn hi.","en":"I drink water."},{"zo":"Ka hei hi, tui pia in.","en":"I am thirsty, give me water."}],
    "dam":     [{"zo":"Ka dam hi.","en":"I am well."},{"zo":"Na dam hiam?","en":"Are you well?"},{"zo":"Ka dam nawn hi.","en":"I am well again."}],
    "it":      [{"zo":"Pasian in eite hong it hi.","en":"God loves us."},{"zo":"Ka pa in kei hong it hi.","en":"My father loves me."},{"zo":"Eite khat leh khat ki-it ni.","en":"Let us love one another."}],
    "itna":    [{"zo":"Pasian in itna ahi hi.","en":"God is love."},{"zo":"Itna in a lungduai thei hi.","en":"Love is patient."}],
    "lungdam": [{"zo":"Ka lungdam hi.","en":"I am glad / thankful."},{"zo":"Lawmthu ka nei hi.","en":"I am grateful."}],
    "pa":      [{"zo":"Ka pa in laibu a sim hi.","en":"My father reads a book."},{"zo":"Na pa koi-ah om hiam?","en":"Where is your father?"}],
    "nu":      [{"zo":"Ka nu in an a bawl hi.","en":"My mother cooks food."},{"zo":"Ka nu in kei hong it hi.","en":"My mother loves me."}],
    "tapa":    [{"zo":"Amah in tapa khat nei hi.","en":"He has one son."}],
    "tanu":    [{"zo":"Ka tanu in sangginna ah pai hi.","en":"My daughter went to school."}],
    "zi":      [{"zo":"Amah in zi khat nei hi.","en":"He has one wife."}],
    "pasal":   [{"zo":"Ka pasal in nasem a sem hi.","en":"My husband works."}],
    "inn":     [{"zo":"Ka inn ah ka om hi.","en":"I am at home."},{"zo":"Inn lian khat om hi.","en":"There is a big house."}],
    "gam":     [{"zo":"Hih gam hoih mahmah hi.","en":"This land is very good."}],
    "pasian":  [{"zo":"Pasian in leitung a piangsak hi.","en":"God created the earth."},{"zo":"Pasian in eite hong it hi.","en":"God loves us."}],
    "topa":    [{"zo":"Topa in kei hong huh hi.","en":"The Lord helped me."},{"zo":"Topa tungah thunget ni.","en":"Let us pray to the Lord."}],
    "si":      [{"zo":"Amah si hi.","en":"He died."},{"zo":"Ka si kei ding hi.","en":"I will not die."}],
    "nungta":  [{"zo":"Ka nungta hi.","en":"I am alive."},{"zo":"Nuntakna an ahi hi.","en":"He is the bread of life."}],
    "zo":      [{"zo":"Nasep a zo hi.","en":"The work is done."},{"zo":"A kiman khin hi.","en":"It is finished."}],
    "thei":    [{"zo":"Ka thei hi.","en":"I know / I can."},{"zo":"Ka thei kei hi.","en":"I do not know."},{"zo":"Na thei hiam?","en":"Do you know?"}],
    "om":      [{"zo":"Pasian om hi.","en":"God exists."},{"zo":"Ka inn ah ka om hi.","en":"I am at home."},{"zo":"Om lo hi.","en":"It does not exist."}],
    "nei":     [{"zo":"Ka tapa nih ka nei hi.","en":"I have two sons."},{"zo":"Bangmah ka nei kei hi.","en":"I have nothing."}],
    "gen":     [{"zo":"Amah in thu a gen hi.","en":"He spoke."},{"zo":"Bang gen ding na hi hiam?","en":"What will you say?"}],
    "mu":      [{"zo":"Ka mu hi.","en":"I saw it."},{"zo":"Na mu hiam?","en":"Did you see?"},{"zo":"Ka mu kei hi.","en":"I did not see."}],
    "lum":     [{"zo":"Ka lum ding hi.","en":"I will sleep."},{"zo":"Ka lum kei hi.","en":"I did not sleep."}],
    "hoih":    [{"zo":"Hih hoih hi.","en":"This is good."},{"zo":"Hoih mahmah hi.","en":"Very good."},{"zo":"Hoih lo hi.","en":"Not good."}],
    "lian":    [{"zo":"Inn lian khat om hi.","en":"There is a big house."},{"zo":"Pasian lian mahmah hi.","en":"God is very great."}],
    "tawm":    [{"zo":"Mi tawm bek om hi.","en":"There are only a few people."}],
    "tampi":   [{"zo":"Mi tampi hong pai uh hi.","en":"Many people came."},{"zo":"Tampi ka nei kei hi.","en":"I do not have much."}],
    "khua":    [{"zo":"Ka khua ah ka om hi.","en":"I am in my village."}],
    "ni":      [{"zo":"Tu ni hoih hi.","en":"Today is good."},{"zo":"Ni khat sung ka pai ding hi.","en":"I will go in one day."}],
    "zan":     [{"zo":"Zan ciangin ka lum hi.","en":"I sleep at night."}],
    "kum":     [{"zo":"Kum khat khit ciangin...","en":"After one year..."},{"zo":"Na kum bangzah pha ta hiam?","en":"How old are you?"}],
    "an":      [{"zo":"An ka ne ding hi.","en":"I will eat food."}],
    "tui":     [{"zo":"Tui ka dawn ding hi.","en":"I will drink water."},{"zo":"Ka hei hi, tui pia in.","en":"I am thirsty, give me water."}],
    "sa":      [{"zo":"Sa ka ne nuam hi.","en":"I want to eat meat."}],
    "laibu":   [{"zo":"Ka pa in laibu a sim hi.","en":"My father reads a book."},{"zo":"Laibu khat ka nei hi.","en":"I have one book."}],
    "nasem":   [{"zo":"Ka nasem a sem hi.","en":"I am working."},{"zo":"Nasem hoih khat bawl in.","en":"Do good work."}],
    "naupang": [{"zo":"Naupang tampi om hi.","en":"There are many children."}],
    "innkuan": [{"zo":"Ka innkuan in Pasian biak uh hi.","en":"My family worships God."}],
    "sanggampa":[{"zo":"Ka sanggampa in kei hong huh hi.","en":"My brother helped me."}],
    "sanggamnu":[{"zo":"Ka sanggamnu in an a bawl hi.","en":"My sister cooks food."}],
    "upna":    [{"zo":"Ka upna lian hi.","en":"My faith is great."},{"zo":"Upna tawh pai in.","en":"Go with faith."}],
    "thunget": [{"zo":"Topa tungah thunget ni.","en":"Let us pray to the Lord."},{"zo":"Ka thunget hi.","en":"I prayed."}],
    "biak":    [{"zo":"Pasian biak ni.","en":"Let us worship God."}],
    "biakinn": [{"zo":"Biakinn ah ka pai hi.","en":"I went to church."}],
    "thupha":  [{"zo":"Pasian in thupha hong pia hen.","en":"May God bless you."},{"zo":"Thupha tampi ngah in.","en":"Receive many blessings."}],
    "mawhna":  [{"zo":"Ka mawhna hong lak in.","en":"Forgive my sin."},{"zo":"Mawhna nei lo in.","en":"Do not sin."}],
    "hotkhiat": [{"zo":"Pasian in kei hong hotkhiat hi.","en":"God saved me."}],
    "hehpihna":[{"zo":"Hehpihna tawh pai in.","en":"Go with grace."}],
    "lungkham":[{"zo":"Ka lungkham hi.","en":"I am sad."},{"zo":"Lungkham kei in.","en":"Do not be sad."}],
    "lungdam": [{"zo":"Ka lungdam hi.","en":"I am glad."},{"zo":"Lungdam takin om in.","en":"Be joyful."}],
    "heh":     [{"zo":"Ka heh hi.","en":"I am angry."},{"zo":"Heh kei in.","en":"Do not be angry."}],
    "lau":     [{"zo":"Ka lau hi.","en":"I am afraid."},{"zo":"Lau kei in.","en":"Do not be afraid."}],
    "ngimna":  [{"zo":"Ka ngimna lian hi.","en":"My hope is great."}],
    "pilna":   [{"zo":"Pilna hong pia in.","en":"Give wisdom."},{"zo":"Pilna nei in.","en":"Have wisdom."}],
    "theihna": [{"zo":"Theihna tampi nei in.","en":"Have much knowledge."}],
    "vangliatna":[{"zo":"Pasian in vangliatna nei hi.","en":"God has power."}],
    "minthan": [{"zo":"Pasian' minthan'na lian hi.","en":"God's glory is great."}],
    "tawntung":[{"zo":"Tawntung dingin Pasian pahtawi ni.","en":"Let us praise God forever."}],
}

# Load short Bible examples
print("Loading short Bible examples...")
short_bible = defaultdict(list)
for fpath in [
    DATA / "parallel/bible_parallel_tdb77_kjv.jsonl",
    DATA / "parallel/bible_parallel_tedim2010_kjv.jsonl",
]:
    with open(fpath) as f:
        for line in f:
            d = json.loads(line)
            en = d.get('input','').strip()
            zo = d.get('output','').strip()
            if not en or not zo: continue
            if len(zo) > 65 or len(en) > 65: continue
            if len(zo) < 5: continue
            if zo.count('.') > 1 or ';' in zo: continue
            for w in set(re.findall(r'\b[a-z]{2,}\b', zo.lower())):
                if len(short_bible[w]) < 3:
                    short_bible[w].append({'zo': zo, 'en': en})

print(f"  {len(short_bible):,} words with short Bible examples")

# Update dict_corpus_v1.jsonl with better examples
print("Updating dict_corpus_v1.jsonl with clean examples...")
updated = 0
out_lines = []

with open(DATA / "dictionary/processed/dict_corpus_v1.jsonl") as f:
    for line in f:
        e = json.loads(line)
        zo = e['zolai'].lower()

        # Priority: simple examples > short Bible > existing
        new_examples = []
        if zo in SIMPLE:
            new_examples = SIMPLE[zo][:3]
        if len(new_examples) < 3 and zo in short_bible:
            for ex in short_bible[zo]:
                if ex not in new_examples:
                    new_examples.append(ex)
                if len(new_examples) >= 3:
                    break

        if new_examples:
            e['examples'] = new_examples
            updated += 1

        out_lines.append(json.dumps(e, ensure_ascii=False))

with open(DATA / "dictionary/processed/dict_corpus_v1.jsonl", 'w') as f:
    f.write('\n'.join(out_lines) + '\n')

print(f"Updated examples for {updated:,} entries")
print(f"Simple examples: {len(SIMPLE)} words")
print(f"Short Bible examples: {len(short_bible)} words")
