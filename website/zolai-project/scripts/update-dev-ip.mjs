#!/usr/bin/env node
// scripts/update-dev-ip.mjs
// Detects local LAN IP and updates BETTER_AUTH_URL / NEXT_PUBLIC_* in .env.local

import { readFileSync, writeFileSync } from "fs";
import { networkInterfaces } from "os";

function getLocalIp() {
  for (const ifaces of Object.values(networkInterfaces())) {
    for (const iface of ifaces ?? []) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return "localhost";
}

const ip = getLocalIp();
const base = `http://${ip}:3000`;
console.log(`[dev-ip] Using ${base}`);

const envPath = ".env.local";
let content = readFileSync(envPath, "utf8");

const replace = (key, value) => {
  const re = new RegExp(`^(${key}=).*$`, "m");
  return content.includes(`${key}=`)
    ? content.replace(re, `$1${value}`)
    : content + `\n${key}=${value}`;
};

content = replace("BETTER_AUTH_URL", base);
content = replace("NEXT_PUBLIC_APP_URL", base);
content = replace("NEXT_PUBLIC_SITE_URL", base);
content = replace("NEXT_PUBLIC_API_URL", base);

writeFileSync(envPath, content);
console.log(`[dev-ip] .env.local updated`);
