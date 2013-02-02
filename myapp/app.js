
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , util = require('util')
  , io
  , server
  , app = express()
  , fs = require('fs')
  , EventEmitter = require('events').EventEmitter
  , fileSystemProxy = new EventEmitter();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

fs.watch('public/javascripts/templates', { persistent: true }, function(event, filename) {
    if ((event === 'change') && (filename.indexOf('___jb_bak___') === -1)) {
        fileSystemProxy.emit('change', '/javascripts/templates/' + filename);
    }
})

io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {

    function getFile(url, callback) {
        fs.readFile('public' + url, 'utf-8', function(err, data) {
            if (err) throw err;
            fs.stat('public' + url, function(err, stats) {
                if (err) throw err;
                callback(url, data, stats.ctime.getTime());
            });

        });
    }

    function checkFile(url, date, onUpdate, onNotUpdate) {
        fs.stat('public' + url, function(err, stats) {
            if (err) throw err;
            if (stats.ctime.getTime() > date) {
                onUpdate(url, stats.ctime.getTime());
            } else {
                console.log('on notupdate');
                onNotUpdate(url, date);
            }
        });
    }

    function fileSystemHandler(url) {
        getFile(url, function(url, data, date) {
            socket.emit('template-' + url + '-update', {
                update : true,
                content : data,
                date : date
            })
        })
    }

    socket.on('disconnect', function(e) {
        fileSystemProxy.removeListener('change', fileSystemHandler);
    });

    fileSystemProxy.on('change', fileSystemHandler);

	socket.on('template-check', function(url, date) {
		if (!date) {
            getFile(url, function(url, data, date) {
                socket.emit('template-' + url + '-update', {
                    update : true,
                    content : data,
                    date : date
                })
            })
        } else {
            checkFile(url, date, function(url, date) {
                fs.readFile('public' + url, 'utf-8', function(err, data) {
                    if (err) throw err;
                    socket.emit('template-' + url + '-update', {
                        update : true,
                        content : data,
                        date : date
                    });
                })
            }, function(url, date) {
                socket.emit('template-' + url + '-update', {
                    update : false
                });
            });
        }
	});
});
