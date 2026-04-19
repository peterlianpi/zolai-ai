#!/bin/bash
# Usage: bash setup_vps.sh <vps-ip> <key.pem> <region>
# Region examples: us-1, us-2, sgp-1, jp-1
set -e

VPS_IP="${1:?Usage: $0 <vps-ip> <key.pem> <region>}"
KEY="${2:?Usage: $0 <vps-ip> <key.pem> <region>}"
REGION="${3:?Usage: $0 <vps-ip> <key.pem> <region>}"   # e.g. us-1, sgp-1, jp-1

CF_TOKEN="cfut_U1IeJuYJgtpZX5HDMH7eMSvHT32mhk7uzxuxGsP53256cc52"
CF_ZONE_ID="peterlianpi.site"   # will be resolved via API
DOMAIN="peterlianpi.site"

chmod 600 "$KEY"

# ── Resolve Zone ID ───────────────────────────────────────────────────────────
ZONE_ID=$(curl -s "https://api.cloudflare.com/client/v4/zones?name=${DOMAIN}" \
  -H "Authorization: Bearer ${CF_TOKEN}" | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['result'][0]['id'])")

add_dns() {
  local name="$1" proxied="$2"
  curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
    -H "Authorization: Bearer ${CF_TOKEN}" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"A\",\"name\":\"${name}\",\"content\":\"${VPS_IP}\",\"ttl\":1,\"proxied\":${proxied}}" | \
    python3 -c "import sys,json; r=json.load(sys.stdin); print('  +', r['result'].get('name',''), '→', r['result'].get('content',''), '(proxied:' + str(r['result'].get('proxied')) + ')')"
}

echo "Adding DNS records for region: ${REGION}"
add_dns "${REGION}.${DOMAIN}"           false   # direct:  us-1.peterlianpi.site
add_dns "admin-${REGION}.${DOMAIN}"    true    # proxied: admin-us-1.peterlianpi.site
add_dns "sub-${REGION}.${DOMAIN}"      true    # sub url: sub-us-1.peterlianpi.site (proxied)

# ── Install 3x-ui on VPS ─────────────────────────────────────────────────────
ssh -i "$KEY" -o StrictHostKeyChecking=no root@"$VPS_IP" bash <<EOF
set -e
bash <(curl -Ls https://raw.githubusercontent.com/mhsanaei/3x-ui/master/install.sh) <<ANSWERS
y
peterlianpi
Apple@298
443
ANSWERS
echo "✅ 3x-ui installed on port 443"
EOF

echo ""
echo "✅ Done. DNS records created:"
echo "   Direct (no proxy) : ${REGION}.${DOMAIN}       → ${VPS_IP}"
echo "   Admin  (proxied)  : admin-${REGION}.${DOMAIN} → ${VPS_IP}"
echo "   Sub URL (proxied) : sub-${REGION}.${DOMAIN}   → ${VPS_IP}"
echo ""
echo "   3x-ui panel : https://admin-${REGION}.${DOMAIN}"
echo "   Sub URL base: https://sub-${REGION}.${DOMAIN}"
