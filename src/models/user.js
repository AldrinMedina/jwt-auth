"use strict";

/**
 * User Model
 * ----------
 * Represents a user in the system.
 *
 * Features:
 * - Stores username, email, password, and role
 * - Validates input (length, email format, uniqueness, role restrictions)
 * - Hashes passwords automatically before saving
 * - Provides helper methods:
 *    - validatePassword(): Compare entered password with stored hash
 *    - toJSON(): Remove sensitive fields (e.g., password) when returning data
 */

const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Define model associations.
     * Called automatically by models/index.js
     *
     * Example:
     *   User.hasMany(models.Post);
     */
    static associate(models) {
      // Add relationships here if needed
    }

    /**
     * Validate user password.
     * Compares a plain text password with the stored hashed password.
     *
     * @param {string} password - The plain text password to check
     * @returns {Promise<boolean>} True if password matches, false otherwise
     */
    async validatePassword(password) {
      return bcrypt.compare(password, this.password);
    }

    /**
     * Customize JSON output.
     * Removes sensitive fields like password before sending data in API responses.
     *
     * @returns {Object} User object without sensitive data
     */
    toJSON() {
      const values = { ...this.get() };
      delete values.password; // Never expose password in API response
      return values;
    }
  }

  // ---------------------- Model Definition ----------------------
  User.init(
    {
      // Unique username (required, 3-50 chars)
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "Username already exists",
        },
        validate: {
          len: {
            args: [3, 50],
            msg: "Username must be between 3 and 50 characters",
          },
        },
      },

      // Unique email (required, must be valid format)
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "Email already exists",
        },
        validate: {
          isEmail: {
            msg: "Must be a valid email address",
          },
        },
      },

      // Password (required, minimum 6 chars, stored as hashed)
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [6, 100],
            msg: "Password must be at least 6 characters long",
          },
        },
      },

      // User role (restricted to admin, manager, or staff)
      role: {
        type: DataTypes.ENUM("admin", "doctor", "staff", "patient"),
        allowNull: false,
        defaultValue: "staff", // Default role for new users
        validate: {
          isIn: {
            args: [["admin", "doctor", "staff", "patient"]],
            msg: "Role must be admin, doctor, staff, or patient",
          },
        },
      },

      // in models/User.js
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },

    },
    {
      sequelize, // Sequelize instance
      modelName: "User", // Table name will be `Users`

      hooks: {
        /**
         * Hash password before saving a new user.
         */
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10); // Generate salt
            user.password = await bcrypt.hash(user.password, salt); // Hash password
          }
        },

        /**
         * Hash password before updating user (if password changed).
         */
        beforeUpdate: async (user) => {
          console.log("Running beforeUpdate hook for:", user.email); // 🟢 debug log
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    },
  );

  return User;
};
