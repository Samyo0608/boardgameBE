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

router.get("/questions/:question_id", async (req, res) => {
  let questions = await connection.queryAsync(
    "SELECT * FROM question WHERE question_id = ?;",
    [req.params.question_id]
  );
  let question = {};
  if (questions.length > 0) {
    question = questions[0];
    question.messages =  await connection.queryAsync(
      "SELECT * FROM message WHERE question_id = ?;",
      [req.params.question_id]
    );
  }

  res.json(question);
});

router.post("/questions/:question_id/messages", async (req, res) => {
  let data = await connection.queryAsync(
    "INSERT INTO message (question_id, user_id, content, created_at, is_from_user) VALUES (?)",
    [
      [
        req.body.question_id,
        req.body.user_id,
        req.body.content,
        moment().format("YYYY/MM/DD HH:mm:ss"),
        req.body.is_from_user,
      ],
    ]
  );
  res.send(req.body);

});

module.exports = router;
