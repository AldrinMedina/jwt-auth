const serverless = require("serverless-http");
const express = require("express");
const app = require("../src/app"); // import your generic app

const router = express.Router();
router.use("/auth", app._router); // mount only auth routes

const handler = serverless(router);
module.exports = { handler };
