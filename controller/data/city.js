/**
 * @author helloworldjerry@gmail.com
 */
var dao = require('../../dao/common') ;
var mysql = dao.createClient() ;
module.exports = {
  	index: function(req, res){
		var str_query = 'select id, name , ename,letter,iscity from city where iscity = "1" and letter !="" order by letter asc ' ;
		mysql.query(str_query , function(err, result){
			if(err) throw err ;
			build(req.params.type , result, function(error, docc, type){
				if(error) throw error ;
				if(type==='xml') res.send(docc, {'Content-Type':'text/xml; charset=UTF-8'}, 200) ;
				else res.send(docc, {'Content-Type':'text/plain; charset=UTF-8'}, 200) ;
			}) ;
		}) ;
  	},
	city: function(req, res){
		var param = req.params.city ;
		var condition = '' ;
		if((param|0) > 0) condition = ' b.id = '+param ;
		if((param|0) == 0) condition = ' b.ename = "'+param+'"' ;
		var str_query = 'select a.id, a.name, a.ename, a.iscity from city a inner join city b on a.parentid=b.id and '+condition ;
		mysql.query(str_query, function(err, ress){
			if(err) throw err ;
			var new_res = {result:{error:"",data:ress}} ;
			_build(req.params.type, new_res, function(error, docc, type){
				if(error) throw error ;
				if(type==='xml') res.send(docc, {'Content-Type':'text/xml; charset=UTF-8'}, 200) ;
				else res.send(docc, {'Content-Type':'text/plain; charset=UTF-8'}, 200) ;
			}) ;
		}) ;
	},
	area: function(req, res){
		var city = req.params.city ;
		var area = req.params.area ;
		var condition = condition_area = '' ;
		if((city|0) > 0) condition = ' c.id = '+city ;
		if((city|0) == 0) condition = ' c.ename = "'+city+'"' ;

		if((area|0) > 0) condition_area = ' b.id = '+area ;
		if((area|0) == 0) condition_area = ' b.ename = "'+area+'"' ;
		var str_query = 'select c.id, c.name, c.ename, c.iscity from city c where '+condition+' union ( select a.id, a.name, a.ename, a.iscity from city a inner join city b inner join city c on a.parentid = b.id and b.parentid = c.id where '+condition_area+' and '+condition+' )' ;
		mysql.query(str_query, function(err, ress){
			if(err) throw err ;
			var new_res = {result:{error:"",data:ress}} ;
			_build(req.params.type, new_res, function(error, docc, type){
				if(error) throw error ;
				if(type==='xml') res.send(docc,{'Content-Type':'text/xml; charset=UTF-8'},200) ;
				else res.send(docc,{'Content-Type':'text/plain; charset=UTF-8'},200) ;
			}) ;
		}) ;
	}
} ;

var build = function(type, result, cb){
	if(!type) type = 'xml' ; 
	switch(type){
		case 'json' :
			 var doc = result ;
			 break  ;
		case 'xml' :
		default :
			 var doc = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" ;
			 doc = doc+'<result><error>0</error><data><city></city><area>' ;
			 var xml = mkxml(result) ;
			 doc = doc + xml + '</area></data></result>' ;
			 break ;
	}
	cb(null, doc, type) ;
} ;

var _build = function(type, result, cb){
	if(!type) type = 'xml' ; 
	switch(type){
		case 'json' :
			 var doc = result ;
			 break  ;
		case 'xml' :
		default :
			 var doc = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" ;
			 var xml = _mkxml(result) ;
			 doc += xml ;
			 break ;
	}
	cb(null, doc, type) ;
} ;

var _mkxml = function(result){
	var inner = '' ;
	if(typeof(result)!='object'){
		return inner = result ;
	}else{
		if(JSON.stringify(result).indexOf('{')===0){
			Object.keys(result).map(function(key){
				inner += '<'+key+'>' ;
				inner += _mkxml(result[key]) ;
				inner += '</'+key+'>' ;
			}) ;
			return inner ;
		}
		if(JSON.stringify(result).indexOf('[')===0){
			var lastindex = result.length - 1 ;
			result.forEach(function(r){
				if(r['iscity']>1){
					if(result[1]['id']==r['id']){inner += '<area>';} 
					inner += '<item>' ;
				}
				if(r['iscity']==1){
					inner += '<city>' ;
				}
				inner += _mkxml(r) ;
				if(r['iscity']>1){
					inner += '</item>' ;
					if(result[lastindex]['id']==r['id']){inner += '</area>'}
				}
				if(r['iscity']==1){
					inner += '</city>' ;
				}
			}) ;
			return inner ;
		}
	}
} ;

var mkxml = function(result){
	
	var inner = '' ;
	if(typeof(result)!='object'){
		return inner=result ;
	}
	else{
	var letter ='' ;
	var lastletter = '' ;
	result.forEach(function(r){
		letter = r['letter'] ;
		if(letter != lastletter){
			if(lastletter!=''){
				inner += '</'+lastletter+'>' ;
			}	
			lastletter = letter ;
			inner += '<'+letter+'>' ;
		}
		inner += '<item>'
		Object.keys(r).map(function(key){
			if(key!='iscity'){
				inner += '<'+key+'>' ;
		    	inner += r[key] ;
				inner += '</'+key+'>' ;
			}
		}) ;
		inner += '</item>' ;
	}) ;
	inner +='</Z>' ;
	return inner ;
	}
} ;
