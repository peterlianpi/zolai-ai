import json
import sys


def check_stems(file_path):
    errors = 0
    total = 0
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            data = json.loads(line)
            output = data.get('output', '')

            # Check for 'phawk' (Stem I) instead of 'phawkk' (Stem II) before 'ding'
            if 'phawk gige ding' in output:
                # In Tedim, 'phawk' (to remember/know) Stem II is often 'phawkk'
                # though 'phawk' is sometimes used as Stem II if it's a glottal stop.
                # Let's check 'zatsiam' vs 'zatsiamna' or Stem II.
                pass

            # Check 'hanthawn' (Stem I) vs 'hanthot' (Stem II)
            if 'hanthawn' in output and any(x in output for x in ['na', 'nading', 'hi']):
                # 'hanthawn' is Stem I, 'hanthot' is Stem II.
                # "kong hanthawn uh hi" -> Correct (Independent)
                # "hanthawn nading" -> Incorrect, should be "hanthot nading"
                if 'hanthawn nading' in output:
                    print(f"Error: Found 'hanthawn nading' in: {output[:100]}...")
                    errors += 1

            total += 1
    print(f"Audited {total} lines. Found {errors} likely stem errors.")

if __name__ == "__main__":
    check_stems(sys.argv[1])
