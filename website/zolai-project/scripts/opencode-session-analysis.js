#!/usr/bin/env node

/**
 * Opencode Session Analysis Script for MIR Projects
 * Cross-platform Node.js version that works on Linux, macOS, and Windows
 * This script helps find opencode session data related to MIR projects
 * and provides guidance on improving command prompt accuracy
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Opencode Session Analysis for MIR Projects ===');
console.log('');

// Check for opencode configuration
console.log('1. Checking for opencode configuration...');
const localOpencodePath = path.join(process.cwd(), 'opencode.json');
if (fs.existsSync(localOpencodePath)) {
  console.log('   ✓ Found local opencode.json:');
  console.log(fs.readFileSync(localOpencodePath, 'utf8'));
} else {
  console.log('   ✗ No local opencode.json found');
}
console.log('');

// Check for opencode data in home directory
console.log('2. Checking for opencode session data in ~/.opencode...');
const homeDir = process.env.HOME || process.env.USERPROFILE;
const opencodeDir = path.join(homeDir, '.opencode');

if (fs.existsSync(opencodeDir)) {
  console.log('   ✓ Found ~/.opencode directory');
  
  // List files in the directory
  console.log('   Contents of ~/.opencode:');
  try {
    const items = fs.readdirSync(opencodeDir);
    items.forEach(item => {
      const itemPath = path.join(opencodeDir, item);
      const stats = fs.statSync(itemPath);
      console.log(`   ${stats.isDirectory() ? '📁' : '📄'} ${item}`);
    });
  } catch (err) {
    console.log('   Error reading directory:', err.message);
  }
  
  // Check for session/history/log files
  console.log('   Checking for session data files...');
  const sessionFiles = [];
  
  function findFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        findFiles(filePath);
      } else if (/\.(json|log|txt)$/i.test(file) || 
                 /session|history/i.test(file)) {
        sessionFiles.push(filePath);
      }
    }
  }
  
  try {
    findFiles(opencodeDir);
    
    if (sessionFiles.length > 0) {
      console.log('   Found potential session files:');
      sessionFiles.forEach(file => {
        console.log(`     - ${file}`);
      });
    } else {
      console.log('   ✗ No session/history/log files found in ~/.opencode');
    }
  } catch (err) {
    console.log('   Error searching for files:', err.message);
  }
} else {
  console.log('   ✗ No ~/.opencode directory found');
}
console.log('');

// Check for global opencode data
console.log('3. Checking for global opencode data...');
const globalOpencodeDirs = [
  path.join('/', 'usr', 'local', 'share', 'opencode'),
  path.join('/', 'opt', 'opencode'),
  path.join('/', 'var', 'lib', 'opencode'),
  path.join(homeDir, '.local', 'share', 'opencode'),
  path.join(homeDir, '.config', 'opencode')
];

// Add Windows-specific paths
if (process.platform === 'win32') {
  globalOpencodeDirs.push(
    path.join(process.env.PROGRAMDATA || 'C:\\ProgramData', 'opencode'),
    path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'opencode'),
    path.join(process.env.LOCALAPPDATA || `${homeDir}\\AppData\\Local`, 'opencode')
  );
}

let foundGlobal = false;
for (const dir of globalOpencodeDirs) {
  if (fs.existsSync(dir)) {
    console.log(`   ✓ Found opencode directory: ${dir}`);
    try {
      const items = fs.readdirSync(dir);
      console.log(`   Contents (${items.length} items):`);
      items.slice(0, 10).forEach(item => { // Limit output
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);
        console.log(`     ${stats.isDirectory() ? '📁' : '📄'} ${item}`);
      });
      if (items.length > 10) {
        console.log(`     ... and ${items.length - 10} more items`);
      }
    } catch (err) {
      console.log(`   Error reading directory: ${err.message}`);
    }
    foundGlobal = true;
  }
}

if (!foundGlobal) {
  console.log('   ✗ No global opencode directories found');
}
console.log('');

// Provide guidance on improving command prompts
console.log('4. Guidelines for Improving Command Prompt Accuracy:');
console.log('');
console.log('   To get more accurate results from opencode commands, users should:');
console.log('');
console.log('   • Be Specific and Detailed:');
console.log('     Instead of: \'fix the bug\'');
console.log('     Try: \'fix the null pointer exception in the user authentication flow when accessing profile data\'');
console.log('');
console.log('   • Include Context:');
console.log('     Instead of: \'update the login function\'');
console.log('     Try: \'In lib/auth.ts, the validateSession function throws an error when session.token is undefined\'');
console.log('');
console.log('   • State Desired Outcome:');
console.log('     Instead of: \'make it faster\'');
console.log('     Try: \'reduce the API response time for fetching user posts from 2s to under 500ms by implementing caching\'');
console.log('');
console.log('   • Specify Constraints:');
console.log('     Example: \'without breaking existing functionality\' or \'using only React hooks, no external state management libraries\'');
console.log('');
console.log('   • Reference Related Components:');
console.log('     Example: \'update the PostCard component to show author badges, similar to how it\'s done in the NewsCard component\'');
console.log('');
console.log('   • Use Concrete Examples:');
console.log('     Instead of: \'add validation\'');
console.log('     Try: \'add Zod validation to the login API route to require email format and minimum 8-character password\'');
console.log('');
console.log('   • Break Down Complex Requests:');
console.log('     Instead of: \'refactor the admin panel\'');
console.log('     Try: \'separate the user management logic into its own hook in features/admin/hooks/useUserManagement\'');
console.log('');
console.log('   • Mention Specific Files:');
console.log('     Example: \'update the getServerSideProps function in app/posts/[slug]/page.tsx\'');
console.log('');
console.log('   • Include Error Details:');
console.log('     Example: fix the \"Cannot read property map of undefined\" error in the PostsList component');
console.log('');
console.log('   • Specify Testing Requirements:');
console.log('     Example: \'add unit tests for the new password validation utility using Vitest\'');
console.log('');

// Provide recommendations for documentation
console.log('5. Recommended Documentation Additions:');
console.log('');
console.log('   Consider adding these sections to AGENTS.md for better command clarity:');
console.log('');
console.log('   1. Command Template Examples:');
console.log('      • Provide templates for common request types (bug fixes, feature additions, refactoring)');
console.log('');
console.log('   2. Common Pitfalls:');
console.log('      • List frequent mistakes in command formulation and how to avoid them');
console.log('');
console.log('   3. Escalation Path:');
console.log('      • Define when and how to ask for clarification if a request is ambiguous');
console.log('');
console.log('   4. Feedback Loop:');
console.log('      • Describe how to provide feedback on command results to improve future interactions');
console.log('');

console.log('=== Analysis Complete ===');