/**
* Role-Based Access Control (RBAC) Middleware
*
* This middleware is used to restrict access to specific routes
* depending on the role of the authenticated user.
*
* Example:
*   - Only "admin" can delete users
*   - "admin" and "manager" can view reports
*   - "staff" has more limited access
*/

/**
* Middleware factory to check if a user has the required role(s).
*
* @function requireRole
* @param {Array<string>} allowedRoles - Array of roles that can access this route
* @returns {Function} Express middleware function
*/
const requireRole = (allowedRoles) => {
 return (req, res, next) => {
   try {
     // Check if the user object exists
     // (this should be attached to req by the authenticateToken middleware)
     if (!req.user) {
       return res.status(401).json({
         success: false,
         message: "Authentication required", // User is not logged in
       });
     }

     // Verify if the authenticated user's role is included in allowedRoles
     if (!allowedRoles.includes(req.user.role)) {
       return res.status(403).json({
         success: false,
         message: `Access denied. Required role: ${allowedRoles.join(" or ")}`, // List allowed roles
       });
     }

     // If user has the required role → continue to the next middleware/route handler
     next();
   } catch (error) {
     // Log the error for debugging
     console.error("RBAC middleware error:", error);

     // Send generic server error response
     res.status(500).json({
       success: false,
       message: "Authorization error",
     });
   }
 };
};

/**
* Predefined role-based middleware for convenience
*
* These are shortcuts for common role combinations
*/
const requireAdmin = requireRole(["admin"]); // Only admins can access
const requireManager = requireRole(["admin", "doctor"]); // Admins and managers
const requireStaff = requireRole(["admin", "doctor", "staff"]); // Admins, managers, and staff
const requirePatient = requireRole(["admin", "doctor", "staff", "patient"]); // All roles
// Export all middlewares so they can be used in route files
module.exports = {
 requireRole,
 requireAdmin,
 requireManager,
 requireStaff,
 requirePatient,
};
