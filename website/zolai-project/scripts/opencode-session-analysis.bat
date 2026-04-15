@echo off
REM Opencode Session Analysis Script for MIR Projects
REM Windows batch version for cross-platform compatibility
REM This script helps find opencode session data related to MIR projects
REM and provides guidance on improving command prompt accuracy

echo === Opencode Session Analysis for MIR Projects ===
echo.

REM Check for opencode configuration
echo 1. Checking for opencode configuration...
if exist "%cd%\opencode.json" (
    echo   ✓ Found local opencode.json:
    type "%cd%\opencode.json"
) else (
    echo   ✗ No local opencode.json found
)
echo.

REM Check for opencode data in home directory
echo 2. Checking for opencode session data in ~/.opencode...
for %%I in (%USERPROFILE%) do set "HOMEDIR=%%I"
set "OPENCODE_DIR=%HOMEDIR%\.opencode"

if exist "%OPENCODE_DIR%" (
    echo   ✓ Found %OPENCODE_DIR%
    
    REM List files in the directory
    echo   Contents of %OPENCODE_DIR%:
    dir "%OPENCODE_DIR%"
    
    REM Check for session/history/log files
    echo   Checking for session data files...
    set "SESSION_FILES="
    for /r "%OPENCODE_DIR%" %%F in (*.json *.log *.txt *session* *history*) do (
        if not defined SESSION_FILES (
            set "SESSION_FILES=%%F"
        ) else (
            set "SESSION_FILES=!SESSION_FILES! %%F"
        )
    )
    
    if defined SESSION_FILES (
        echo   Found potential session files:
        for %%F in (!SESSION_FILES!) do (
            echo     - %%F
        )
    ) else (
        echo   ✗ No session/history/log files found in %OPENCODE_DIR%
    )
) else (
    echo   ✗ No %OPENCODE_DIR% directory found
)
echo.

REM Check for global opencode data
echo 3. Checking for global opencode data...
set "GLOBAL_DIRS=%PROGRAMDATA%\opencode %PROGRAMFILES%\opencode %LOCALAPPDATA%\opencode"
if defined ProgramW6432 (
    set "GLOBAL_DIRS=%GLOBAL_DIRS% %PROGRAMFILES(X86)%\opencode"
)

set "FOUND_GLOBAL=false"
for %%D in (%GLOBAL_DIRS%) do (
    if exist "%%D" (
        echo   ✓ Found opencode directory: %%D
        dir "%%D"
        set "FOUND_GLOBAL=true"
    )
)

if "!FOUND_GLOBAL!"=="false" (
    echo   ✗ No global opencode directories found
)
echo.

REM Provide guidance on improving command prompts
echo 4. Guidelines for Improving Command Prompt Accuracy:
echo.
echo   To get more accurate results from opencode commands, users should:
echo.
echo   • Be Specific and Detailed:
echo     Instead of: 'fix the bug'
echo     Try: 'fix the null pointer exception in the user authentication flow when accessing profile data'
echo.
echo   • Include Context:
echo     Instead of: 'update the login function'
echo     Try: 'In lib/auth.ts, the validateSession function throws an error when session.token is undefined'
echo.
echo   • State Desired Outcome:
echo     Instead of: 'make it faster'
echo     Try: 'reduce the API response time for fetching user posts from 2s to under 500ms by implementing caching'
echo.
echo   • Specify Constraints:
echo     Example: 'without breaking existing functionality' or 'using only React hooks, no external state management libraries'
echo.
echo   • Reference Related Components:
echo     Example: 'update the PostCard component to show author badges, similar to how it''s done in the NewsCard component'
echo.
echo   • Use Concrete Examples:
echo     Instead of: 'add validation'
echo     Try: 'add Zod validation to the login API route to require email format and minimum 8-character password'
echo.
echo   • Break Down Complex Requests:
echo     Instead of: 'refactor the admin panel'
echo     Try: 'separate the user management logic into its own hook in features/admin/hooks/useUserManagement'
echo.
echo   • Mention Specific Files:
echo     Example: 'update the getServerSideProps function in app/posts/[slug]/page.tsx'
echo.
echo   • Include Error Details:
echo     Example: fix the "Cannot read property map of undefined" error in the PostsList component
echo.
echo   • Specify Testing Requirements:
echo     Example: add unit tests for the new password validation utility using Vitest
echo.

REM Provide recommendations for documentation
echo 5. Recommended Documentation Additions:
echo.
echo   Consider adding these sections to AGENTS.md for better command clarity:
echo.
echo   1. Command Template Examples:
echo      • Provide templates for common request types (bug fixes, feature additions, refactoring)
echo.
echo   2. Common Pitfalls:
echo      • List frequent mistakes in command formulation and how to avoid them
echo.
echo   3. Escalation Path:
echo      • Define when and how to ask for clarification if a request is ambiguous
echo.
echo   4. Feedback Loop:
echo      • Describe how to provide feedback on command results to improve future interactions
echo.

echo === Analysis Complete ===