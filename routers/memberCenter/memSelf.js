const express = require("express");
const session = require("express-session");
const router = express.Router();
const connection = require("../../connection/db.js");
const path = require("path");

//修改密碼用(bcrypt加密、validationResult驗證)
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

//圖片用multer
const multer = require("multer");

let app = express();

// 取得會員資料
router.get("/:account", async (req, res) => {
  let user = await connection.queryAsync(
    "SELECT * FROM member WHERE account = ?;",
    [req.session.member.account]
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
      req.session.member.account,
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

// 照片上傳router
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
        [req.file.filename, req.session.member.account]
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

// 密碼驗證
const passwordRules = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("密碼不得低於8碼")
    .isLength({ max: 20 })
    .withMessage("密碼不得低於20碼"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("密碼不得低於8碼")
    .isLength({ max: 20 })
    .withMessage("密碼不得低於20碼"),
  body("reNewPassword")
    // value 是前端使用者的 input 輸入的值
    // custom 自定義的驗證函式
    .custom((value, { req }) => {
      return value === req.body.newPassword;
    })
    .withMessage("新密碼驗證錯誤"),
];

// 新密碼修改router
router.post("/rePassword/:account", passwordRules, async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(101).json({ code: 101, message: error.array() });
  }
  try {
    if (req.session.member) {
      // 先取出資料庫儲存的密碼
      let userData = await connection.queryAsync(
        "SELECT password FROM member WHERE account = ?",
        req.session.member.account
      );

      // 建立加密新密碼，強度10
      let BCRpassword = await bcrypt.hash(req.body.newPassword, 10);

      // 比較加密後的資料庫原密碼密碼與舊密碼
      let result = await bcrypt.compare(
        req.body.password,
        userData[0].password
      );
      // console.log("匹配結果", result);
      // 錯誤返回，正確就繼續
      if (result === false) {
        res.json({ code: "401", message: "舊密碼輸入錯誤" });
      } else {
        // 上傳新密碼
        let updatePassword = await connection.queryAsync(
          "UPDATE member SET password = ? WHERE account = ?",
          [BCRpassword, req.session.member.account]
        );
        res.json({ code: "408", message: "修改正確" });
      }
    }
  } catch (e) {
    res.json({ code: "404", message: e.message });
    console.log(e);
  }
});

router.get("/productOrder/:account", async (req, res) => {
  let productOrder = await connection.queryAsync(
    "SELECT * FROM product_order WHERE user_account = ?",
    [req.session.member.account]
  );

  res.json(productOrder);
});

module.exports = router;
