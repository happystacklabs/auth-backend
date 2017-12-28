import throng from 'throng';
import app from './app';


function start() {
  process.on('SIGTERM', () => {
    process.exit();
  });

  app.listen(process.env.PORT || 3001, () => {});
}


// workers
const WORKERS = process.env.WEB_CONCURRENCY || 4;
throng({
  workers: WORKERS,
  lifetime: Infinity,
}, start);
