"use strict";

/**
* Migration file for creating the "Users" table.
*
* This migration:
* 1. Ensures the PostgreSQL extension `uuid-ossp` is available
*    (used for generating UUID values automatically).
* 2. Creates the "Users" table with proper constraints, defaults, and validations.
* 3. Provides a `down` method to revert changes (drop the table and extension).
*/

module.exports = {
 /**
  * Apply the migration (create Users table).
  *
  * @param {Object} queryInterface - Sequelize interface for database operations
  * @param {Object} Sequelize - Sequelize library for defining datatypes
  */
 async up(queryInterface, Sequelize) {
   // Enable the `uuid-ossp` extension in PostgreSQL
   // This is required for using `uuid_generate_v4()` function
   await queryInterface.sequelize.query(
     `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
   );

   // Create the "Users" table
   await queryInterface.createTable("Users", {
     id: {
       allowNull: false, // Cannot be null (primary key)
       primaryKey: true, // Set as primary key
       type: Sequelize.UUID, // Use UUID data type
       defaultValue: Sequelize.literal("uuid_generate_v4()"), // Auto-generate UUID in DB
     },
     username: {
       type: Sequelize.STRING, // Username stored as string
       allowNull: false, // Required field
       unique: true, // Must be unique (no duplicate usernames)
     },
     email: {
       type: Sequelize.STRING, // Email stored as string
       allowNull: false, // Required field
       unique: true, // Must be unique (no duplicate emails)
       validate: {
         isEmail: true, // Ensures email format is valid (Sequelize validation)
       },
     },
     password: {
       type: Sequelize.STRING, // Store hashed password
       allowNull: false, // Required field
     },
     role: {
       type: Sequelize.ENUM("admin", "manager", "staff"), // Restrict roles to defined values
       allowNull: false,
       defaultValue: "staff", // Default role = staff
     },
     createdAt: {
       allowNull: false,
       type: Sequelize.DATE, // Timestamp when record is created
       defaultValue: Sequelize.NOW, // Defaults to current timestamp
     },
     updatedAt: {
       allowNull: false,
       type: Sequelize.DATE, // Timestamp when record is last updated
       defaultValue: Sequelize.NOW, // Defaults to current timestamp
     },
   });
 },

 /**
  * Revert the migration (drop Users table and extension).
  *
  * @param {Object} queryInterface - Sequelize interface for database operations
  * @param {Object} Sequelize - Sequelize library for defining datatypes
  */
 async down(queryInterface, Sequelize) {
   // Drop the "Users" table
   await queryInterface.dropTable("Users");

   // Remove the `uuid-ossp` extension (cleanup)
   await queryInterface.sequelize.query(
     `DROP EXTENSION IF EXISTS "uuid-ossp";`,
   );
 },
};
