from __future__ import annotations

import os
import sys

import torch


def get_device() -> torch.device:
    """Get optimal device (GPU if available, else CPU with optimizations)."""
    if torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"Using GPU: {torch.cuda.get_device_name(0)}", file=sys.stderr)
        return device

    print("Using CPU (4 cores, 7.7GB RAM) — enable gradient checkpointing", file=sys.stderr)
    return torch.device("cpu")


def get_torch_dtype() -> torch.dtype:
    """Get optimal dtype for device."""
    if torch.cuda.is_available():
        return torch.float16 if torch.cuda.is_available() else torch.float32
    return torch.float32  # CPU: use float32


def get_batch_size(base_size: int = 8) -> int:
    """Get safe batch size for device."""
    if torch.cuda.is_available():
        return base_size * 2
    return max(1, base_size // 4)  # CPU: reduce batch size


def get_num_workers() -> int:
    """Get optimal num_workers for DataLoader."""
    return min(4, os.cpu_count() or 1)


def setup_cpu_optimization() -> None:
    """Apply CPU-specific optimizations."""
    if not torch.cuda.is_available():
        # Disable CUDA overhead
        os.environ["CUDA_VISIBLE_DEVICES"] = ""
        # Enable CPU threading optimization
        torch.set_num_threads(os.cpu_count() or 4)
        torch.set_num_interop_threads(1)
