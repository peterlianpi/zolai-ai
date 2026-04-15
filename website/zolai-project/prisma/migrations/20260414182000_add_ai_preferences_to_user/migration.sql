-- Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "aiProvider" TEXT DEFAULT 'groq',
  "aiModel" TEXT DEFAULT 'llama-3.3-70b-versatile',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_preferences_userId_key" ON "user_preferences"("userId");