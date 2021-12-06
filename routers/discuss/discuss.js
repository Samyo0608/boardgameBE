const express = require("express");
const router = express.Router();
const multer = require("multer");
var upload = multer();
const moment = require("moment");
const connection = require("../../connection/db.js");

// 列表：全部資料
router.get("/", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT A.id,A.type,A.title,A.user_id as i_user_id,B.user_id,temp.created_at,temp.cot,C.account as i_user_name,D.account as user_name FROM discuss as A JOIN (SELECT MAX(created_at) as created_at,discuss_id,COUNT(*) as cot FROM discuss_content GROUP BY discuss_id) as temp  ON A.id=temp.discuss_id JOIN discuss_content as B on B.created_at=temp.created_at JOIN member as C ON C.id=A.user_id JOIN member as D ON D.id=B.user_id ORDER BY temp.created_at DESC"
  );
  res.json(data);
});

// 列表：全部資料(照回覆數)
router.get("/discussCount", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT A.id,A.type,A.title,A.user_id as i_user_id,B.user_id,temp.created_at,temp.cot,C.account as i_user_name,D.account as user_name FROM discuss as A JOIN (SELECT MAX(created_at) as created_at,discuss_id,COUNT(*) as cot FROM discuss_content GROUP BY discuss_id) as temp  ON A.id=temp.discuss_id JOIN discuss_content as B on B.created_at=temp.created_at JOIN member as C ON C.id=A.user_id JOIN member as D ON D.id=B.user_id ORDER BY temp.cot DESC"
  );
  res.json(data);
});

// 取得分類 reply熱門推薦用
router.get("/getType/:discuss_id", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT type FROM discuss WHERE id=?",
    [req.params.discuss_id]
  );
  console.log(data);
  res.json(data[0].type);
});

// 列表：全部資料(照回覆數) reply熱門推薦用
router.get("/replyHot/:discuss_id", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT A.id,A.type,A.title,A.user_id as i_user_id,B.user_id,temp.created_at,temp.cot,C.account as i_user_name,D.account as user_name FROM discuss as A JOIN (SELECT MAX(created_at) as created_at,discuss_id,COUNT(*) as cot FROM discuss_content GROUP BY discuss_id) as temp  ON A.id=temp.discuss_id JOIN discuss_content as B on B.created_at=temp.created_at JOIN member as C ON C.id=A.user_id JOIN member as D ON D.id=B.user_id WHERE A.type=? ORDER BY temp.cot DESC",
    [req.params.discuss_id]
  );
  res.json(data);
});

// 列表：討論區首頁撈文章內容
router.get("/indexContent", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT discuss_id,content,MIN(created_at) as created_at FROM discuss_content GROUP BY discuss_id"
  );
  res.json(data);
});

// 編輯文章內容-初始內容
router.post("/editReplyContent", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT content FROM discuss_content WHERE id=?",
    [req.body]
  );
  res.json(data);
});

// 編輯文章內容-送出修改
router.post("/doEditReply", async (req, res) => {
  let data = await connection.queryAsync(
    "UPDATE discuss_content SET content=? WHERE id=? AND user_id=?",
    [req.body.content, req.body.id, req.session.member.id]
  );
  res.json(data);
});

// 編輯文章內容-刪除
router.post("/deleteReply", async (req, res) => {
  let data = await connection.queryAsync(
    "UPDATE discuss_content SET valid=0,content='=====此回覆已被使用者刪除=====' WHERE id=? AND user_id=?",
    [req.body.id, req.session.member.id]
  );
  res.json({ code: "0", message: "已刪除回復" });
});

// 列表：會員收藏資料
router.post("/memberDiscuss", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT A.id,A.type,A.title,A.user_id as i_user_id,B.user_id,temp.created_at,temp.cot FROM discuss as A JOIN (SELECT MAX(created_at) as created_at,discuss_id,COUNT(*) as cot FROM discuss_content GROUP BY discuss_id) as temp  ON A.id=temp.discuss_id JOIN discuss_content as B on B.created_at=temp.created_at JOIN discuss_keep as C on C.discuss_id=A.id WHERE C.user_id=? ORDER BY temp.created_at DESC",
    [req.body.id]
  );
  res.json(data);
});

// 列表：分類:全部-資料
router.get("/all", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT A.id,A.type,A.title,A.user_id as i_user_id,B.user_id,temp.created_at,temp.cot FROM discuss as A JOIN (SELECT MAX(created_at) as created_at,discuss_id,COUNT(*) as cot FROM discuss_content GROUP BY discuss_id) as temp  ON A.id=temp.discuss_id JOIN discuss_content as B on B.created_at=temp.created_at ORDER BY temp.created_at DESC"
  );
  res.json(data);
});

// 列表：家庭資料
router.get("/family", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT A.id,A.type,A.title,A.user_id as i_user_id,B.user_id,temp.created_at,temp.cot FROM discuss as A JOIN (SELECT MAX(created_at) as created_at,discuss_id,COUNT(*) as cot FROM discuss_content GROUP BY discuss_id) as temp  ON A.id=temp.discuss_id JOIN discuss_content as B on B.created_at=temp.created_at WHERE A.type=? ORDER BY temp.created_at DESC",
    [decodeURI("家庭")]
  );
  res.json(data);
});

// 列表：卡牌資料
router.get("/card", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT A.id,A.type,A.title,A.user_id as i_user_id,B.user_id,temp.created_at,temp.cot FROM discuss as A JOIN (SELECT MAX(created_at) as created_at,discuss_id,COUNT(*) as cot FROM discuss_content GROUP BY discuss_id) as temp  ON A.id=temp.discuss_id JOIN discuss_content as B on B.created_at=temp.created_at WHERE A.type=? ORDER BY temp.created_at DESC",
    [decodeURI("卡牌")]
  );
  res.json(data);
});

// 列表：策略資料
router.get("/trag", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT A.id,A.type,A.title,A.user_id as i_user_id,B.user_id,temp.created_at,temp.cot FROM discuss as A JOIN (SELECT MAX(created_at) as created_at,discuss_id,COUNT(*) as cot FROM discuss_content GROUP BY discuss_id) as temp  ON A.id=temp.discuss_id JOIN discuss_content as B on B.created_at=temp.created_at WHERE A.type=? ORDER BY temp.created_at DESC",
    [decodeURI("策略")]
  );
  res.json(data);
});

// 點擊單筆進入查看
router.get("/reply/:discuss_id", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT A.*,B.account as account,B.photo as photo FROM discuss_content as A JOIN member as B ON A.user_id=B.id WHERE A.discuss_id=?",
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
router.get("/discussCountNum", async (req, res) => {
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
  let data = await connection.queryAsync(
    "INSERT INTO discuss_content (discuss_id, user_id, content, floor,created_at) VALUES (?)",
    [
      [
        req.body.discuss_id,
        req.session.member.id,
        req.body.content,
        req.body.floor,
        moment().format("YYYY/MM/DD HH:mm:ss"),
      ],
    ]
  );
  res.send(req.body);
  // res.json({ code: "0", message: "已建立" });
});

// 收藏功能-寫入
router.post("/keep", async (req, res) => {
  let data = await connection.queryAsync(
    "INSERT INTO discuss_keep (discuss_id, user_id) VALUES (?)",
    [[req.body.discuss_id, req.session.member.id]]
  );
  res.json({ code: "0", message: "已加入收藏" });
});

// 收藏功能-刪除
router.post("/keepDelete", async (req, res) => {
  let data = await connection.queryAsync(
    "DELETE FROM discuss_keep WHERE discuss_id = ? AND user_id = ?",
    [req.body.discuss_id, req.session.member.id]
  );
  res.json({ code: "0", message: "已移除收藏" });
});

// 收藏功能-判斷狀態
router.post("/keepStatus", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT * FROM discuss_keep WHERE discuss_id=? AND user_id=?",
    [req.body.discuss_id, req.session.member.id]
  );
  res.json(data);

  // res.json({ code: "0", message: "已建立" });
});

// 按讚功能-撈資料
router.post("/likeData", async (req, res) => {
  let data = await connection.queryAsync("SELECT * FROM discuss_like");
  res.json(data);
});

// 按讚功能-寫入
router.post("/like", async (req, res) => {
  let data = await connection.queryAsync(
    "INSERT INTO discuss_like (discuss_content_id, user_id) VALUES (?)",
    [[req.body.discuss_content_id, req.session.member.id]]
  );
  res.json({ code: "0", message: "已發送讚" });
});

// 按讚功能-刪除
router.post("/likeDelete", async (req, res) => {
  let data = await connection.queryAsync(
    "DELETE FROM discuss_like WHERE discuss_content_id = ? AND user_id = ?",
    [req.body.discuss_content_id, req.session.member.id]
  );
  res.json({ code: "0", message: "已移除讚" });
});

// 新討論>>抓種類
router.get("/newDiscussType", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT type FROM discuss GROUP BY type"
  );
  res.json(data);
});

// 新增討論串
router.post("/addNewDiscuss", async (req, res) => {
  let data = await connection.queryAsync(
    "INSERT INTO discuss (type,title,created_at,user_id) VALUES (?)",
    [
      [
        req.body.type,
        req.body.title,
        moment().format("YYYY/MM/DD HH:mm:ss"),
        req.session.member.id,
      ],
    ]
  );
  // console.log(data);

  // let lastId = await connection.queryAsync(
  //   "SELECT LAST_INSERT_ID() AS lastId FROM discuss LIMIT 1"
  // );

  // console.log(lastId[0].lastId);
  res.status(200).send(data.insertId.toString());
  // res.json({ code: "0", message: "已建立" });
});

// 新增討論串樓主內容
router.post("/addNewDiscussContent", async (req, res) => {
  // console.log(req.body);
  let data = await connection.queryAsync(
    "INSERT INTO discuss_content (discuss_id, user_id, content, floor,created_at) VALUES (?)",
    [
      [
        req.body.lastId,
        req.session.member.id,
        req.body.content,
        req.body.floor,
        moment().format("YYYY/MM/DD HH:mm:ss"),
      ],
    ]
  );
  // res.send(req.body);
  res.json({ code: "0", message: "已建立" });
});

// 搜尋討論區-全部by最新回覆
router.post("/searchDiscuss", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT A.id,A.type,A.title,A.user_id as i_user_id,B.user_id,temp.created_at,temp.cot,C.account as i_user_name,D.account as user_name FROM discuss as A JOIN (SELECT MAX(created_at) as created_at,discuss_id,COUNT(*) as cot FROM discuss_content GROUP BY discuss_id) as temp  ON A.id=temp.discuss_id JOIN discuss_content as B on B.created_at=temp.created_at JOIN member as C ON C.id=A.user_id JOIN member as D ON D.id=B.user_id WHERE A.title LIKE ? or C.account LIKE ? ORDER BY temp.created_at DESC",
    ["%" + req.body.keyword + "%", "%" + req.body.keyword + "%"]
  );
  res.json(data);
});

// 搜尋討論區-全部by最多回覆
router.post("/searchMost", async (req, res) => {
  let data = await connection.queryAsync(
    "SELECT A.id,A.type,A.title,A.user_id as i_user_id,B.user_id,temp.created_at,temp.cot,C.account as i_user_name,D.account as user_name FROM discuss as A JOIN (SELECT MAX(created_at) as created_at,discuss_id,COUNT(*) as cot FROM discuss_content GROUP BY discuss_id) as temp  ON A.id=temp.discuss_id JOIN discuss_content as B on B.created_at=temp.created_at JOIN member as C ON C.id=A.user_id JOIN member as D ON D.id=B.user_id WHERE A.title LIKE ? or C.account LIKE ? ORDER BY temp.cot DESC",
    ["%" + req.body.keyword + "%", "%" + req.body.keyword + "%"]
  );
  res.json(data);
});

module.exports = router;
