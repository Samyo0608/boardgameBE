const express = require("express");
const path = require("path");
const router = express.Router();
// 密碼加密套件
const bcrypt = require("bcrypt");
// 資料庫連線要求定義
const connection = require("../../connection/db.js");

//-----------------身分驗證-----------------------

// 密碼驗證(使用 express-validator)
// validationResult(req) 獲取結果
const { body, validationResult } = require("express-validator");

// 用registerRules來儲存錯誤(如果這邊是空的代表驗證通過)
const registerRules = [
  //對front-end name
  body("email").isEmail().withMessage("Email填寫不正確"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("密碼不得低於8碼")
    .isLength({ max: 20 })
    .withMessage("密碼不得超過20碼"),
  body("rePassword")
    .custom((value, { req }) => {
      // 輸入值和錯誤資訊內的密碼不一致
      return value === req.body.password;
    })
    .withMessage("密碼不一致"),
];

//----------------註冊router---------------

// 敏感資料method用post
router.post("/register", registerRules, async (req, res) => {
  // 確認資料用
  //   console.log("req.body", req.body);

  //定義 error = 錯誤資訊要求
  const error = validationResult(req);
  if (!error.isEmpty()) {
    // 回傳錯誤資訊 -> registerRules內的值
    // 定義Fetch status 和自定義 code
    return res.status(101).json({ code: 101, message: error.array() });
  }
  try {
    // 開始註冊
    // 驗證是否重複註冊
    let member = await connection.queryAsync(
      "SELECT * FROM member WHERE email = ?",
      req.body.email
    );

    if (member.length > 0) {
      return res.json({
        code: "102",
        message: "此email已使用過",
      });
    }

    // 確認後進入註冊環節
    // 用bcrypt進行加密
    //hash(欲加密的物件, 加密等級(1~10))
    let newPassword = await bcrypt.hash(req.body.password, 10);

    // 上傳至資料庫
    let memberData = await connection.queryAsync(
      "INSERT INTO member (email, password, point) VALUES (?,?,?)",
      [req.body.email, newPassword, 50]
    );
    // connection.query(
    //   "INSERT INTO (email, password) VALUES (? ,?)",
    //   [req.body.email, newPassword],
    //   function (err, rows) {
    //     if (err) throw err;
    //     console.log("Response: ", rows);
    //   }
    // );
    // return memberData;
    // connection.query(
    //   "INSERT INTO member (email, password) VALUES (?,?)",
    //   (req.body.email, newPassword)
    // );
    res.json({ code: "001", message: "註冊成功" });
  } catch (e) {
    res.json({ code: "103", message: "註冊失敗" });
  }
});

//---------------登入router---------------------

router.post("/login", async (req, res) => {
  // 確認資料用
  console.log(req.body);
  let member = await connection.queryAsync(
    "SELECT * FROM member WHERE email = ?",
    req.body.email
  );
  // if 錯誤的話
  // 1. member無資料 = 沒註冊過
  // 2. email不對 = email錯誤
  // 3. password不對 = 密碼錯誤
  // 4. 2和3寫在一起，資安問題
  if (member.length === 0) {
    res.json({ code: "104", message: "帳號或密碼錯誤" });
  }

  member = member[0];

  //compare(輸入的密碼, 資料庫儲存的密碼)
  let memberData = await bcrypt.compare(req.body.password, member.password);

  if (memberData === false) {
    res.json({ code: "104", message: "帳號或密碼錯誤" });
  } else {
    // if 成功的話
    // 1. 建立session資料(id、account、email、point)
    // 2. 跳轉頁面
    let memberSession = {
      id: member.id,
      email: member.email,
      account: member.account,
      point: member.point,
    };
    req.session.member = memberSession;

    //回應出來的值
    res.json({
      message: "登入成功",
      member: memberSession,
    });
  }
});

//---------------登出router---------------------

//只要登出，所以從網址get就可以
router.get("/logout", (req, res) => {
  req.session.member = null;

  res.json({ message: "登出成功" });
});

module.exports = router;
