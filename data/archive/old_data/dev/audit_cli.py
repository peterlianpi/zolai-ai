import sys
import argparse
from audit_zolai import audit_zolai_text


def main():
    parser = argparse.ArgumentParser(
        description="Zolai (Tedim) Auditor CLI - Tone Aware"
    )
    parser.add_argument(
        "-f",
        "--formal",
        action="store_true",
        help="Audit in Formal tone (Admin/Academic)",
    )
    parser.add_argument(
        "-c",
        "--colloquial",
        action="store_true",
        help="Audit in Colloquial tone (Casual)",
    )
    parser.add_argument("text", nargs="?", help="Zolai text to audit")

    args = parser.parse_args()

    tone = None
    if args.formal:
        tone = "formal"
    elif args.colloquial:
        tone = "colloquial"

    print("-" * 35)
    print(f"Zolai Auditor CLI | Tone: {tone or 'Neutral'}")
    print("-" * 35)

    if args.text:
        # One-shot audit
        errors = audit_zolai_text(args.text, tone=tone)
        if not errors:
            print("✅ No issues found.")
        else:
            for i, err in enumerate(errors, 1):
                print(f"  {i}. {err}")
    else:
        # Interactive mode
        print("Enter Zolai text to audit (type 'exit' or 'quit' to stop):")
        while True:
            try:
                user_input = input("\nAudit > ").strip()
                if user_input.lower() in ["exit", "quit"]:
                    break
                if not user_input:
                    continue

                errors = audit_zolai_text(user_input, tone=tone)

                if not errors:
                    print("✅ No issues found.")
                else:
                    print(f"⚠️  {len(errors)} issues:")
                    for i, err in enumerate(errors, 1):
                        print(f"  {i}. {err}")
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"❌ Error: {e}")

        print("\nMangpha!")


if __name__ == "__main__":
    main()
