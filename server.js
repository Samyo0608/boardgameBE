const express = require("express");
require("dotenv").config();
let app = express();
const cors = require("cors");
const path = require("path");
const router = express.Router();

// middleware(app.use/get/...)放在router(require(./XXX/XXX))前面

//---------------cors跨源---------------------
// cors 後端予許跨源
app.use(
  cors({
    //網域指定限制
    origin: "http://localhost:3000",
    //儲存cookie
    credentials: true,
  })
);

// 使用這個中間件，你才可以讀到 body 的資料
app.use(express.urlencoded({ extended: true }));
// 使用這個中間件，才可以解析得到 json 的資料
app.use(express.json());

// app.use(express.json({ limit: "28mb" }));

//--------------express-session---------------
const expressSession = require("express-session");
let FileStore = require("session-file-store")(expressSession);
//--------------session-file-store------------
//--------建立資料夾後session會存在裡面---------
app.use(
  expressSession({
    //儲存路徑
    store: new FileStore({ path: path.join(__dirname, ".", "sessions") }),
    secret: "boardgameSession",
    name: "userSession",
    saveUninitialized: false,
    resave: false,
  })
);

// 使用public這個資料夾的東西，賦予它http的網域型態
http: app.use("/public", express.static("public"));

//router(路由)都寫在這下面，內部程式請在router資料夾下完成

// let XXX = require("程式路徑")
// app.use("你想設的路徑(查json用)", XXX)

let authRouter = require("./routers/loginRegister/auth.js");
app.use("/api/auth", authRouter);

let sessionRouter = require("./routers/loginRegister/session.js");
app.use("/api/session", sessionRouter);

let memberRouter = require("./routers/memberCenter/memSelf.js");
app.use("/api/member", memberRouter);

// 引用 /api/discuss 的相關路由
let discussRouter = require("./routers/discuss");
app.use("/api/discuss", discussRouter);

// 活動頁面路由
let conRouter = require("./routers/contest/contestPage.js");
app.use("/api/contest", conRouter);

// 報名頁面路由
let keyRouter = require("./routers/contest/signUp.js");
app.use("/api/contest", keyRouter);

// 投票頁面顯示投票內容路由
let voteRouter = require("./routers/contest/vote.js");
app.use("/api/vote", voteRouter);

// 租賃頁面路由
let bookingRouter = require("./routers/booking/bookingBE.js");
app.use("/api/booking", bookingRouter);
// 遊戲頁面路由
let productRouter = require("./routers/product/product.js");
app.use("/api/productlist", productRouter);

app.use((req, res, next) => {
  console.log(`${req.url} 找不到路由`);
  next();
});

app.use((err, req, res, next) => {
  // 當前面的程式碼發生錯誤時，會統一丟到這裡來處理
  // 有點像是 catch 的感覺
  console.error("錯誤處理中間件:", err);
  // 這裡需要處理什麼事？
  res.status(500).json({ code: "500" });
});

// --------------聆聽(port:3001)----------------
app.listen(3001, () => {
  console.log("測試成功");
});
