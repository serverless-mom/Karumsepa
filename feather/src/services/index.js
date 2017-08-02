const hpe = require('./hpe/hpe.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(hpe);
};
