const express = require("express");
const session = require("express-session");
const router = express.Router();
const connection = require("../../connection/db.js");
const path = require("path");
//圖片用multer
const multer = require("multer");

let app = express();

// 取得會員資料
router.get("/:account", async (req, res) => {
  let user = await connection.queryAsync(
    "SELECT * FROM member WHERE account = ?;",
    [req.params.account]
  );
  if (req.session.member) {
    res.json(user);
  } else {
    res.json({ code: 105, message: "登入失敗" });
  }
});

// 相對應的會員資料做更新
router.post("/memSelf/:account", async (req, res) => {
  let userUpdate = await connection.queryAsync(
    "UPDATE member SET address = ?, birth = ?, gender =? , email = ?, name=?,phone=? WHERE account = ?",
    [
      req.body.address,
      req.body.birth,
      req.body.gender,
      req.body.email,
      req.body.name,
      req.body.phone,
      req.params.account,
    ]
  );

  if (req.session.member) {
    res.json({ message: "更新成功" });
  }
});

// 相對應的會員照片修改
const storage = multer.diskStorage({
  // 目的地(儲存照片的路徑)
  destination: function (req, res, callback) {
    callback(null, path.join(__dirname, "..", "..", "public", "uploads"));
  },
  // 修改檔名(防止重複名稱)
  filename: function (req, res, callback) {
    // 抓原本檔案的副檔名，originalname<---multer的函數
    // const extension = file.originalname.split(".").pop();
    // 建立檔案，檔名為現在時間+副檔名
    callback(null, `user_${Date.now()}.jpg`);
  },
});

// 做判斷(格式)與限制(圖片檔案大小)
// multer教學 https://reurl.cc/zWkKvN
const upload = multer({
  storage: storage,
  fileFilter(req, file, callback) {
    // 限制檔案格式為 image
    if (!file.mimetype.match(/^image/)) {
      callback((new Error().message = "檔案格式錯誤"));
    } else {
      callback(null, true);
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

router.post(
  "/memSelf/photo/:account",
  // single 只接受單一檔案 -> 最終資訊會存放在req.file
  upload.single("photo"),
  async (req, res) => {
    try {
      // 把req.file console.log出來就知道要找甚麼
      // let photoname = req.file ? "/memberPhoto/" + req.file.filename : "";
      // const base64 = req.file;
      // const buff = Buffer.from(base64, "base64");
      // const str = buff.toString("utf-8");
      let photoUpdate = await connection.queryAsync(
        "UPDATE member SET photo = ? WHERE account = ?",
        [req.file.filename, req.body.account]
      );

      res.json({ message: "更新成功" });
      console.log("成功");
      // console.log(req.body.account);
      // console.log(req.file);
    } catch (e) {
      console.log("無法更新");
      res.json({ code: "301", message: "照片無法更新" });
    }
  }
);

module.exports = router;
