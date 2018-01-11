'use strict';

var _throng = require('throng');

var _throng2 = _interopRequireDefault(_throng);

var _app = require('./app');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function start() {
  process.on('SIGTERM', function () {
    process.exit();
  });

  _app.app.listen(process.env.PORT, function () {});
}

// workers
var WORKERS = process.env.WEB_CONCURRENCY;
(0, _throng2.default)({
  workers: WORKERS,
  lifetime: Infinity
}, start);