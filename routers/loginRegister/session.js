const express = require("express");
const router = express.Router();

let app = express();

router.get("/member", (req, res) => {
  if (req.session.member) {
    return res.json(req.session.member);
  } else {
    return res.json({ code: 105, message: "登入失敗" });
  }
});

module.exports = router;
