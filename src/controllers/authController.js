const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { Op } = require("sequelize");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

/**
* Utility: Generate JWT token for a user
* ----------------------------------------------------
* - Encodes user ID, email, and role into the token
* - Uses a secret key (JWT_SECRET) from environment variables
* - Default expiration = 7 days (can be overridden with JWT_EXPIRES_IN)
*
* @param {Object} user - User instance
* @returns {string} JWT token
*/
const generateToken = (user) => {
 return jwt.sign(
   {
     userId: user.id,
     email: user.email,
     role: user.role,
   },
   process.env.JWT_SECRET,
   {
     expiresIn: process.env.JWT_EXPIRES_IN || "7d",
   },
 );
};

/**
* Controller: Register a new user
* ----------------------------------------------------
* - Validates input (username, email, password required)
* - Hashing is handled by Sequelize model hook
* - Creates user and generates JWT for immediate login
*
* @route POST /api/auth/register
* @access Public
*/
const register = async (req, res) => {
 try {
   const { username, email, password, role } = req.body;

   // Validate required fields
   if (!username || !email || !password) {
     return res.status(400).json({
       success: false,
       message: "Username, email, and password are required",
     });
   }

   // Create new user in database
   // Role defaults to "staff" if not provided
   const user = await User.create({
     username,
     email,
     password,
     role: role || "staff",
   });

   // Generate token for new user
   const token = generateToken(user);

   res.status(201).json({
     success: true,
     message: "User registered successfully",
     data: {
       user: user.toJSON(), // Removes password automatically
       token,
     },
   });
 } catch (error) {
   console.error("Registration error:", error);

   // Handle validation errors (e.g. invalid email format)
   if (error.name === "SequelizeValidationError") {
     const messages = error.errors.map((err) => err.message);
     return res.status(400).json({
       success: false,
       message: "Validation failed",
       errors: messages,
     });
   }

   // Handle duplicate username/email
   if (error.name === "SequelizeUniqueConstraintError") {
     const field = error.errors[0].path;
     return res.status(400).json({
       success: false,
       message: `${field} already exists`,
     });
   }

   // Generic server error
   res.status(500).json({
     success: false,
     message: "Internal server error",
   });
 }
};

/**
* Controller: Login user
* ----------------------------------------------------
* - Validates input (email + password required)
* - Finds user by email
* - Validates password with bcrypt
* - Returns JWT token on success
*
* @route POST /api/auth/login
* @access Public
*/
const login = async (req, res) => {
 try {
   const { email, password } = req.body;

   // Check if required fields are provided
   if (!email || !password) {
     return res.status(400).json({
       success: false,
       message: "Email and password are required",
     });
   }

   // Find user by email (include password for validation)
   const user = await User.findOne({
     where: { email },
     attributes: [
       "id",
       "username",
       "email",
       "password",
       "role",
       "createdAt",
       "updatedAt",
     ],
   });

   if (!user) {
     return res.status(401).json({
       success: false,
       message: "Invalid email or password",
     });
   }

   // Validate password using instance method
   const isValidPassword = await user.validatePassword(password);
   if (!isValidPassword) {
     return res.status(401).json({
       success: false,
       message: "Invalid email or password",
     });
   }

   // Generate JWT token
   const token = generateToken(user);

   res.json({
     success: true,
     message: "Login successful",
     data: {
       user: user.toJSON(), // Removes password automatically
       token,
     },
   });
 } catch (error) {
   console.error("Login error:", error);
   res.status(500).json({
     success: false,
     message: "Internal server error",
   });
 }
};

/**
* Controller: Get Current User Profile
* ----------------------------------------------------
* - Uses `authenticateToken` middleware to set req.user
* - Returns the logged-in user's data (no password)
*
* @route GET /api/auth/profile
* @access Private
*/
const getProfile = async (req, res) => {
 try {
   res.json({
     success: true,
     data: {
       user: req.user.toJSON(),
     },
   });
 } catch (error) {
   console.error("Get profile error:", error);
   res.status(500).json({
     success: false,
     message: "Internal server error",
   });
 }
};

/**
 * Controller: Update User
 * ----------------------------------------------------
 * - Admins can update any user (including role)
 * - Regular users can only update their own profile
 * - Password update is optional (hashing handled by model hook)
 *
 * @route PUT /api/users/:id
 * @access Private (Admin or Self)
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    // Find the user by ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check permission: Admins can edit anyone, 
    // normal users can only edit themselves (and not their role)
    if (req.user.role !== "admin" && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this user",
      });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password; // will be hashed by model hook
    if (req.user.role === "admin" && role) {
      user.role = role; // only admins can change roles
    }

    await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      const field = error.errors[0].path;
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }

    console.log("Reset request received for token:", token); // 🟡 debug

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      console.log("❌ Invalid or expired token");
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    console.log("✅ Found user:", user.email);

    // Force Sequelize to detect the change
    user.setDataValue("password", newPassword);
    user.changed("password", true);

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    console.log("💾 Saving user with new password...");
    await user.save({ individualHooks: true });
    console.log("✅ User saved successfully!");

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account with that email" });
    }

    // Generate a reset token (random string)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save to database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Email setup (use your SMTP settings)
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email with reset link
    const resetURL = `${process.env.FRONTEND_URL}/reset_password?token=${resetToken}`;
    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset Request",
      html: `
        <h3>Hello ${user.username},</h3>
        <p>You requested to reset your password.</p>
        <p>Click the link below to set a new password:</p>
        <a href="${resetURL}">${resetURL}</a>
        <p>This link expires in 1 hour.</p>
      `,
    });

    res.json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
 register,
 login,
 getProfile,
 updateUser,
 forgotPassword,
 resetPassword, 
};
