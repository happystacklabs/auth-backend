import app from './app';


const server = app.listen( process.env.PORT || 3001, function(){
  console.log('Listening on port ' + server.address().port);
});
