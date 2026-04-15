#!/usr/bin/env node
import { notify } from '../lib/telegram.ts';

const message = process.argv[2];
if (!message) {
  console.error('Usage: notify.js "message"');
  process.exit(1);
}

await notify(message).catch(err => {
  console.error('Telegram error:', err.message);
});
