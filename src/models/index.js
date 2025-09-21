/**
* Sequelize Model Loader
* ----------------------
* This file initializes Sequelize, connects to the database, and automatically
* loads all model files inside the current directory (`/models`).
*
* Features:
* - Uses environment-specific database config (development/production)
* - Supports loading DB credentials from environment variables
* - Automatically imports all models from this directory
* - Sets up associations between models if defined
*/

const fs = require("fs"); // File system module for reading model files
const path = require("path"); // Utility for handling file/directory paths
const Sequelize = require("sequelize"); // Sequelize ORM
const process = require("process"); // Node.js process module

const basename = path.basename(__filename); // Current filename (index.js)
const env = process.env.NODE_ENV || "development"; // Current environment
const config = require(__dirname + "/../config/database.js")[env]; // Load DB config based on environment

const db = {}; // Object to store all models and Sequelize instance

// ---------------------- Sequelize Initialization ----------------------

// Create Sequelize instance depending on config
let sequelize;
if (config.use_env_variable) {
 // ✅ Use environment variable (e.g., DATABASE_URL)
 sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
 // ✅ Use config values directly (username, password, db name)
 sequelize = new Sequelize(
   config.database,
   config.username,
   config.password,
   config,
 );
}

// ---------------------- Model Loader ----------------------

// Read all files in this directory and import them as Sequelize models
fs.readdirSync(__dirname)
 .filter((file) => {
   // Include only valid model files:
   // - Skip hidden files (starting with .)
   // - Skip this index.js file
   // - Must end with .js
   // - Skip test files (*.test.js)
   return (
     file.indexOf(".") !== 0 &&
     file !== basename &&
     file.slice(-3) === ".js" &&
     file.indexOf(".test.js") === -1
   );
 })
 .forEach((file) => {
   // Import the model definition function
   const model = require(path.join(__dirname, file))(
     sequelize,
     Sequelize.DataTypes,
   );

   // Add model to db object (key = model name)
   db[model.name] = model;
 });

// ---------------------- Associations ----------------------

// If a model has defined associations, call its associate() method
// Example: User.hasMany(Post), Post.belongsTo(User)
Object.keys(db).forEach((modelName) => {
 if (db[modelName].associate) {
   db[modelName].associate(db);
 }
});

// ---------------------- Exports ----------------------

// Attach Sequelize instance and Sequelize class to db object
db.sequelize = sequelize; // The active Sequelize connection
db.Sequelize = Sequelize; // Sequelize library (for data types, operators, etc.)

// Export db object (used in app.js and controllers)
module.exports = db;
