const express = require("express");
const router = express.Router();
// 資料庫連線要求定義
const connection = require("../../connection/db.js");

// 前端送來的檢查資料
const {body, validationResult} = require("express-validator");
const registerRules = [
 body("contest_email").isEmail().withMessage("請正確填寫Email"),
 body("contest_phone").isLength({min:10}).withMessage("手機號碼長度不正確"),
];


// 填寫報名資料

router.post("/keyin",registerRules ,async (req, res) => {
    console.log("req.body", req.body);
    // 驗證傳來的資料是否有誤
    const validateResult = validationResult(req);
    if(!validateResult.isEmpty()){
        // 錯誤
        let error =validateResult.array();
        return res.status(400).json({code:408,result:error})
    }
    res.json({result:"OKOK"});
    // 從前端拿到的資料
    // req.body {
    //     contest_title: '333',
    //     contest_name: '789',
    //     contest_phone: '777',
    //     contest_email: '888'
    //   }

    //將前端拿到的資料寫入資料庫

    let keyinData = await connection.queryAsync(
        "INSERT INTO signup(contest_title, contest_name, contest_phone,contest_email) VALUES (?,?,?,?)",
        [
            req.body.contest_title,
            req.body.contest_name,
            req.body.contest_phone,
            req.body.contest_email,
        ],
    );

    });
  
module.exports = router;
