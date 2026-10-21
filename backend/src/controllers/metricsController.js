const cacheMetrics = require('../services/cacheMetrics');

const getCacheMetrics = (req, res) => {
  res.status(200).json(cacheMetrics.getMetrics());
};

module.exports = { getCacheMetrics };
