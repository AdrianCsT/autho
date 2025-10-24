/*
  Warnings:

  - You are about to drop the `_UserRoles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `roleId` to the `User` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add roleId column as nullable first
ALTER TABLE `User` ADD COLUMN `roleId` VARCHAR(191) NULL;

-- Step 2: Migrate existing data - assign first role from many-to-many relationship
UPDATE `User` u
INNER JOIN `_UserRoles` ur ON u.id = ur.B
SET u.roleId = ur.A
WHERE u.roleId IS NULL;

-- Step 3: For any users without a role, assign default 'user' role
UPDATE `User` u
SET u.roleId = (SELECT id FROM `Role` WHERE name = 'user' LIMIT 1)
WHERE u.roleId IS NULL;

-- Step 4: Make roleId required now that all users have a role
ALTER TABLE `User` MODIFY COLUMN `roleId` VARCHAR(191) NOT NULL;

-- Step 5: Drop the old many-to-many relationship
-- DropForeignKey
ALTER TABLE `_UserRoles` DROP FOREIGN KEY `_UserRoles_A_fkey`;

-- DropForeignKey
ALTER TABLE `_UserRoles` DROP FOREIGN KEY `_UserRoles_B_fkey`;

-- DropTable
DROP TABLE `_UserRoles`;

-- Step 6: Add foreign key constraint
-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
