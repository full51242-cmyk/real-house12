const { requireAuth } = require('./requireAuth');

module.exports = { protect: requireAuth, requireAuth };
