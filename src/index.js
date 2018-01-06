import throng from 'throng';
import app from './app';


// to start the app
function start() {
  // shutdown the process on SIGTERM
  process.on('SIGTERM', () => {
    process.exit();
  });

  // start the app
  app.listen(process.env.PORT || 3001, () => {});
}


// set throng workers and call start
const WORKERS = process.env.WEB_CONCURRENCY || 4;
throng({
  workers: WORKERS,
  lifetime: Infinity,
}, start);
