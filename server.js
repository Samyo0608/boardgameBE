const express = require("express");
const connection = require("./connection/db.js");
require("dotenv").config();

let app = express();

const cors = require("cors");

app.use(
  cors({
    //網域指定限制
    origin: ["http://localhost:3000"],
    //儲存cookie
    credentials: true,
  })
);

console.log("測試成功");
