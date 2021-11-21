const express = require("express");
const router = express.Router();
const connection = require("../../connection/db.js");
const moment = require("moment");


router.get("/:account", async (req, res) => {
  let user = await connection.queryAsync(
    "SELECT * FROM member WHERE account = ?;",
    [req.params.account]
  );
  if (req.session.member) {
    res.json(user);
  } else {
    res.json({ code: 700, message: "失敗" });
  }
});


router.post("/question", async (req, res) => {
  console.log("req.body", req.body);
  let data = await connection.queryAsync(
    "INSERT INTO question (user_id, category, subcategory, content, created_at) VALUES (?)",
    [
      [
        req.body.user_id,
        req.body.category,
        req.body.subcategory,
        req.body.content,
        moment().format("YYYY/MM/DD HH:mm:ss"),
      ],
    ]
  );
  res.send(req.body);
  // res.json({ code: "0", message: "已建立" });
});

router.put("/memSelf/:account", async (req, res) => {
  //   let userInsert = await connection.queryAsync(
  //     "INSERT INTO member (address, birth, gender, name, phone, photo) VALUE (?,?,?,?,?,?) WHERE account = ?;",
  //     [req.params.account]
  //   );
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
    console.log(userUpdate);
    res.json({ message: "更新成功" });
  }
});

module.exports = router;
