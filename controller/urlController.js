// controllers/urlController.js
const URL = require('../models/URL');
const shortid = require('shortid');

exports.createURL = async (req, res) => {
  const { longURL } = req.body;
  const shortURL = shortid.generate();
  try {
    const newURL = new URL({ longURL, shortURL });
    await newURL.save();
    res.json(newURL);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllURLs = async (req, res) => {
  try {
    const urls = await URL.find();
    res.json(urls);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const urls = await URL.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dates = urls.map(url => url._id);
    const counts = urls.map(url => url.count);
    res.json({ dates, counts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.redirectURL = async (req, res) => {
  const { shortURL } = req.params;
  try {
    const url = await URL.findOne({ shortURL });
    if (!url) return res.status(404).json({ error: 'URL not found.' });
    url.clicks++;
    await url.save();
    res.redirect(url.longURL);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
