const express = require("express");
const router = express.Router();
const multer = require("multer");
var upload = multer();
const moment = require("moment");
const connection = require("../connection/db.js");

// 列表：全部資料
router.get("/", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT A.id,A.type,A.title,A.user_id as i_user_id,B.user_id,temp.created_at,temp.cot FROM discuss as A JOIN (SELECT MAX(created_at) as created_at,discuss_id,COUNT(*) as cot FROM discuss_content GROUP BY discuss_id) as temp  ON A.id=temp.discuss_id JOIN discuss_content as B on B.created_at=temp.created_at ORDER BY temp.created_at DESC"
  );
  res.json(data);
});

// 點擊單筆進入查看
router.get("/reply/:discuss_id", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT * FROM discuss_content WHERE discuss_id=?",
    [decodeURI(req.params.discuss_id)]
    // 後端收到中文要用decodeURI
  );
  res.json(data);
});

// 取得標題名稱
router.get("/title/:discuss_id", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT * FROM discuss WHERE id=?",
    [decodeURI(req.params.discuss_id)]
    // 後端收到中文要用decodeURI
  );
  res.json(data);
});

// 取得每人發文數量
router.get("/discussCount", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT user_id,COUNT(*) as cot FROM discuss_content WHERE floor=0 GROUP BY user_id"
  );
  res.json(data);
});

// 取得每人回覆數量
router.get("/replyCount", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT user_id,COUNT(*) as cot FROM discuss_content WHERE floor=1 GROUP BY user_id"
  );
  res.json(data);
});

// 新增回覆
router.post("/insertDiscuss", upload.array(), async (req, res) => {
  console.log("req.body", req.body);
  let data = await connection.queryAsync(
    "INSERT INTO discuss_content (discuss_id, user_id, content, floor,created_at) VALUES (?)",
    [
      [
        req.body.discuss_id,
        req.body.user_id,
        req.body.content,
        req.body.floor,
        moment().format("YYYY/MM/DD HH:mm:ss"),
      ],
    ]
  );
  res.send(req.body);
  // res.json({ code: "0", message: "已建立" });
});

module.exports = router;
