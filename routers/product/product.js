const express = require("express");
const path = require("path");
const router = express.Router();
// 密碼加密套件
const bcrypt = require("bcrypt");
// 資料庫連線要求定義
const connection = require("../../connection/db.js");

// 撈出遊戲資料
router.get("/", async (req, res) => {
  let data = await connection.queryAsync("SELECT * FROM product");
  res.json(data);
});

// router.get("/:id", async (req, res) => {
//   let data = await connection.queryAsync(
//     "SELECT * FROM product WHERE id = ?;",
//     [req.params.id]
//   );
// });

module.exports = router;
