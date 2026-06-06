require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const JWT_SECRET  = process.env.JWT_SECRET  || 'blockfall_dev_secret_change_in_prod';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

module.exports = { JWT_SECRET, JWT_EXPIRES };
