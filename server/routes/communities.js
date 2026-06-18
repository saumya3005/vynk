const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Communities route is working' });
});

module.exports = router;
