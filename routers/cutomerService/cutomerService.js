const express = require("express");
const router = express.Router();
const connection = require("../../connection/db.js");
const moment = require("moment");


router.get("/questions", async (req, res) => {
  let questions = await connection.queryAsync(
    "SELECT * FROM question WHERE user_id = ?;",
    [req.query.user_id]
  );
  res.json(questions);

});


router.post("/questions", async (req, res) => {
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
});

module.exports = router;
