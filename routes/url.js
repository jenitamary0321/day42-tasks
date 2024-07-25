// routes/url.js
const express = require('express');
const router = express.Router();
const { createURL, getAllURLs, getAnalytics, redirectURL } = require('../controllers/urlController');

router.post('/', createURL);
router.get('/', getAllURLs);
router.get('/analytics', getAnalytics);
router.get('/:shortURL', redirectURL);

module.exports = router;
