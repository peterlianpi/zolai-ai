#!/bin/bash

# Opencode Session Analysis Script for Zolai AI Projects
# This script helps find opencode session data related to Zolai AI projects
# and provides guidance on improving command prompt accuracy

set -euo pipefail

echo "=== Opencode Session Analysis for Zolai AI Projects ==="
echo ""

# Check for opencode configuration
echo "1. Checking for opencode configuration..."
if [ -f "./opencode.json" ]; then
  echo "   ✓ Found local opencode.json:"
  cat ./opencode.json
else
  echo "   ✗ No local opencode.json found"
fi

echo ""

# Check for opencode data in home directory
echo "2. Checking for opencode session data in ~/.opencode..."
if [ -d "$HOME/.opencode" ]; then
  echo "   ✓ Found ~/.opencode directory"
  
  # List files in the directory
  echo "   Contents of ~/.opencode:"
  ls -la "$HOME/.opencode"
  
  # Check for session/history/log files
  echo "   Checking for session data files..."
  SESSION_FILES=$(find "$HOME/.opencode" -type f \( -name "*session*" -o -name "*history*" -o -name "*log*" -o -name "*.json" -o -name "*.txt" \) 2>/dev/null | head -10 || echo "No session files found")
  
  if [ "$SESSION_FILES" != "No session files found" ]; then
    echo "   Found potential session files:"
    echo "$SESSION_FILES" | while read -r file; do
      echo "     - $file"
    done
  else
    echo "   ✗ No session/history/log files found in ~/.opencode"
  fi
else
  echo "   ✗ No ~/.opencode directory found"
fi

echo ""

# Check for global opencode data
echo "3. Checking for global opencode data..."
GLOBAL_OPCODE_DIRS=(
  "/usr/local/share/opencode"
  "/opt/opencode"
  "/var/lib/opencode"
  "$HOME/.local/share/opencode"
  "$HOME/.config/opencode"
)

FOUND_GLOBAL=false
for dir in "${GLOBAL_OPCODE_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "   ✓ Found opencode directory: $dir"
    ls -la "$dir"
    FOUND_GLOBAL=true
  fi
done

if [ "$FOUND_GLOBAL" = false ]; then
  echo "   ✗ No global opencode directories found"
fi

echo ""

# Provide guidance on improving command prompts
echo "4. Guidelines for Improving Command Prompt Accuracy:"
echo ""
echo "   To get more accurate results from opencode commands, users should:"
echo ""
echo "   • Be Specific and Detailed:"
echo "     Instead of: 'fix the bug'"
echo "     Try: 'fix the null pointer exception in the user authentication flow when accessing profile data'"
echo ""
echo "   • Include Context:"
echo "     Instead of: 'update the login function'"
echo "     Try: 'In lib/auth.ts, the validateSession function throws an error when session.token is undefined'"
echo ""
echo "   • State Desired Outcome:"
echo "     Instead of: 'make it faster'"
echo "     Try: 'reduce the API response time for fetching user posts from 2s to under 500ms by implementing caching'"
echo ""
echo "   • Specify Constraints:"
echo "     Example: 'without breaking existing functionality' or 'using only React hooks, no external state management libraries'"
echo ""
echo "   • Reference Related Components:"
echo "     Example: 'update the PostCard component to show author badges, similar to how it's done in the NewsCard component'"
echo ""
echo "   • Use Concrete Examples:"
echo "     Instead of: 'add validation'"
echo "     Try: 'add Zod validation to the login API route to require email format and minimum 8-character password'"
echo ""
echo "   • Break Down Complex Requests:"
echo "     Instead of: 'refactor the admin panel'"
echo "     Try: 'separate the user management logic into its own hook in features/admin/hooks/useUserManagement'"
echo ""
echo "   • Mention Specific Files:"
echo "     Example: 'update the getServerSideProps function in app/posts/[slug]/page.tsx'"
echo ""
echo "   • Include Error Details:"
echo "     Example: 'fix the \"Cannot read property map of undefined\" error in the PostsList component'"
echo ""
echo "   • Specify Testing Requirements:"
echo "     Example: 'add unit tests for the new password validation utility using Vitest'"
echo ""

# Provide recommendations for documentation
echo "5. Recommended Documentation Additions:"
echo ""
echo "   Consider adding these sections to AGENTS.md for better command clarity:"
echo ""
echo "   1. Command Template Examples:"
echo "      • Provide templates for common request types (bug fixes, feature additions, refactoring)"
echo ""
echo "   2. Common Pitfalls:"
echo "      • List frequent mistakes in command formulation and how to avoid them"
echo ""
echo "   3. Escalation Path:"
echo "      • Define when and how to ask for clarification if a request is ambiguous"
echo ""
echo "   4. Feedback Loop:"
echo "      • Describe how to provide feedback on command results to improve future interactions"
echo ""

echo "=== Analysis Complete ==="