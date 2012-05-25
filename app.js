/**
 * @author helloworldjerry@gmail.com
 */
var express = require('express');
var cluster = require('cluster') ;

var app = express.createServer();

require('./boot').boot(app);

//app.listen(3000);
cluster(app).set('workers',16).use(cluster.reload()).use(cluster.repl(8888)).listen(3000) ;
console.log('Express app started on port 3000');
