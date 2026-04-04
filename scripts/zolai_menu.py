import subprocess
import sys
import os
import json

# Define commands from the scripts/ directory
scripts_commands = [
    {"name": "check_pdf", "path": "scripts/check_pdf.py"},
    {"name": "export_linguistics", "path": "scripts/export_all_linguistics_sources.py"},
    {"name": "export_zolai", "path": "scripts/export_all_zolai_sources.py"},
    {"name": "export_full_sources", "path": "scripts/export_full_sources.py"},
    {"name": "pdf_to_md", "path": "scripts/pdf_to_md.py"},
    {"name": "test_markitdown", "path": "scripts/test_markitdown.py"},
]

# Define commands from the src/zolai/commands/ directory
# These will be called via the main zolai CLI or executed directly if they have a suitable main function.
commands_commands = [
    {
        "name": "apply_v8_standardization",
        "path": "src/zolai/commands/apply_v8_standardization.py",
        "cli_command": "zolai standardize-jsonl --input Zolai Cleaned V5/train.jsonl --output Zolai Cleaned V8/train.jsonl --chunk-size 50000",
    },
    {
        "name": "audit_jsonl",
        "path": "src/zolai/commands/audit_dataset.py",
        "cli_command": "zolai audit-jsonl --input Zolai Cleaned V5/train.jsonl",
    },
    {
        "name": "bible_hymn_extractor",
        "path": "src/zolai/commands/bible_hymn_extractor.py",
        "run_directly": True,
    },
    {
        "name": "clean_legacy_folders",
        "path": "src/zolai/commands/clean_legacy_folders_inplace.py",
        "run_directly": True,
    },
    {
        "name": "exhaustive_v9_builder",
        "path": "src/zolai/commands/exhaustive_v9_builder.py",
        "run_directly": True,
    },
    {
        "name": "legacy_data_integrator",
        "path": "src/zolai/commands/legacy_data_integrator.py",
        "run_directly": True,
    },
    {
        "name": "master_standardizer",
        "path": "src/zolai/commands/master_zolai_standardizer.py",
        "notes": "Intended for import or CLI usage, not direct execution from menu.",
    },
]


def run_command(command_info):
    script_path = command_info.get("path")
    name = command_info.get("name")
    cli_command = command_info.get("cli_command")
    run_directly = command_info.get("run_directly", False)
    notes = command_info.get("notes", "")
    args = []  # Initialize to empty list to satisfy LSP

    if notes:
        print(f"Note for '{name}': {notes}")
        return

    try:
        args = [sys.executable]
        if cli_command:
            # Split the CLI command string into a list of arguments
            args.extend(cli_command.split())
        elif script_path:
            args.append(script_path)
            if run_directly:
                # If script needs to be run directly and has a main function
                pass  # args already contains script_path
            else:
                # For scripts intended for import or with complex CLI args not directly handled
                print(f"To run '{name}', use the 'zolai' CLI or import it.")
                return
        else:
            print(f"Invalid command configuration for '{name}'.")
            return

        print(f"\n--- Running command: {name} ---")

        # For CLI commands, run as subprocess
        if cli_command or (script_path and not run_directly):
            process = subprocess.run(args, capture_output=True, text=True, check=True)
            print(process.stdout)
            if process.stderr:
                print(f"--- Stderr for {name} ---")
                print(process.stderr)
        # For scripts marked to run directly
        elif script_path and run_directly:
            # This part assumes the script has a main function that can be called
            # For simplicity, we'll execute it as a script.
            # A more robust approach would be to import and call its main function.
            process = subprocess.run(args, capture_output=True, text=True, check=True)
            print(process.stdout)
            if process.stderr:
                print(f"--- Stderr for {name} ---")
                print(process.stderr)

    except subprocess.CalledProcessError as e:
        print(f"Error running command '{name}': {e}")
        print(f"Stderr: {e.stderr}")
    except FileNotFoundError:
        print(
            f"Error: Command or script not found. Ensure '{' '.join(args)}' is correct."
        )
    except Exception as e:
        print(f"An unexpected error occurred for command '{name}': {e}")


def display_menu(all_commands):
    print("\nZolai Command Menu:\n")
    print("0. Exit")
    for i, cmd in enumerate(all_commands):
        print(f"{i + 1}. {cmd['name']}")

    while True:
        try:
            choice = int(input("Enter your choice: "))
            if choice == 0:
                return None
            elif 1 <= choice <= len(all_commands):
                return all_commands[choice - 1]
            else:
                print("Invalid choice. Please try again.")
        except ValueError:
            print("Invalid input. Please enter a number.")


def main():
    all_commands = scripts_commands + commands_commands

    while True:
        selected_command = display_menu(all_commands)
        if selected_command is None:
            print("Exiting Zolai CLI menu.")
            break

        run_command(selected_command)


if __name__ == "__main__":
    main()

# Added the new pipeline menu to the main menu
pipeline_commands = [
    {"name": "Launch AI Pipeline Menu", "path": "scripts/pipeline_menu.py", "run_directly": True},
]

# Update the main function to include pipeline commands
def main():
    all_commands = scripts_commands + commands_commands + pipeline_commands

    while True:
        selected_command = display_menu(all_commands)
        if selected_command is None:
            print("Exiting Zolai CLI menu.")
            break

        run_command(selected_command)

if __name__ == "__main__":
    # We redefine main down here so it overwrites the old main definition when the script runs
    main()
