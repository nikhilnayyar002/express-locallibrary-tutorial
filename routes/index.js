var express = require('express');
var router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});
router.get("/logout", (req, res) => {res.redirect("/catalog/logout");});
module.exports = router;
