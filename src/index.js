import app from './app';
import throng from 'throng';


// workers
const WORKERS = process.env.WEB_CONCURRENCY || 4;
throng({
  workers: WORKERS,
  lifetime: Infinity
}, start);



function start(id) {
  console.log(`Started worker ${ id }`);

  process.on('SIGTERM', () => {
    console.log(`Worker ${ id } exiting...`);
    process.exit();
  });

  const server = app.listen( process.env.PORT || 3001, function(){
    console.log('Listening on port ' + server.address().port);
  });
}
