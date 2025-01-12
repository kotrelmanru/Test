const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

// Setup logging ke file log
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

const logger = morgan('combined', { stream: logStream });
