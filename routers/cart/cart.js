const express = require("express");
const session = require("express-session");
const router = express.Router();
const connection = require("../../connection/db.js");
const path = require("path");
const moment = require("moment");

// 取得產品資料(cart)
router.get("/", async (req, res) => {
  let product = await connection.queryAsync(
    "SELECT product_id,product_img,product_name,product_price,product_type FROM product"
  );
  res.json(product);
});

// 取得會員資料(check)
router.get("/:account", async (req, res) => {
  if (req.session.member) {
    let member = await connection.queryAsync(
      "SELECT id,account, name, email, phone ,address, point FROM member WHERE account = ?",
      [req.session.member.account]
    );
    res.json(member);
  } else {
    res.json({ message: "上未登入" });
  }
});

// 點數寫入會員資料
router.post("/member/:account", async (req, res) => {
  // 再更新會員點數(前提是結帳輸入的point不能超過原本的)
  // if (req.body.point <= member[0].point) {
  let point = await connection.queryAsync(
    "UPDATE member SET point = ? WHERE account = ?",
    [req.body.newPoint, req.session.member.account]
  );

  res.json({ code: "601", message: "點數更新成功" });
  // }
});

router.post("/order/:account", async (req, res) => {
  // 寫入訂單(product_order)
  let order = await connection.queryAsync(
    "INSERT INTO product_order (user_account,customer_name,customer_phone,customer_email, customer_address,total,created_time,order_check,product_name,product_price,product_count) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [
      req.session.member.account,
      req.body.name,
      req.body.phone,
      req.body.email,
      req.body.address,
      req.body.total,
      moment().format("YYYY-MM-DD"),
      1,
      req.body.proNameString,
      req.body.proPriceString,
      req.body.proCountString,
    ]
  );
  res.json({ code: "602", message: "訂單成功建立" });
});

// 取得產品資料(navbar)
router.post("/nav", async (req, res) => {
  let product = await connection.queryAsync(
    "SELECT product_id FROM product WHERE product_name = ?",
    [req.body.search]
  );
  res.json(product);
});

module.exports = router;
