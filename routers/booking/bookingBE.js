const express = require("express");
const router = express.Router();
const moment = require("moment");

// 連線資料庫
const connection = require("../../connection/db.js");

// 列出會員的租賃資料
router.get("/rent", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT * FROM booking WHERE email = ?",
    [req.session.member.email]
  );
  console.log(req.session);
  res.json(data);
});

// 刪除會員的租賃資料
router.post("/deleteRent", async (req, res) => {
  console.log(req.body);
  console.log(req.session.member.email);
  let data = await connection.queryAsync(
    "UPDATE booking SET status='已取消',valid=0 WHERE email = ? AND booking_id = ?",
    [req.session.member.email, req.body.roomId]
  );
  res.json(data);
});

// 修改會員的租賃資料
// router.post("/editRent", async (req, res) => {
//   let data = await connection.queryAsync(
//     "UPDATE booking SET room=? WHERE email=?",
//     [req.body.email, req.session.member.email]
//   );
//   res.json(data);
// });

//列出booking資料
router.post("/", async (req, res) => {
  let data = await connection.queryAsync("SELECT * FROM booking WHERE valid=1");
  res.json(data);
});

router.post("/order", async (req, res) => {
  console.log("req.body", req.body);
  let result = await connection.queryAsync(
    "INSERT INTO booking (booking_id,room,status,name,phone,email,startTime,endTime,order_date,valid) VALUES (?)",
    [
      [
        req.body.booking_id,
        req.body.room,
        req.body.status,
        req.body.name,
        req.body.phone,
        req.body.email,
        req.body.startTime,
        req.body.endTime,
        moment().format("YYYY-MM-DD"),
        req.body.valid,
      ],
    ]
  );
  res.send(req.body);
});

module.exports = router;
