const serverless = require("serverless-http");
const express = require("express");
const app = require("../src/app");

const router = express.Router();
router.use("/medicines", app._router);

const handler = serverless(router);
module.exports = { handler };
