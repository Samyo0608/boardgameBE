const express = require("express");
const path = require("path");
const router = express.Router();
// 密碼加密套件
const bcrypt = require("bcrypt");
// 資料庫連線要求定義
const connection = require("../../connection/db.js");
// email信件寄出
const nodemailer = require("nodemailer");

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
      // value 是前端使用者的 input 輸入的值
      // custom 自定義的驗證函式
      return value === req.body.password;
    })
    .withMessage("密碼不一致"),
  body("account")
    .isLength({ min: 6 })
    .withMessage("帳號不得低於6碼")
    .isLength({ max: 20 })
    .withMessage("帳號不得超過20碼"),
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

    let memberAccount = await connection.queryAsync(
      "SELECT * FROM member WHERE account = ?",
      req.body.account
    );

    if (memberAccount.length > 0) {
      return res.json({
        code: "106",
        message: "此帳號已使用過",
      });
    }

    // 確認後進入註冊環節
    // 用bcrypt進行加密
    //hash(欲加密的物件, 加密等級(1~10))
    let newPassword = await bcrypt.hash(req.body.password, 10);

    // 上傳至資料庫
    let memberData = await connection.queryAsync(
      "INSERT INTO member (email, password, point,account) VALUES (?,?,?,?)",
      [req.body.email, newPassword, 0, req.body.account]
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
  req.session.destroy(function (err) {
    res.redirect("/");
  });
  // 讓cookie立刻過期(為了登出後可以讓忘記密碼正常使用)
  res.cookie("userSession", "", { expires: new Date() });
  res.json({ message: "登出成功" });
});

router.get("/session", (req, res) => {
  if (req.session) {
    return res.json(req.session);
  }
});

//---------------忘記密碼-------------------------
let numInit = {}; // 全域驗證碼(用來驗證比對)
let UserEmail = {}; //全域信箱(寫入新密碼用)

router.post("/forget", async (req, res) => {
  let forget = await connection.queryAsync(
    "SELECT account,email FROM member WHERE email = ?",
    [req.body.reEmail]
  );
  res.json(forget);

  if (forget.length > 0) {
    // 定義email連線伺服器、email帳號密碼
    const config = {
      service: "gmail",
      auth: {
        user: `${process.env.EMAIL_ADDRESS}`,
        pass: `${process.env.EMAIL_PASSWORD}`,
      },
    };

    const transporter = nodemailer.createTransport(config);

    // 隨機6碼 *Math.random()只會產生0~1之間的小數，所以要*10
    const createSixNum = () => {
      let num = "";
      for (let i = 0; i < 6; i++) {
        num += Math.floor(Math.random() * 10);
      }
      return num;
    };

    let number = await createSixNum();

    const mailOptions = {
      from: `${process.env.EMAIL_ADDRESS}`,
      to: `${forget[0].email}`,
      subject: "遊戲職人 - 驗證碼確認",
      text: `驗證碼為` + number,
    };
    transporter.sendMail(mailOptions, function (err, res) {
      if (err) {
        console.error("error", err);
      } else {
        numInit["number"] = number;
        UserEmail["email"] = mailOptions.to;
        console.log("成功傳送mail", number);
        res
          .status(200)
          .json({ code: "800", message: "已成功傳送mail", nember: number });
      }
    });
  }
});

router.post("/num", async (req, res) => {
  // console.log(numInit["number"]);
  // console.log(UserEmail["email"]);
  if (numInit["number"] === req.body.num) {
    res.json({ status: "pass", message: "驗證通過" });
    // console.log("OK");
  } else {
    res.json({ status: "fail", message: "驗證失敗" });
    // console.log("fail");
  }
});

// 密碼驗證
const rePass = [
  //對front-end name
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("密碼不得低於8碼")
    .isLength({ max: 20 })
    .withMessage("密碼不得超過20碼"),
  body("reNewPassword")
    .custom((value, { req }) => {
      // value 是前端使用者的 input 輸入的值
      // custom 自定義的驗證函式
      return value === req.body.newPassword;
    })
    .withMessage("密碼不一致"),
];

// 新密碼修改
router.post("/newPassword", rePass, async (req, res) => {
  let error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(101).json({ code: 101, message: error.array() });
  }
  let user = UserEmail["email"];
  try {
    // 建立加密新密碼，強度10
    let RePassword = await bcrypt.hash(req.body.newPassword, 10);

    let newPass = await connection.queryAsync(
      "UPDATE member SET password = ? WHERE email = ?",
      [RePassword, user]
    );
    // console.log(RePassword, user);
    res.json({ code: "408", message: "密碼更新完成" });
  } catch (e) {
    res.json({ code: "404", message: e.message });
    console.log(e);
  }
});

module.exports = router;
