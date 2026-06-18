const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Projects route is working' });
});

module.exports = router;
