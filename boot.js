/**
 * @author helloworldjerry@gmail.com
 */
var fs = require('fs'), express = require('express');

exports.boot = function(app){
	bootApplication(app);
  	bootControllers(app);
};

function bootApplication(app) {
  	app.use(express.logger(':method :url :status'));
  	app.use(express.bodyParser());
  	app.use(express.methodOverride());
  	app.use(app.router);
	app.error(function(err,req,res){
		res.send('500') ;	
	}) ;
	app.use(function(req, res){
		res.send('404') ;	
	}) ;
}

var walk = function(dir, done) {
  	var results = [];
  	fs.readdir(dir, function(err, list) {
    	if (err) return done(err);
    	var pending = list.length;
    	list.forEach(function(file) {
      		file = dir + '/' + file;
      		fs.stat(file, function(err, stat) {
        		if (stat && stat.isDirectory()) {
          			walk(file, function(err, res) {
            			results = results.concat(res);
            			if (!--pending) done(null, results);
          			});
        		} else {
          			results.push(file);
          			if (!--pending) done(null, results);
        		}
      		});
    	});
  	});
};

function bootControllers(app) {
	walk(__dirname + '/controller', function(err, files){
		if (err) throw err ;
		files.forEach(function(file){
			bootController(app, file) ;
		}) ;
	}) ;
}

function bootController(app, file) {
  	var name = file.replace('.js', ''), actions = require(name), plural = name, prefix = plural.substring(plural.indexOf('/controller')+11) ;
  	Object.keys(actions).map(function(action){
    	var fn = actions[action] ;
    	switch(action) {
      		case 'index' :
        		app.get(prefix+'.:type?', fn);
        		break;
			case 'city' :
				app.get(prefix+'.:type?/city/:city', fn) ;
				break ;
			case 'area' :
				app.get(prefix+'.:type?/city/:city/area/:area', fn) ;
				break ;
			case 'meituan' :
				prefix = prefix.replace(new RegExp('/',"gm"), '\\/') ;
				var route = '^'+prefix+'(?:\\.(\\w+))?(?:\\/city(?:(?:\\/([\\w]+))?(?:\\/area(?:\\/([\\w]+))?)?)?)?(?:\\/price(?:\\/(\\w+)?)?)?(?:\\/category(?:\\/(\\w+)?)?)?(?:\\/order(?:\\/([\\w-]+)?)?)?(?:\\/k(?:\\/([^\\/]+)?)?)?(?:\\/pagesize(?:\\/(\\d+)?)?)?(?:\\/page(?:\\/(\\d+)?)?)?' ;
				reg = new RegExp(route) ;
				app.get(reg, fn) ;
				break ;
			case 'hao123v2' :
				prefix = prefix.replace(new RegExp('/',"gm"), '\\/') ;
				var route = '^'+prefix+'(?:\\.(\\w+))?(?:\\/key(?:\\/([0-9a-zA-Z]{32})?)?)?(?:\\/city(?:(?:\\/([^\\/]+)?)?(?:\\/range(?:\\/([^\\/]+)?)?)?)?)?(?:\\/price(?:\\/([\\d-]+)?)?)?(?:\\/rebate(?:\\/(\\d+)?)?)?(?:\\/category(?:(?:\\/(\\d+))?(?:\\/subcategory(?:\\/([^\\/]+)?)?)?)?)?(?:\\/start(?:\\/(\\d{4}-\\d{2}-\\d{2})?)?)?(?:\\/end(?:\\/(\\d{4}-\\d{2}-\\d{2})?)?)?(?:\\/order(?:\\/([\\w-]+)?)?)?(?:\\/k(?:\\/([^\\/]+)?)?)?(?:\\/pagesize(?:\\/(\\d+)?)?)?(?:\\/page(?:\\/(\\d+)?)?)?' ;
				reg = new RegExp(route) ;
				app.get(reg, fn) ;
				break ;
			case 'tuan800' :
				prefix = prefix.replace(new RegExp('/',"gm"), '\\/') ;
				var route = '^'+prefix+'(?:\\.(\\w+))?(?:\\/key(?:\\/([0-9a-zA-Z]{32})?)?)?(?:\\/city(?:\\/([^\\/]+)?)?)?(?:\\/shoparea(?:\\/([^\\/]+)?)?)?(?:\\/price(?:\\/([\\d-]+)?)?)?(?:\\/tag(?:\\/([^\\/]+)?)?)?(?:\\/start(?:\\/(\\d{4}-\\d{2}-\\d{2})?)?)?(?:\\/end(?:\\/(\\d{4}-\\d{2}-\\d{2})?)?)?(?:\\/post(?:\\/([01])?)?)?(?:\\/soldout(?:\\/([01])?)?)?(?:\\/order(?:\\/([\\w-]+)?)?)?(?:\\/k(?:\\/([^\\/]+)?)?)?(?:\\/pagesize(?:\\/(\\d+)?)?)?(?:\\/page(?:\\/(\\d+)?)?)?' ;
				reg = new RegExp(route) ;
				app.get(reg, fn) ;
				break ;
   	 	}
  	});
}
