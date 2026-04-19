from __future__ import annotations

import shutil
import sys
from pathlib import Path
from dataclasses import dataclass

ROOT = Path(".")
NEW_STRUCTURE = {
    # 🧠 WIKI IS MAIN BRAIN (Priority 1)
    "wiki": [
        "architecture", "grammar", "vocabulary", "culture", "curriculum",
        "linguistics", "biblical", "concepts", "decisions", "patterns",
        "examples", "references"
    ],
    
    # Code that implements wiki (Priority 2)
    "src/zolai": ["core", "services", "models", "utils", "api"],
    
    # Scripts that extract/update wiki (Priority 3)
    "scripts": ["crawlers", "data_pipeline", "training", "maintenance", "deploy"],
    
    # Data that feeds wiki (Priority 4)
    "data": ["master/sources", "master/combined", "master/archive", "processed", "raw", "history"],
    
    # Tests validate wiki (Priority 5)
    "tests": ["unit", "integration", "fixtures"],
    
    # Everything else
    "models": ["checkpoints", "lora", "configs"],
    "config": [],
    "docs": ["guides", "api", "architecture", "tutorials"],
    "agents/definitions": [],
    "skills/definitions": [],
    "notebooks": ["exploration", "analysis", "training"],
}

CONSOLIDATE = {
    "README.md": "Keep root only",
    "pyproject.toml": "Keep root only",
    ".env.example": "Keep root only",
    "AGENTS.md": "Keep root only",
}

REMOVE_DIRS = [
    "graph",
    "experiments",
    "teams",
    "scratch",
    "todo",
    "archive",
    "clean",
    "dataset",
    "kaggle_dataset",
    "raw",
]

# DO NOT TOUCH
UNTOUCHED = [
    "website/zolai-project",  # Keep as is
]

MOVE_DIRS = {
    "Cleaned_Bible": "knowledge/bible",
    "wiki": "knowledge/wiki",
}


@dataclass
class MigrationStats:
    dirs_created: int = 0
    files_moved: int = 0
    files_removed: int = 0
    duplicates_found: int = 0


def create_structure() -> MigrationStats:
    """Create new directory structure."""
    stats = MigrationStats()

    print("📁 Creating new directory structure...")
    for dir_path, subdirs in NEW_STRUCTURE.items():
        path = ROOT / dir_path
        path.mkdir(parents=True, exist_ok=True)
        stats.dirs_created += 1

        for subdir in subdirs:
            (path / subdir).mkdir(parents=True, exist_ok=True)
            stats.dirs_created += 1

    print(f"✅ Created {stats.dirs_created} directories")
    return stats


def move_key_directories(stats: MigrationStats) -> None:
    """Move key directories to new locations."""
    print("\n📦 Moving key directories...")

    for src, dst in MOVE_DIRS.items():
        src_path = ROOT / src
        dst_path = ROOT / dst

        if src_path.exists() and not dst_path.exists():
            print(f"  Moving {src} → {dst}")
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(src_path), str(dst_path))
            stats.files_moved += 1


def consolidate_duplicates(stats: MigrationStats) -> None:
    """Consolidate duplicate files."""
    print("\n🔄 Consolidating duplicate files...")

    for filename, action in CONSOLIDATE.items():
        duplicates = list(ROOT.rglob(filename))
        if len(duplicates) > 1:
            print(f"  {filename}: Found {len(duplicates)} copies")
            # Keep root copy, remove others
            root_copy = ROOT / filename
            for dup in duplicates:
                if dup != root_copy and dup.exists():
                    dup.unlink()
                    stats.files_removed += 1
                    print(f"    Removed: {dup}")


def remove_empty_directories(stats: MigrationStats) -> None:
    """Remove empty and unnecessary directories."""
    print("\n🗑️  Removing empty directories...")

    for dir_name in REMOVE_DIRS:
        dir_path = ROOT / dir_name
        if dir_path.exists():
            try:
                shutil.rmtree(dir_path)
                stats.files_removed += 1
                print(f"  Removed: {dir_name}")
            except Exception as e:
                print(f"  ⚠️  Could not remove {dir_name}: {e}")


def create_registries() -> None:
    """Create agent and skill registries."""
    print("\n📋 Creating registries...")

    # Agent registry
    agents_registry = ROOT / "agents" / "registry.yaml"
    agents_registry.parent.mkdir(parents=True, exist_ok=True)
    agents_registry.write_text("""# Agent Registry
# Central registry of all agents in the system

agents:
  linguistic-specialist:
    description: Linguistic analysis and validation
    path: definitions/linguistic-specialist.yaml
  
  zolai-learner:
    description: Language learning tutor
    path: definitions/zolai-learner.yaml
  
  zomi-data:
    description: Dataset management
    path: definitions/zomi-data.yaml
  
  zomi-dictionary-builder:
    description: Dictionary construction
    path: definitions/zomi-dictionary-builder.yaml
  
  zomi-synthesizer:
    description: Instruction synthesis
    path: definitions/zomi-synthesizer.yaml
  
  zomi-evaluator:
    description: Quality evaluation
    path: definitions/zomi-evaluator.yaml
  
  zomi-wiki-manager:
    description: Wiki maintenance
    path: definitions/zomi-wiki-manager.yaml
  
  zomi-cleaner-bot:
    description: Data cleaning
    path: definitions/zomi-cleaner-bot.yaml
  
  zomi-crawler-bot:
    description: Web crawling
    path: definitions/zomi-crawler-bot.yaml
  
  zomi-trainer-bot:
    description: Training pipeline
    path: definitions/zomi-trainer-bot.yaml
  
  zomi-philosopher:
    description: Linguistic reasoning
    path: definitions/zomi-philosopher.yaml
  
  zomi-server-ops:
    description: Server operations
    path: definitions/zomi-server-ops.yaml
  
  zomi-ops-monitor:
    description: Operations monitoring
    path: definitions/zomi-ops-monitor.yaml
""")
    print("  ✅ Created agents/registry.yaml")

    # Skills registry
    skills_registry = ROOT / "skills" / "registry.yaml"
    skills_registry.parent.mkdir(parents=True, exist_ok=True)
    skills_registry.write_text("""# Skills Registry
# Central registry of all skills in the system

skills:
  data-cleaner:
    description: Data cleaning and validation
    path: definitions/data-cleaner.yaml
  
  data-collector:
    description: Data collection
    path: definitions/data-collector.yaml
  
  grammar-checker:
    description: Grammar validation
    path: definitions/grammar-checker.yaml
  
  model-trainer:
    description: Model training
    path: definitions/model-trainer.yaml
  
  model-evaluator:
    description: Model evaluation
    path: definitions/model-evaluator.yaml
  
  web-crawler:
    description: Web crawling
    path: definitions/web-crawler.yaml
  
  rag-builder:
    description: RAG system building
    path: definitions/rag-builder.yaml
  
  pipeline-orchestrator:
    description: Pipeline orchestration
    path: definitions/pipeline-orchestrator.yaml
""")
    print("  ✅ Created skills/registry.yaml")


def generate_report(stats: MigrationStats) -> None:
    """Generate migration report."""
    print("\n" + "=" * 80)
    print("📊 MIGRATION REPORT")
    print("=" * 80)
    print(f"Directories created: {stats.dirs_created}")
    print(f"Files moved: {stats.files_moved}")
    print(f"Files removed: {stats.files_removed}")
    print(f"Duplicates consolidated: {stats.duplicates_found}")
    print("=" * 80)


def main() -> int:
    """Main execution."""
    print("🏗️  ZOLAI PROJECT RESTRUCTURING")
    print("=" * 80)
    print("")

    try:
        stats = create_structure()
        move_key_directories(stats)
        consolidate_duplicates(stats)
        remove_empty_directories(stats)
        create_registries()
        generate_report(stats)

        print("\n✅ RESTRUCTURING COMPLETE")
        print("\n📋 Next steps:")
        print("  1. Review the new structure")
        print("  2. Update all imports in source files")
        print("  3. Run tests to verify everything works")
        print("  4. Update documentation")
        print("  5. Commit changes to git")

        return 0

    except Exception as e:
        print(f"\n❌ ERROR: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
