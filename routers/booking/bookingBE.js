const express = require("express");
const router = express.Router();
const moment = require("moment");

// 連線資料庫
const connection = require("../../connection/db.js");

//列出booking資料
router.post("/", async (req, res) => {
  let data = await connection.queryAsync("SELECT * FROM booking");
  res.json(data);
});

router.post("/order", async (req, res) => {
  console.log("req.body", req.body);
  let result = await connection.queryAsync(
    "INSERT INTO booking (room,name,phone,email,startTime,endTime,order_date) VALUES (?)",
    [
      [
        req.body.room,
        req.body.name,
        req.body.phone,
        req.body.email,
        req.body.startTime,
        req.body.endTime,
        moment().format("YYYY-MM-DD"),
      ],
    ]
  );
  res.send(req.body);
});

module.exports = router;
