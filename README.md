Zolai CLI utilities and scripts for data processing and model training.

This project provides a set of command-line tools for Zolai dataset manipulation, cleaning, and training workflows. You can run these scripts directly from the command line using `python zolai_menu.py`.

## Available Commands:

- **Scripts Directory:**
  - `check_pdf`: Checks PDF files.
  - `export_linguistics`: Exports linguistic sources.
  - `export_zolai`: Exports Zolai sources.
  - `export_full_sources`: Exports all sources.
  - `pdf_to_md`: Converts PDF to Markdown.
  - `test_markitdown`: Tests Markdown functionalities.

- **Source Commands (src/zolai/commands):**
  - `apply_v8_standardization`: Applies V8 standardization to data using the Zolai CLI (`zolai standardize-jsonl`).
  - `audit_jsonl`: Audits JSONL files for issues using the Zolai CLI (`zolai audit-jsonl`).
  - `bible_hymn_extractor`: Extracts Bible hymns.
  - `clean_legacy_folders`: Cleans legacy folders.
  - `exhaustive_v9_builder`: Builds V9 exhaustively.
  - `legacy_data_integrator`: Integrates legacy data.
  - `master_standardizer`: Master standardization script (intended for import or CLI usage, not direct execution from this menu).

## Project Structure

- **`src/zolai/`**: core Python package containing standardization logic and command implementations.
- **`notebooks/`**: Jupyter notebooks for Kaggle-first training and large-scale cleaning.
- **`scripts/`**: utility scripts for data export, PDF processing, and testing.
- **`resources/`**: distilled knowledge, rules, and verbatim reference texts (git-friendly).
- **`references/`**: index of large source materials (ignored by git).
- **`CHANGELOG.md`**: history of dataset versions (e.g. V9 Exhaustive).
- **`zolai_menu.py`**: interactive menu to run any script or CLI command.
- **`zolai_cli.py`**: direct entrypoint for the `zolai` command-line tool.

## Running Commands:

1. Execute the menu script: `python zolai_menu.py`
2. Select a command by entering its corresponding number.
3. View the output for the selected command.

## Notes:

- For commands registered with the main `zolai` CLI (like `audit_jsonl` and `apply_v8_standardization`), the menu attempts to call them via the CLI. Some arguments are pre-configured for common use cases.
- Scripts marked with 'run_directly: True' are executed as standalone Python scripts.
- Scripts intended for import or with complex CLI arguments not exposed in this menu are noted as such. For detailed usage of those scripts, please refer to their individual docstrings or the `zolai_cli.py` for registered commands.
