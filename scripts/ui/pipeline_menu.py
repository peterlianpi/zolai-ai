import os
import subprocess
import sys


def print_header(title):
    print(f"\n{'='*50}")
    print(f" {title}")
    print(f"{'='*50}")

def prompt_api_key(provider):
    env_var = f"{provider.upper()}_API_KEY"
    key = os.environ.get(env_var)
    if not key:
        print(f"\n[!] {env_var} is not set.")
        key = input(f"Please enter your {provider.upper()} API Key (or press Enter to skip): ").strip()
        if key:
            os.environ[env_var] = key
    return os.environ.get(env_var)

def run_script(script_path, args=None):
    if not args:
        args = []
    cmd = [sys.executable, script_path] + args
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"\n[!] Error running {script_path}: {e}")
    except KeyboardInterrupt:
        print("\n[-] Process interrupted by user.")

def main_menu():
    while True:
        print_header("Zo_Tdm Data Quality & Agent Pipeline Menu")
        print("1. Deduplicate Tech Seed Data")
        print("2. Generate LLM Correction Prompts")
        print("3. Run LLM Correction Pipeline (OpenAI/Gemini/OpenRouter)")
        print("4. Score Back-Translations (Semantic Similarity)")
        print("5. Human-in-the-Loop CLI Review")
        print("0. Exit")

        choice = input("\nEnter your choice (0-5): ").strip()

        if choice == '1':
            print_header("Deduplicating Dataset")
            run_script("scripts/deduplicate_dataset.py")

        elif choice == '2':
            print_header("Generating Prompts")
            run_script("scripts/fix_seed_data_pipeline.py")

        elif choice == '3':
            print_header("LLM Correction")
            print("Select Provider:")
            print("1. OpenAI (gpt-4o)")
            print("2. Gemini (gemini-1.5-pro)")
            print("3. OpenRouter (anthropic/claude-3-haiku)")
            p_choice = input("Provider (1-3): ").strip()

            provider = ""
            model = ""
            if p_choice == '1':
                provider = "openai"
                prompt_api_key("openai")
            elif p_choice == '2':
                provider = "gemini"
                prompt_api_key("gemini")
            elif p_choice == '3':
                provider = "openrouter"
                prompt_api_key("openrouter")
                m_choice = input("Enter model name [default: anthropic/claude-3-haiku]: ").strip()
                if m_choice:
                    model = m_choice
                else:
                    model = "anthropic/claude-3-haiku"
            else:
                print("Invalid choice.")
                continue

            if provider:
                args = ["--provider", provider]
                if model:
                    args.extend(["--model", model])
                run_script("scripts/run_llm_correction.py", args)

        elif choice == '4':
            print_header("Semantic Scoring")
            print("Note: Requires sentence-transformers.")
            run_script("scripts/score_similarity.py")

        elif choice == '5':
            print_header("Human-in-the-Loop Review")
            samples = input("How many samples to review? [default: 10]: ").strip()
            args = []
            if samples.isdigit():
                args.extend(["--samples", samples])
            run_script("scripts/human_review_ui.py", args)

        elif choice == '0':
            print("\nExiting Pipeline Menu. Goodbye!")
            break
        else:
            print("\n[!] Invalid choice. Please select 0-5.")

if __name__ == "__main__":
    main_menu()
