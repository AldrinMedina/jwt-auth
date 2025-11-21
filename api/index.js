const serverless = require("serverless-http");
const app = require("../src/app"); // your existing Express app

module.exports = serverless(app);
