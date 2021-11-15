const mysql = require("mysql");
const Promise = require("bluebird");

let connection = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,

  // connectionLimit : 連線限制數量
  connectionLimit: 10,
});

// 下面兩行說明:
// 利用bluebird(已經定義成Promise)將connection(sql)內的指令轉換成我們可以直接在nodeJS使用的指令
connection = Promise.promisifyAll(connection);
module.exports = connection;
