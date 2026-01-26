const morgan = require('morgan');
const { nodeEnv } = require('../config/env');

/**
 * Request logging middleware
 */
const requestLogger = morgan(nodeEnv === 'production' ? 'combined' : 'dev');

module.exports = requestLogger;


