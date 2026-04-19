# Config

Project configuration files for training, deployment, and services.

| File | Purpose |
|------|---------|
| `zolai_qwen_7b_lora.yaml` | LoRA fine-tuning config for Qwen2.5-7B |
| `cpu_optimization.yaml` | CPU/hardware optimization settings |
| `zolai-chat.service` | Systemd service for chat server |
| `zolai-telegram-bot.service` | Systemd service for Telegram bot |
| `machine.py` | Machine detection and hardware config |
| `tools-setup.md` | Dev environment setup guide |
| `env/.env.example` | Environment variable template |

## Usage

```bash
# Install systemd services
sudo cp config/zolai-chat.service /etc/systemd/system/
sudo systemctl enable zolai-chat
sudo systemctl start zolai-chat
```
