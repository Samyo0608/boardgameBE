const express = require("express");
const path = require("path");
const router = express.Router();
const moment = require("moment");

// 連線資料庫
const connection = require("../../connection/db.js");

//列出booking資料
router.post("/", async (req, res) => {
  let data = await connection.queryAsync("SELECT * FROM booking");
  res.json(data);
});

// 上傳至資料庫

module.exports = router;
