/*
  Warnings:

  - You are about to drop the column `appointmentCancelledNotif` on the `user_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `appointmentCreatedNotif` on the `user_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `appointmentRescheduledNotif` on the `user_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `bufferTime` on the `user_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `defaultDuration` on the `user_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `emailReminders` on the `user_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `inAppReminders` on the `user_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `reminderEnabled` on the `user_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `reminderHoursBefore` on the `user_preferences` table. All the data in the column will be lost.
  - You are about to drop the `appointment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "appointment" DROP CONSTRAINT "appointment_userId_fkey";

-- AlterTable
ALTER TABLE "user_preferences" DROP COLUMN "appointmentCancelledNotif",
DROP COLUMN "appointmentCreatedNotif",
DROP COLUMN "appointmentRescheduledNotif",
DROP COLUMN "bufferTime",
DROP COLUMN "defaultDuration",
DROP COLUMN "emailReminders",
DROP COLUMN "inAppReminders",
DROP COLUMN "reminderEnabled",
DROP COLUMN "reminderHoursBefore";

-- DropTable
DROP TABLE "appointment";

-- DropEnum
DROP TYPE "AppointmentStatus";
