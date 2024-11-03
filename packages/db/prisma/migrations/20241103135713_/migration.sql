/*
  Warnings:

  - Added the required column `t` to the `SpaceElement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `x` to the `SpaceElement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SpaceElement" ADD COLUMN     "t" INTEGER NOT NULL,
ADD COLUMN     "x" INTEGER NOT NULL;
