//Extensions
var http        = require('http'),
    https       = require('https'), 
    express     = require('express'),
    ejs         = require('ejs'),
    cluster     = require('cluster'),
    path        = require('path'),
    fs          = require('fs'),
    app         = express();


//Defining the enviroment
var env = process.argv[2];


//HTTP/HTTPS Config depending on enviroment
if(env == '-dev') {
  var PORT = 3000,
      HOST = 'localhost'
} else {
  var PORT = 80,
      HOST = 'HOSTNAME_HERE',
      sPORT = 443;

  var https_options = {
    key: fs.readFileSync('/etc/letsencrypt/live/' + HOST + '/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/' + HOST + '/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/' + HOST + '/chain.pem')
  };
}


//Configuration
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


/* --- Setting up internal Routes --- */

//Index route
var index           = require('./routes/index');

//LetsEncrypt ACME Challenge, needs to be changed depending on letsencrypt config
app.get('/.well-known/acme-challenge/KEY_HERE', function(req, res) {
  res.send('KEY_HERE');
});


/* --- HTTP Routes --- */

//Render the Frontpage
app.get('/', index.render());

//404 Route, ALWAYS KEEP AT THE BOTTOM
app.get('*', function(req, res){
  res.status(404).send('This is not the page you are looking for. You can get back <a href="/">here</a>');
});


//Send server log with time stamp
app.use(function (req, res, next) {
  console.log('Time: %d ' + ' Request-Pfad: ' + req.path, Date.now());
  next();
});


//Uncaught error handling
var workers = process.env.WORKERS || require('os').cpus().length;

if (cluster.isMaster) {
  console.log('start cluster with %s workers', workers);
  for (var i = 0; i < workers; ++i) {
    var worker = cluster.fork().process;
    console.log('worker %s started.', worker.pid);
  }
  cluster.on('exit', function(worker) {
    console.log('worker %s died. restart...', worker.process.pid);
    cluster.fork();
  });
} else {
  if(env == '-dev') {
    var httpsserver = http.createServer(app).listen(PORT, HOST);
  } else {
    var httpsserver = https.createServer(https_options, app).listen(sPORT, HOST);
    var httpserver = http.createServer(function(req, res) {
      res.writeHead(302, {
        'Location': 'https://' + HOST + req.url
      });
      res.end();
    }).listen(PORT, HOST);
  }
}

process.on('uncaughtException', function (err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
});

//Starting the server
console.log("app running at " + HOST + " on port " + PORT);
