-- Add customRoleId to user table
ALTER TABLE "user" ADD COLUMN "customRoleId" TEXT;

-- Create custom_role table
CREATE TABLE "custom_role" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "baseRole" "UserRole" NOT NULL DEFAULT 'USER',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "custom_role_pkey" PRIMARY KEY ("id")
);

-- Create permission table
CREATE TABLE "permission" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- Create role_permission junction table
CREATE TABLE "role_permission" (
  "id" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "permissionId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE UNIQUE INDEX "custom_role_name_key" ON "custom_role"("name");
CREATE INDEX "custom_role_baseRole_idx" ON "custom_role"("baseRole");
CREATE UNIQUE INDEX "permission_name_key" ON "permission"("name");
CREATE INDEX "permission_category_idx" ON "permission"("category");
CREATE UNIQUE INDEX "role_permission_roleId_permissionId_key" ON "role_permission"("roleId", "permissionId");
CREATE INDEX "role_permission_roleId_idx" ON "role_permission"("roleId");
CREATE INDEX "role_permission_permissionId_idx" ON "role_permission"("permissionId");
CREATE INDEX "user_customRoleId_idx" ON "user"("customRoleId");

-- Add foreign keys
ALTER TABLE "user" ADD CONSTRAINT "user_customRoleId_fkey" FOREIGN KEY ("customRoleId") REFERENCES "custom_role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "custom_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
