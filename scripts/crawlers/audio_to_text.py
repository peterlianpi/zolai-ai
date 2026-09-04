#!/usr/bin/env python3
from __future__ import annotations

import argparse
import subprocess
from pathlib import Path


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def main() -> int:
    p = argparse.ArgumentParser(description="Download audio (YouTube/URL) and transcribe to text for Tedim data collection.")
    p.add_argument("url", help="Video/audio URL (YouTube, etc.)")
    p.add_argument("--out", default="data/raw/audio_transcripts", help="Output directory")
    p.add_argument("--lang", default="en", help="Whisper language hint (use 'en' if unknown)")
    p.add_argument("--model", default="small", help="Whisper model size (tiny/base/small/medium/large-v3)")
    args = p.parse_args()

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    audio_path = out_dir / "audio.%(ext)s"

    # 1) Download audio
    # Requires: yt-dlp installed (pip install yt-dlp)
    run(
        [
            "yt-dlp",
            "-x",
            "--audio-format",
            "wav",
            "-o",
            str(audio_path),
            args.url,
        ]
    )

    wav_files = sorted(out_dir.glob("audio*.wav"))
    if not wav_files:
        raise SystemExit("No audio WAV file found after download.")
    wav = wav_files[0]

    # 2) Transcribe
    # Prefer faster-whisper if installed; fallback to whisper CLI if present.
    txt_out = out_dir / "transcript.txt"

    try:
        from faster_whisper import WhisperModel  # type: ignore

        model = WhisperModel(args.model, device="cpu", compute_type="int8")
        segments, info = model.transcribe(str(wav), language=args.lang)
        with txt_out.open("w", encoding="utf-8") as f:
            f.write(f"# source: {args.url}\n")
            f.write(f"# language: {info.language}\n\n")
            for s in segments:
                f.write(s.text.strip() + "\n")
        print(f"Wrote: {txt_out}")
        return 0
    except Exception:
        pass

    # Fallback: openai-whisper CLI (pip install openai-whisper)
    try:
        run(
            [
                "whisper",
                str(wav),
                "--model",
                args.model,
                "--language",
                args.lang,
                "--output_format",
                "txt",
                "--output_dir",
                str(out_dir),
            ]
        )
        whisper_txt = next(iter(out_dir.glob("audio*.txt")), None)
        if whisper_txt:
            whisper_txt.rename(txt_out)
        print(f"Wrote: {txt_out}")
        return 0
    except Exception as e:
        raise SystemExit(
            "Transcription failed.\n"
            "- Install yt-dlp: pip install yt-dlp\n"
            "- Install faster-whisper: pip install faster-whisper\n"
            "  (or openai-whisper: pip install openai-whisper)\n"
            f"Error: {e}"
        )


if __name__ == "__main__":
    raise SystemExit(main())

