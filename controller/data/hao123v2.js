/**
 * @author helloworldjerry@gmail.com
 */
var reg = new RegExp("(.*)\\?(.*)",'g') ;
var gzip = require('gzip') ;
module.exports = {
  	hao123v2: function(req, res){

		var hao123v2 = _initial('hao123v2') ;
		var order = hao123v2.orderable ;
		var mongoose = hao123v2._mongoose ;

		var type = req.params[0] ;
		var city = req.params[2] ;
		var range = req.params[3] ;
		var price = req.params[4] ;
		var rebate = req.params[5] ;
		var category = req.params[6] ;
		var subcategory = req.params[7] ;
		var start = req.params[8] ;
		var end = req.params[9] ;
		var order = req.params[10] ;
		var keyword = req.params[11] ;
		var pagesize = req.params[12] ;
		var page = req.params[13] ;
		var ke = req.params[1] ;

		if(!type || type != 'xml' && type != 'json') type = 'xml' ;
		
		if(price){
			var index = price.indexOf('-') ;
			if(index>0){
				var pf = price.substring(0,index) ;
				var pe = price.substring(index+1) ;
			}else{
				var pf = price ;
				var pe = 99999999 ;
			}
			pf = parseInt(pf) ;
			pe = parseInt(pe) ;
		}

		if(category){
			category = parseInt(category) ;
		}
		if(rebate){
			if(rebate>=10) rebate = 10 ;
			rebate = parseInt(rebate) ;
		}
//		if(start==null){
//			start = new Date() ;
//		}
		if(start){
			start = Date.parse(start)/1000 ;
		}
		if(end){
			end = Date.parse(end)/1000 ;
		}

		if(order){
			var sep = order.indexOf('-') ;
			var _order = null ;

			if(sep>0){
				_order = order.substring(0,sep) ;
				var _sortby = order.substring(sep+1).toLowerCase() ;
			}

			if(_sortby!='desc' && _sortby!='asc')	_sortby = 'desc' ;

			if(!_order || order[_order]){
				_order = 'price' ;				
			}
			_sortby = _sortby == 'desc' ? -1 : 1 ;
		}

		key = ke || "{{key}}" ;

		if(pagesize){
			pagesize = parseInt(pagesize) ;
		}else{
			pagesize = 12000 ;
		}

		if(page){
			page = parseInt(page) ;
		}else{
			page = 1 ;
		}

		page = page ? (page-1)*pagesize : 0 ;
		
		var query = hao123v2.model.find({},{}) ;


		if(_order) query.sort('data.display.'+_order,_sortby) ;
		if(city) query.where('data.display.city',city) ;
		if(range) query.where('data.display.range', new RegExp(range,'g')) ;

		if(category) query.where('data.display.category',category) ;
		if(subcategory) query.where('data.display.subcategory', new RegExp(subcategory,'g')) ;

		if(keyword) query.or([{"data.display.title":new RegExp(keyword,'g')},{"data.display.name":new RegExp(keyword,'g')},{"data.display.website":new RegExp(keyword,'g')},{"data.display.siteurl":new RegExp(keyword,'g')}]) ;

		if(pf!==undefined&&pe!==undefined) query.where('data.display.price').gte(pf).lte(pe) ;
		if(rebate) query.where('data.display.rebate').lte(rebate) ;
		if(start) query.where('data.display.endTime').gte(start) ;
		if(end) query.where('data.display.endTime').lte(end) ;

		query.skip(page) ;
		query.limit(pagesize) ;

		query.exclude('_id','data._id','data.display._id') ;
		query.exec(function(err, docs){
			if(err) throw err ;
			console.log(docs.length) ;
			_rebuild(type, docs, function(err, result, type){
				if(type=='json'){
					gzip(JSON.stringify(result), function(err_, data){
						res.send(data, {'Content-Type':'text/plain; charset=UTF-8', 'Content-Encoding':'gzip'}, 200) ;
					}) ;
				}else{
					gzip(result, function(err_, data){
						res.send(data, {'Content-Type':'text/xml; charset=UTF-8', 'Content-Encoding':'gzip'}, 200) ;
					}) ;
				}
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
			r['loc'] = r['loc'].replace(reg,'http://r.union.meituan.com/url/visit/?a=1&key='+key+'&'+"$2") ;
			tmp += '<loc>'+r['loc']+'</loc><data>' ;
			tmp += _mkxml(r['data']) ;
			tmp += '</data></url>' ;
		}) ;
		tmp += '</urlset>' ;
		_result = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"+tmp.replace(new RegExp('&','gm'),'&amp;').replace(new RegExp('<\\s*\\/?\\s*br\\s*>','gm'),'') ;
		break ;
		case 'json':
		var tmp = [] ;
		result.forEach(function(r){
			r["loc"] = r["loc"].replace(reg,'http://r.union.meituan.com/url/visit/?a=1&amp;key='+key+'&amp;'+"$2") ;
			var _url = {url:r}
			tmp.push(_url) ;
		}) ;
		_result = {urlset:tmp} ;
		break ;
	}
	cb(null, _result, type) ;
} ;

var _mkxml = function(result){
	var inner = '' ;
	if(typeof(result)!='object'){
		if(result=='[object Object]') return inner = '' ;
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
			result.forEach(function(r){
				inner += _mkxml(r) ;
			}) ;
			return inner ;
		}
	}
} ;

var _initial = function(db){
	var dao = require('../../dao/mongodb') ;
	var ob = dao.createClient(db) ;
	var params = require('../../config/'+db)['parameters'] ;
	var _orderable = params['order'] ;
	return {model:ob._model,orderable:_orderable,_mongoose:ob._mongoose} ;
} ;

var isEmptyObject = function(obj){
	if(JSON.stringify(empty).indexOf('{')===0){
		for(var name in obj){
			return false ;
		}
		return true ;
	}
	return false ;
} ;
