import throng from 'throng';
import { app } from './app';


function start() {
  process.on('SIGTERM', () => {
    process.exit();
  });

  app.listen(process.env.PORT, () => {});
}


// workers
const WORKERS = process.env.WEB_CONCURRENCY;
throng({
  workers: WORKERS,
  lifetime: Infinity,
}, start);
