/*
  Warnings:

  - Added the required column `holdTime` to the `CallsHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `callshistory` ADD COLUMN `holdTime` VARCHAR(191) NOT NULL;
