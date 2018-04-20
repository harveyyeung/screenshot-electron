const logger = require('electron-log');

logger.transports.console.level = 'info';
logger.transports.file.level = 'info';
logger.transports.file.maxSize = 2 * 1024 * 1024; // 2M

module.exports = logger;
