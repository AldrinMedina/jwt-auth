const serverless = require("serverless-http");
const express = require("express");
const app = require("../src/app");

const router = express.Router();
router.use("/admin", app._router); // mount only admin routes

const handler = serverless(router);
module.exports = { handler };
