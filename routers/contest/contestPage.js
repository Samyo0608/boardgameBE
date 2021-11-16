const express = require("express");
const path = require("path");
const router = express.Router();
// 密碼加密套件
const bcrypt = require("bcrypt");
// 資料庫連線要求定義
const connection = require("../../connection/db.js");


// 撈出卡片資料
router.get("/card", async (req, res) => {
    let data = await connection.queryAsync("SELECT * FROM contest");
    res.json(data);
  });

router.get("/:id", async (req,res) =>{
    let data = await connection.queryAsync("SELECT * FROM contest WHERE id = ?;",[
        req.params.id
    ])
})


module.exports = router;
