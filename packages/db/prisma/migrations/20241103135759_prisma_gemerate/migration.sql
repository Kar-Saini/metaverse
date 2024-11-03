/*
  Warnings:

  - You are about to drop the column `t` on the `SpaceElement` table. All the data in the column will be lost.
  - Added the required column `y` to the `SpaceElement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SpaceElement" DROP COLUMN "t",
ADD COLUMN     "y" INTEGER NOT NULL;
