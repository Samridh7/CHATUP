const express = require("express");
const router = express.Router();

router.get("/", (req,res) => {
    res.send("server has started");
})

module.exports = router