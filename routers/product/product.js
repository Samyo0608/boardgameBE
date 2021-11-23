const express = require("express");
const path = require("path");
const router = express.Router();
// 密碼加密套件
const bcrypt = require("bcrypt");
// 資料庫連線要求定義
const connection = require("../../connection/db.js");

// 撈出遊戲資料
// router.get("/all", async (req, res) => {
//   let data = await connection.queryAsync("SELECT * FROM product");
//   res.json(data);
// });

// router.get("/all", async (req, res) => {
//   let data = await connection.queryAsync(
//     "SELECT * FROM product WHERE product_id >209 "
//   );
//   res.json(data);
// });

router.get("/all", async (req, res) => {
  let data = await connection.queryAsync("SELECT * FROM product  ");
  res.json(data);
});
router.get("/card", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT * FROM product WHERE product_type ='卡牌' "
  );
  res.json(data);
});

router.get("/strategy", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT * FROM product WHERE product_type ='策略' "
  );
  res.json(data);
});

router.get("/family", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT * FROM product WHERE product_type ='家庭' "
  );
  res.json(data);
});

router.get("/all", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT * FROM product WHERE id = ?;",
    [req.params.id]
  );
});

module.exports = router;
