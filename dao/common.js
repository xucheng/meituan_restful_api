/**
 * @author helloworldjerry@gmail.com
 */
var config = require('../config/database') ;
var mysql = require('mysql') ;
exports.createClient = function(){
	console.log('initialing mysql...') ;
	return mysql.createClient(config) ;
}
