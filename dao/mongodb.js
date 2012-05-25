/**
 * @author helloworldjerry@gmail.com
 */
var config = require('../config/mongodb') ;
var model = exports.createClient = function(db){
	var dsn = config['dsn']+db ;
	var mongoose = require('mongoose') ;
	console.log(dsn) ;
//	mongoose.connect(dsn) ;
	var database = mongoose.createConnection(dsn) ;
	var Schema = mongoose.Schema ;
	if(db=='hao123v2'){
		var Url = new Schema({
			loc:{type:String,unique:true},
			data:{}
		}) ;
		return {_model:database.model('url',Url),_mongoose:db} ;
	}
	if(db=='tuan800'){
		var Url2 = new Schema({
			loc:{type:String,unique:true},
			wapLoc:{type:String,index:true},
			data:{}
		}) ;
		return {_model:database.model('url',Url2),_mongoose:db} ;
	}
} ;
