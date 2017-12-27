'use strict';

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

var _throng = require('throng');

var _throng2 = _interopRequireDefault(_throng);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// workers
var WORKERS = process.env.WEB_CONCURRENCY || 4;
(0, _throng2.default)({
  workers: WORKERS,
  lifetime: Infinity
}, start);

function start(id) {
  console.log('Started worker ' + id);

  process.on('SIGTERM', function () {
    console.log('Worker ' + id + ' exiting...');
    process.exit();
  });

  var server = _app2.default.listen(process.env.PORT || 3001, function () {
    console.log('Listening on port ' + server.address().port);
  });
}