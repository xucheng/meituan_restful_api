/**
 * @author helloworldjerry@gmail.com
 */
var dao = require('../../dao/common') ;
var mysql = dao.createClient() ;
var parameters = require('../../config/contant')['parameters'] ;
var price_p = parameters['price'] ;
var cate_p = parameters['category'] ;
var order_p = parameters['order'] ;

module.exports = {
	meituan: function(req, res){
		var type = req.params[0] ;
		var city = req.params[1] ;
		var area = req.params[2] ;
		var price = req.params[3] ;
		var cate = req.params[4] ;
		var order = req.params[5] ;
		var keyword = req.params[6] ;
		var pagesize = req.params[7] ;
		var page = req.params[8] ;
		var _condition = '' ;
		var order_statement = '' ;
		var offset = '' ; 
		var t = '' ; /*template city table*/

		if(!type){
			type = 'xml' ;
		}
		if(price){
			if(price_p[price] !== undefined){
				var price_from = price_p[price][0] ;
				var price_to   = price_p[price][1] ;
				_condition += ' and w.price between '+price_from+' and '+price_to ;
			}
		}
		if(cate){
			var flag = false ;
			cate_p.forEach(function(category){
				if(category == cate) flag = true ;
			}) ;
			if(false === flag) cate = null ;
		}
		if(cate) { 
			_condition += ' and c.ename = "'+cate+'"' ;
		}
		if(keyword){
			_condition += ' and (w.title like "%'+keyword+'%" or w.detail like "%'+keyword+'%") ' ;
		}
		if(order){
			var sep = parseInt(order.indexOf('-')) ;
			if((sep|0)>0) {var _order = order.substring(0,sep) ; var _orderby = order.substring(sep+1); }
			else {var _order = order; var _orderby = 'asc'; }
			if(order_p[_order]==undefined){
				_order = null ;
				_orderby = null ;
			}else{
				_order = order_p[_order] ;
				if(_orderby != 'asc' &&  _orderby != 'desc') _orderby = 'asc' ;
			}
		}
		if(_order) order_statement += ' order by '+_order+' '+_orderby ;
		if(pagesize) {pagesize = parseInt(pagesize) ;}else{pagesize = 5000 ;}
		if(page) {page = parseInt(page) ;}else{page = 1;}
		offset += ' limit '+pagesize*(page-1)+', '+pagesize ;

		var _city = _area = '' ;
		if(city){if((city|0)>0) {_city += ' and citya.id ='+city; }else{_city += ' and citya.ename ="'+city+'"'; }}
		if(area){if((area|0)>0) {_area += ' and cityb.id ='+area; }else{_area += ' and cityb.ename ="'+area+'"';  }}
		if(_city){
			t += ' (select citya.id, citya.name from city citya inner join city cityb on cityb.parentid=citya.id '+_city ;
			if(_area) t += _area ;
			t += '  limit 1 ) t' ; 
		}else{
			t = ' city t ' ;
		}

		var str_query = 'select n.title as website, n.homepage as siteurl, w.categoryid, w.subcategory, w.link as loc, w.title, w.image, w.price as value, w.marketprice as price, w.rebate, w.curnumber as bought, w.begintime as startTime, w.endtime as endTime,t.name as city from ware w inner join navsite as n on w.navid=n.id inner join category c on w.categoryid=c.id inner join '+t+' on w.cityid=t.id where n.id=14 and w.endtime > unix_timestamp(now()) '+_condition+order_statement+offset ;
		console.log(str_query) ;
		mysql.query(str_query, function(err, result){
			if(err) throw err ;
			_rebuild(type, result, function(error, docc, type){
				if(error) throw error ;
				if(type==='xml') res.send(docc,{'Content-Type':'text/xml; charset=UTF-8'},200) ;
				else res.send(docc,{'Content-Type':'text/plain; charset=UTF-8'},200) ;
			}) ;
			
		}) ;
	}
} ;

var _rebuild = function(type, result, cb){
	if(!type) type='xml' ;
	var _result = '' ;
	switch(type){
		case 'xml':
		var tmp = '<urlset>' ;
		result.forEach(function(r){
			tmp += '<url>' ;
			tmp += '<loc>'+r['loc']+'</loc>' ;
			tmp += '<data><display>' ;
			if(r['title']){
				Object.keys(r).map(function(key){
					tmp += '<'+key+'>'+r[key]+'</'+key+'>' ;
				}) ;
			}
			tmp += '</display></data>' ;
			tmp += '</url>' ;
		}) ;
		tmp += '</urlset>' ;
		_result = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"+tmp.replace(new RegExp('&','gm'),'&amp;') ;
		break ;
		case 'json':
		var tmp = [] ;
		result.forEach(function(r){
			var _loc = r['loc'] ;
			if(r['title']){
				var _display = r ;
				
			}else{
				var _display = {} ;
			}
			var _data = {display:_display} ;
			var url = {loc:_loc, data:_data} ;
			tmp.push(url) ;
		}) ;
		_result = {urlset:tmp} ;
		break ;
	}
	cb(null, _result, type) ;
}
