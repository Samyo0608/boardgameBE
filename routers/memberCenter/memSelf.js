const express = require("express");
const session = require("express-session");
const router = express.Router();
const connection = require("../../connection/db.js");

let app = express();

router.get("/:account", async (req, res) => {
  let user = await connection.queryAsync(
    "SELECT * FROM member WHERE account = ?;",
    [req.params.account]
  );
  if (req.session.member) {
    res.json(user);
  } else {
    res.json({ code: 105, message: "登入失敗" });
  }
});

router.post("/memSelf/:account", async (req, res) => {
  //   let userInsert = await connection.queryAsync(
  //     "INSERT INTO member (address, birth, gender, name, phone, photo) VALUE (?,?,?,?,?,?) WHERE account = ?;",
  //     [req.params.account]
  //   );
  let userUpdate = await connection.queryAsync(
    "UPDATE member SET address = ?, birth = ?, gender =? , email = ?, name=?,phone=? WHERE account = ?",
    [req.params.account]
  );

  if (req.session.member) {
    res.json({ message: "更新成功" });
  }
});

module.exports = router;
