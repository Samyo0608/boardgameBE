const express = require("express");
const session = require("express-session");
const router = express.Router();
const connection = require("../../connection/db.js");
const path = require("path");

router.get("/", async (req, res) => {
  let product = await connection.queryAsync(
    "SELECT product_id,product_img,product_name,product_price,product_type FROM product"
  );
  res.json(product);
});

router.get("/:account", async (req, res) => {
  let member = await connection.queryAsync(
    "SELECT account, name, email, phone ,address, point FROM member WHERE account = ?",
    [req.params.account]
  );
  res.json(member);
});

module.exports = router;
