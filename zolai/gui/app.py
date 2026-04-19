"""Zolai Toolkit — GTK3 GUI Application."""

import gi

gi.require_version("Gtk", "3.0")
gi.require_version("Gdk", "3.0")
import logging
import threading
import time

from gi.repository import Gdk, Gio, GLib, Gtk

from ..analyzer.corpus import CorpusAnalyzer
from ..cleaner.pipeline import CleanPipeline
from ..crawler.engine import CrawlEngine
from ..dictionary.manager import DictionaryManager
from ..ingest import ingest_pdfs, ingest_text_files
from ..manager import corpus_status
from ..manager import dedup_corpus as do_dedup
from ..manager import filter_zolai as do_filter
from ..manager import unify as do_unify
from ..trainer.dataset import DatasetBuilder

logger = logging.getLogger(__name__)

# Dark theme CSS
DARK_CSS = """
window { background-color: #1e1e2e; }
.sidebar button { background-color: transparent; color: #cdd6f4; border: none; padding: 8px; }
.sidebar button:hover { background-color: #313244; }
.sidebar button.suggested-action { background-color: #313244; color: #89b4fa; font-weight: bold; }
textview, textview text { background-color: #11111b; color: #cdd6f4; font-family: monospace; font-size: 11px; }
button { background-color: #313244; color: #cdd6f4; border-radius: 6px; padding: 8px 16px; }
button:hover { background-color: #45475a; }
button:active { background-color: #585b70; }
entry { background-color: #11111b; color: #cdd6f4; border-radius: 6px; padding: 6px; }
label { color: #cdd6f4; }
progressbar trough { background-color: #313244; border-radius: 4px; }
progressbar progress { background-color: #89b4fa; border-radius: 4px; }
statusbar { background-color: #181825; color: #a6adc8; padding: 4px; }
"""


class LogView(Gtk.Box):
    """Scrollable log view with auto-scroll and append/clear API."""

    def __init__(self):
        super().__init__(orientation=Gtk.Orientation.VERTICAL)
        self.textview = Gtk.TextView()
        self.textview.set_editable(False)
        self.textview.set_monospace(True)
        self.textview.set_left_margin(8)
        self.textview.set_right_margin(8)
        self.textview.set_top_margin(8)
        self.textview.set_bottom_margin(8)
        self.textview.set_wrap_mode(Gtk.WrapMode.WORD_CHAR)

        scroll = Gtk.ScrolledWindow()
        scroll.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
        scroll.add(self.textview)
        self.pack_start(scroll, True, True, 0)

    def append(self, text):
        """Append text line(s) and auto-scroll to bottom."""
        buf = self.textview.get_buffer()
        end = buf.get_end_iter()
        buf.insert(end, text + "\n")
        mark = buf.create_mark(None, buf.get_end_iter(), False)
        self.textview.scroll_to_mark(mark, 0.0, False, 0.0, 1.0)

    def clear(self):
        """Clear all text."""
        self.textview.get_buffer().set_text("")


class ZolaiWindow(Gtk.ApplicationWindow):
    """Main application window."""

    def __init__(self, app):
        super().__init__(application=app, title="Zolai Toolkit")
        self.set_default_size(1100, 750)
        self.set_border_width(0)

        # Apply dark theme
        css = Gtk.CssProvider()
        css.load_from_data(DARK_CSS.encode())
        Gtk.StyleContext.add_provider_for_screen(
            Gdk.Screen.get_default(), css, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        )

        # Main layout
        vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL)
        self.add(vbox)

        # Header bar
        header = Gtk.HeaderBar()
        header.set_show_close_button(True)
        header.set_title("Zolai Toolkit")
        header.set_subtitle("Language Data Pipeline")
        self.set_titlebar(header)

        # Main content area with sidebar
        hbox = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL)
        vbox.pack_start(hbox, True, True, 0)

        # Sidebar — flat button box for guaranteed click handling
        sidebar_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
        sidebar_box.set_size_request(180, -1)
        sidebar_box.get_style_context().add_class("sidebar")
        sidebar_box.set_margin_top(4)
        sidebar_box.set_margin_bottom(4)

        self._sidebar_buttons = []

        pages = [
            ("🔍 Crawler", "crawler"),
            ("📥 Ingest", "ingest"),
            ("🧹 Cleaner", "cleaner"),
            ("📊 Analyzer", "analyzer"),
            ("🏋️ Trainer", "trainer"),
            ("📦 Manager", "manager"),
            ("📖 Dictionary", "dictionary"),
            ("📕 Bible", "bible"),
            ("📈 Analytics", "analytics"),
        ]
        for label, name in pages:
            btn = Gtk.Button(label=label)
            btn.set_relief(Gtk.ReliefStyle.NONE)
            btn.set_halign(Gtk.Align.START)
            btn.set_margin_start(8)
            btn.set_margin_end(4)
            btn._page_name = name
            btn.connect("clicked", self._on_nav_click)
            sidebar_box.pack_start(btn, False, False, 0)
            self._sidebar_buttons.append((btn, name))

        sidebar_scroll = Gtk.ScrolledWindow()
        sidebar_scroll.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)
        sidebar_scroll.add(sidebar_box)
        hbox.pack_start(sidebar_scroll, False, False, 0)

        # Separator
        sep = Gtk.Separator(orientation=Gtk.Orientation.VERTICAL)
        hbox.pack_start(sep, False, False, 0)

        # Stack for pages
        self.stack = Gtk.Stack()
        self.stack.set_transition_type(Gtk.StackTransitionType.SLIDE_UP_DOWN)
        self.stack.set_transition_duration(200)

        self._build_crawler_page()
        self._build_ingest_page()
        self._build_cleaner_page()
        self._build_analyzer_page()
        self._build_trainer_page()
        self._build_manager_page()
        self._build_dictionary_page()
        self._build_bible_page()
        self._build_analytics_page()

        hbox.pack_start(self.stack, True, True, 0)

        # Progress bar
        self.progress = Gtk.ProgressBar()
        self.progress.set_show_text(True)
        self.progress.set_margin_start(8)
        self.progress.set_margin_end(8)
        self.progress.set_margin_top(4)
        self.progress.set_margin_bottom(4)
        vbox.pack_start(self.progress, False, False, 0)

        # Status bar
        self.statusbar = Gtk.Statusbar()
        self.dict_manager = DictionaryManager()
        self.statusbar.get_style_context().add_class("statusbar")
        self.status_ctx = self.statusbar.get_context_id("main")
        self.statusbar.push(self.status_ctx, "Ready")
        vbox.pack_start(self.statusbar, False, False, 0)

        # Show first page
        self._switch_page("crawler")

    # ---- Navigation ----

    def _on_nav_click(self, btn):
        page_name = getattr(btn, "_page_name", None)
        if page_name:
            self._switch_page(page_name)

    def _switch_page(self, page_name):
        self.stack.set_visible_child_name(page_name)
        for btn, name in self._sidebar_buttons:
            if name == page_name:
                btn.get_style_context().add_class("suggested-action")
            else:
                btn.get_style_context().remove_class("suggested-action")
        self._set_status(f"Page: {page_name}")

    # ---- Helpers ----

    def _make_button(self, label, callback, *args):
        btn = Gtk.Button(label=label)
        btn.connect("clicked", callback, *args)
        return btn

    def _set_status(self, text):
        self.statusbar.pop(self.status_ctx)
        self.statusbar.push(self.status_ctx, text)

    def _run_threaded(self, func, on_done=None):
        """Run a function in background thread with progress."""
        self.progress.set_fraction(0)
        self.progress.set_text("Running...")
        self._set_status("Working...")

        def wrapper():
            try:
                result = func()
                GLib.idle_add(self._on_thread_done, result, on_done)
            except Exception as e:
                GLib.idle_add(self._on_thread_error, str(e))

        threading.Thread(target=wrapper, daemon=True).start()

    def _on_thread_done(self, result, on_done):
        self.progress.set_fraction(1.0)
        self.progress.set_text("Done")
        self._set_status("Complete")
        if on_done:
            on_done(result)
        return False

    def _on_thread_error(self, error):
        self.progress.set_fraction(0)
        self.progress.set_text("Error")
        self._set_status(f"Error: {error}")
        return False

    # ================================================================
    # CRAWLER PAGE
    # ================================================================

    def _build_crawler_page(self):
        box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=8)
        box.set_margin_start(12)
        box.set_margin_end(12)
        box.set_margin_top(12)

        box.pack_start(Gtk.Label(label="🔍 Web Crawler", xalign=0), False, False, 0)

        # Seed input
        seed_box = Gtk.Box(spacing=8)
        self.crawl_seed = Gtk.Entry()
        self.crawl_seed.set_placeholder_text("Enter seed URL or topic...")
        self.crawl_seed.set_hexpand(True)
        seed_box.pack_start(self.crawl_seed, True, True, 0)
        seed_box.pack_start(self._make_button("Crawl", self._on_crawl), False, False, 0)
        seed_box.pack_start(self._make_button("Infinite Loop", self._on_crawl_infinite), False, False, 0)
        seed_box.pack_start(self._make_button("Stop", self._on_crawl_stop), False, False, 0)
        box.pack_start(seed_box, False, False, 0)

        # Log output
        self.crawl_log = LogView()
        box.pack_start(self.crawl_log, True, True, 0)

        self._crawl_running = False
        self.stack.add_named(box, "crawler")

    def _on_crawl(self, btn):
        seed = self.crawl_seed.get_text().strip()
        if not seed:
            return
        self.crawl_log.clear()
        engine = CrawlEngine()

        def run():
            self.crawl_log.append(f"[{time.strftime('%H:%M:%S')}] Starting crawl: {seed}")
            results = engine.crawl_seed(seed)
            GLib.idle_add(lambda: self.crawl_log.append(f"[{time.strftime('%H:%M:%S')}] ✓ Crawled {len(results)} pages"))
            return results

        self._run_threaded(run)

    def _on_crawl_infinite(self, btn):
        seed = self.crawl_seed.get_text().strip() or "zolai language"
        self._crawl_running = True
        self.crawl_log.append(f"[{time.strftime('%H:%M:%S')}] 🔄 Infinite crawler starting: {seed}")
        self.crawl_log.append(f"[{time.strftime('%H:%M:%S')}] Press Stop to halt")
        self._set_status("Crawler running...")

        def run():
            engine = CrawlEngine()
            cycle = 0
            while self._crawl_running:
                cycle += 1
                try:
                    GLib.idle_add(lambda c=cycle: self.crawl_log.append(
                        f"[{time.strftime('%H:%M:%S')}] --- Cycle {c} ---"))
                    results = engine.crawl_seed(seed)
                    GLib.idle_add(lambda r=results, c=cycle: self.crawl_log.append(
                        f"[{time.strftime('%H:%M:%S')}] Cycle {c}: {len(r)} pages crawled"))
                except Exception as e:
                    GLib.idle_add(lambda e=e: self.crawl_log.append(
                        f"[{time.strftime('%H:%M:%S')}] ⚠ Error: {e}"))
                time.sleep(5)
            GLib.idle_add(lambda: self.crawl_log.append(
                f"[{time.strftime('%H:%M:%S')}] 🛑 Crawler stopped"))

        threading.Thread(target=run, daemon=True).start()

    def _on_crawl_stop(self, btn):
        self._crawl_running = False
        self._set_status("Stopping crawler...")

    # ================================================================
    # INGEST PAGE
    # ================================================================

    def _build_ingest_page(self):
        box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=8)
        box.set_margin_start(12)
        box.set_margin_end(12)
        box.set_margin_top(12)

        box.pack_start(Gtk.Label(label="📥 Data Ingest", xalign=0), False, False, 0)

        ctrl_box = Gtk.Box(spacing=8)
        ctrl_box.pack_start(self._make_button("Ingest Text Files", self._on_ingest_text), False, False, 0)
        ctrl_box.pack_start(self._make_button("Ingest PDFs", self._on_ingest_pdf), False, False, 0)
        box.pack_start(ctrl_box, False, False, 0)

        # Web URL ingest
        url_box = Gtk.Box(spacing=8)
        self.ingest_url = Gtk.Entry()
        self.ingest_url.set_placeholder_text("Enter URL to fetch...")
        self.ingest_url.set_hexpand(True)
        url_box.pack_start(self.ingest_url, True, True, 0)
        url_box.pack_start(self._make_button("Fetch", self._on_ingest_url), False, False, 0)
        box.pack_start(url_box, False, False, 0)

        self.ingest_log = LogView()
        box.pack_start(self.ingest_log, True, True, 0)

        self.stack.add_named(box, "ingest")

    def _on_ingest_text(self, btn):
        self.ingest_log.clear()
        def run():
            paths = ingest_text_files()
            GLib.idle_add(lambda: self.ingest_log.append(f"✓ Ingested {len(paths)} text files"))
            return paths
        self._run_threaded(run)

    def _on_ingest_pdf(self, btn):
        self.ingest_log.clear()
        def run():
            path = ingest_pdfs()
            GLib.idle_add(lambda: self.ingest_log.append(f"✓ PDFs extracted to {path}"))
            return path
        self._run_threaded(run)

    def _on_ingest_url(self, btn):
        url = self.ingest_url.get_text().strip()
        if not url:
            return
        self.ingest_log.clear()
        self.ingest_log.append(f"Fetching {url}...")
        import asyncio

        from ..ingest import ingest_web_pages
        def run():
            path = asyncio.run(ingest_web_pages([url]))
            GLib.idle_add(lambda: self.ingest_log.append(f"✓ Fetched to {path}"))
            return path
        self._run_threaded(run)

    # ================================================================
    # CLEANER PAGE
    # ================================================================

    def _build_cleaner_page(self):
        box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=8)
        box.set_margin_start(12)
        box.set_margin_end(12)
        box.set_margin_top(12)

        box.pack_start(Gtk.Label(label="🧹 Data Cleaner", xalign=0), False, False, 0)

        ctrl_box = Gtk.Box(spacing=8)
        ctrl_box.pack_start(self._make_button("Clean Raw Data", self._on_clean), False, False, 0)
        ctrl_box.pack_start(self._make_button("Deduplicate", self._on_dedup), False, False, 0)
        ctrl_box.pack_start(self._make_button("Purity Audit", self._on_purity), False, False, 0)
        box.pack_start(ctrl_box, False, False, 0)

        self.cleaner_log = LogView()
        box.pack_start(self.cleaner_log, True, True, 0)

        self.stack.add_named(box, "cleaner")

    def _on_clean(self, btn):
        self.cleaner_log.clear()
        pipe = CleanPipeline()
        def run():
            result = pipe.run_full_pipeline()
            GLib.idle_add(lambda: self.cleaner_log.append(f"✓ Cleaned: {result}"))
            return result
        self._run_threaded(run)

    def _on_dedup(self, btn):
        self.cleaner_log.clear()
        self.cleaner_log.append("Deduplication running...")

    def _on_purity(self, btn):
        self.cleaner_log.clear()
        analyzer = CorpusAnalyzer()
        def run():
            stats = analyzer.purity_audit()
            for k, v in stats.items():
                GLib.idle_add(lambda k=k, v=v: self.cleaner_log.append(f"  {k}: {v}"))
            return stats
        self._run_threaded(run)

    # ================================================================
    # ANALYZER PAGE
    # ================================================================

    def _build_analyzer_page(self):
        box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=8)
        box.set_margin_start(12)
        box.set_margin_end(12)
        box.set_margin_top(12)

        box.pack_start(Gtk.Label(label="📊 Corpus Analyzer", xalign=0), False, False, 0)

        ctrl_box = Gtk.Box(spacing=8)
        ctrl_box.pack_start(self._make_button("Full Stats", self._on_stats), False, False, 0)
        ctrl_box.pack_start(self._make_button("Vocabulary", self._on_vocab), False, False, 0)
        box.pack_start(ctrl_box, False, False, 0)

        self.analyzer_log = LogView()
        box.pack_start(self.analyzer_log, True, True, 0)

        self.stack.add_named(box, "analyzer")

    def _on_stats(self, btn):
        self.analyzer_log.clear()
        analyzer = CorpusAnalyzer()
        def run():
            stats = analyzer.full_stats()
            GLib.idle_add(lambda: self.analyzer_log.append("=== Corpus Statistics ==="))
            for k, v in stats.items():
                val = f"{v:.2f}" if isinstance(v, float) else (f"{v:,}" if isinstance(v, int) else str(v))
                GLib.idle_add(lambda k=k, val=val: self.analyzer_log.append(f"  {k}: {val}"))
            return stats
        self._run_threaded(run)

    def _on_vocab(self, btn):
        self.analyzer_log.clear()
        self.analyzer_log.append("Vocabulary analysis...")

    # ================================================================
    # TRAINER PAGE
    # ================================================================

    def _build_trainer_page(self):
        box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=8)
        box.set_margin_start(12)
        box.set_margin_end(12)
        box.set_margin_top(12)

        box.pack_start(Gtk.Label(label="🏋️ Training Pipeline", xalign=0), False, False, 0)

        ctrl_box = Gtk.Box(spacing=8)
        ctrl_box.pack_start(self._make_button("Build Splits", self._on_split), False, False, 0)
        ctrl_box.pack_start(self._make_button("Export JSONL", self._on_export), False, False, 0)
        box.pack_start(ctrl_box, False, False, 0)

        self.trainer_log = LogView()
        box.pack_start(self.trainer_log, True, True, 0)

        self.stack.add_named(box, "trainer")

    def _on_split(self, btn):
        self.trainer_log.clear()
        builder = DatasetBuilder()
        def run():
            result = builder.build_splits()
            GLib.idle_add(lambda: self.trainer_log.append(f"✓ Splits built:\n{result}"))
            return result
        self._run_threaded(run)

    def _on_export(self, btn):
        self.trainer_log.clear()
        self.trainer_log.append("Exporting...")

    # ================================================================
    # MANAGER PAGE
    # ================================================================

    def _build_manager_page(self):
        box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=8)
        box.set_margin_start(12)
        box.set_margin_end(12)
        box.set_margin_top(12)

        box.pack_start(Gtk.Label(label="📦 Corpus Manager", xalign=0), False, False, 0)

        ctrl_box = Gtk.Box(spacing=8)
        ctrl_box.pack_start(self._make_button("Unify All", self._on_mgr_unify), False, False, 0)
        ctrl_box.pack_start(self._make_button("Dedup Corpus", self._on_mgr_dedup), False, False, 0)
        ctrl_box.pack_start(self._make_button("Filter Zolai", self._on_mgr_filter), False, False, 0)
        ctrl_box.pack_start(self._make_button("Refresh Status", self._on_mgr_status), False, False, 0)
        box.pack_start(ctrl_box, False, False, 0)

        self.manager_log = LogView()
        box.pack_start(self.manager_log, True, True, 0)

        self.stack.add_named(box, "manager")

    def _on_mgr_unify(self, btn):
        self.manager_log.clear()
        def run():
            result = do_unify()
            GLib.idle_add(lambda: self.manager_log.append(f"✓ Unified: {result['records']:,} records"))
            GLib.idle_add(lambda: self.manager_log.append(f"  → {result['path']}"))
            return result
        self._run_threaded(run)

    def _on_mgr_dedup(self, btn):
        self.manager_log.clear()
        def run():
            result = do_dedup()
            if "error" in result:
                GLib.idle_add(lambda: self.manager_log.append(f"✗ {result['error']}"))
            else:
                GLib.idle_add(lambda: self.manager_log.append(f"✓ Scanned {result['scanned']:,} → {result['written']:,} unique"))
                GLib.idle_add(lambda: self.manager_log.append(f"  → {result['path']}"))
            return result
        self._run_threaded(run)

    def _on_mgr_filter(self, btn):
        self.manager_log.clear()
        def run():
            result = do_filter()
            if "error" in result:
                GLib.idle_add(lambda: self.manager_log.append(f"✗ {result['error']}"))
            else:
                GLib.idle_add(lambda: self.manager_log.append(f"✓ Scanned {result['scanned']:,} → {result['kept']:,} Zolai lines"))
                GLib.idle_add(lambda: self.manager_log.append(f"  → {result['path']}"))
            return result
        self._run_threaded(run)

    def _on_mgr_status(self, btn):
        self.manager_log.clear()
        data = corpus_status()
        self.manager_log.append("=== Corpus Pipeline Status ===")
        for stage in ("unified", "dedup", "zolai_only"):
            info = data.get(stage, {})
            if info.get("exists"):
                size_mb = info["size_bytes"] / 1_000_000
                self.manager_log.append(f"  {stage}: {info['lines']:,} lines ({size_mb:.1f} MB)")
            else:
                self.manager_log.append(f"  {stage}: (not found)")
        cleaned = data.get("cleaned_dir", {})
        if cleaned.get("exists"):
            self.manager_log.append(f"  cleaned/: {cleaned['lines']:,} files")

    # ================================================================
    # DICTIONARY PAGE
    # ================================================================

    def _build_dictionary_page(self):
        box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=8)
        box.set_margin_start(12)
        box.set_margin_end(12)
        box.set_margin_top(12)

        box.pack_start(Gtk.Label(label="📖 Dictionary", xalign=0), False, False, 0)

        search_box = Gtk.Box(spacing=8)
        self.dict_search = Gtk.Entry()
        self.dict_search.set_placeholder_text("Search Zolai or English...")
        self.dict_search.set_hexpand(True)
        search_box.pack_start(self.dict_search, True, True, 0)
        search_box.pack_start(self._make_button("Search", self._on_dict_search), False, False, 0)
        box.pack_start(search_box, False, False, 0)

        self.dict_log = LogView()
        box.pack_start(self.dict_log, True, True, 0)

        self.stack.add_named(box, "dictionary")

    def _on_dict_search(self, btn):
        query = self.dict_search.get_text().strip()
        if not query:
            return
        self.dict_log.clear()
        self.dict_log.append(f"Searching for '{query}'...")
        results = self.dict_manager.search(query)
        if not results:
            self.dict_log.append(f"No results for '{query}'")
            return
        self.dict_log.append(f"Found {len(results)} entries")
        for entry in results[:20]:
            zolai = entry.get('zolai', '')
            english = entry.get('english', '')
            source = entry.get('source', '')
            example = entry.get('example', '')
            line = f"📖 {zolai} → {english} [{source}]"
            usage = entry.get('usage_hint', '')
            syns = entry.get('synonyms', [])
            if usage:
                line += f"\n   📝 Usage: {usage[:120]}"
            if syns:
                line += f"\n   🔗 Synonyms: {', '.join(syns)}"
            self.dict_log.append(line)

    # ================================================================
    # BIBLE PAGE
    # ================================================================

    def _build_bible_page(self):
        box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=8)
        box.set_margin_start(12)
        box.set_margin_end(12)
        box.set_margin_top(12)

        box.pack_start(Gtk.Label(label="📕 Bible Parallel Data", xalign=0), False, False, 0)

        ctrl_box = Gtk.Box(spacing=8)
        ctrl_box.pack_start(self._make_button("Extract USX", self._on_bible_extract), False, False, 0)
        ctrl_box.pack_start(self._make_button("Build Parallel", self._on_bible_parallel), False, False, 0)
        box.pack_start(ctrl_box, False, False, 0)

        self.bible_log = LogView()
        box.pack_start(self.bible_log, True, True, 0)

        self.stack.add_named(box, "bible")

    def _on_bible_extract(self, btn):
        self.bible_log.clear()
        self.bible_log.append("Extracting Bible USX data...")

    def _on_bible_parallel(self, btn):
        self.bible_log.clear()
        self.bible_log.append("Building Zolai-English parallel pairs...")

    # ================================================================
    # ANALYTICS PAGE
    # ================================================================

    def _build_analytics_page(self):
        box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=8)
        box.set_margin_start(12)
        box.set_margin_end(12)
        box.set_margin_top(12)

        box.pack_start(Gtk.Label(label="📈 Data Analytics & Science", xalign=0), False, False, 0)

        ctrl_box = Gtk.Box(spacing=8)
        ctrl_box.pack_start(self._make_button("Run Analytics", self._on_run_analytics), False, False, 0)
        ctrl_box.pack_start(self._make_button("View Report", self._on_view_report), False, False, 0)
        box.pack_start(ctrl_box, False, False, 0)

        self.analytics_log = LogView()
        box.pack_start(self.analytics_log, True, True, 0)

        self.stack.add_named(box, "analytics")

    def _on_run_analytics(self, btn):
        self.analytics_log.clear()
        self.analytics_log.append("Starting corpus analytics...")

        def run():
            # Use the existing analytics script logic
            from ..shared.utils import ROOT_DIR
            script_path = ROOT_DIR.parent / "workspace/scripts/analytics_tool.py"
            import subprocess
            result = subprocess.run(["python3", str(script_path), "--limit", "100000"], capture_output=True, text=True)
            GLib.idle_add(lambda: self.analytics_log.append(result.stdout))
            if result.stderr:
                GLib.idle_add(lambda: self.analytics_log.append(f"⚠ Errors:\n{result.stderr}"))
            return result

        self._run_threaded(run)

    def _on_view_report(self, btn):
        from ..shared.utils import ROOT_DIR
        report_path = ROOT_DIR.parent / "workspace/scripts/analytics/analytics_report.md"
        if report_path.exists():
            self.analytics_log.clear()
            self.analytics_log.append(f"--- Analytics Report ---\n\n{report_path.read_text()}")
        else:
            self.analytics_log.append("Report not found. Run analytics first.")


class ZolaiApp(Gtk.Application):
    """Main application class."""

    def __init__(self):
        super().__init__(
            application_id="com.zolai.toolkit",
            flags=Gio.ApplicationFlags.FLAGS_NONE,
        )

    def do_activate(self):
        win = ZolaiWindow(self)
        win.show_all()


def launch_gui():
    """Launch the GTK3 GUI."""
    app = ZolaiApp()
    app.run()


if __name__ == "__main__":
    launch_gui()
