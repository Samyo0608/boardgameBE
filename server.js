const express = require("express");
let app = express();
const path = require("path");
require("dotenv").config();
const cors = require("cors"); //後端告訴瀏覽器允許跨源存取

//後端告訴瀏覽器允許跨源存取
app.use(
  cors({
    // 限定跨源讀寫的來源
    origin: ["http://localhost:3000"],
    // 允許跨源存取 cookie
    credentials: true,
  })
);

const expressSession = require("express-session");
app.use(
  expressSession({
    secret: "mySECRET",
    name: "user", //optional
    resave: false, //未修改session前先不存放於session store
    saveUninitialized: false, // 強制保存session 於session store
  })
);

// 使用這兩個中間件，你才可以讀到 body 的資料
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 引用 /api/discuss 的相關路由
let discussRouter = require("./routers/discuss");
app.use("/api/discuss", discussRouter);

// 3001 port
// 讓你的 application 啟動起來
app.listen(3001, (err) => {
  if (err) console.log(err);
  console.log("express app 啟動了喔");
});
