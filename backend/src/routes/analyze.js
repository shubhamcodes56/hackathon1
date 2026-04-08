const express = require("express");
const { analyzeOnion } = require("../onion_engine");

const router = express.Router();

router.get("/csrf-token", (req, res) => {
  const token = req.cookies[process.env.CSRF_COOKIE_NAME || "digiguard_csrf"] || null;
  res.json({ csrfToken: token });
});

router.post("/analyze", async (req, res) => {
  const result = await analyzeOnion(req.body || {});
  res.json(result);
});

router.post("/intercept", async (req, res) => {
  const payload = {
    senderId: "",
    message: req.body?.message || "",
    url: req.body?.url || "",
    fileName: req.body?.fileName || "",
    source: req.body?.source || "browser",
  };

  const result = await analyzeOnion(payload);
  const block = result.layer4Triggered || result.score >= 80;

  res.json({
    block,
    result,
  });
});

module.exports = router;
