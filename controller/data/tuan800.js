/**
 * @author helloworldjerry@gmail.com
 */
var reg = new RegExp("(.*)\\?(.*)",'g') ;
var gzip = require('gzip') ;
module.exports = {
  	tuan800: function(req, res){

		var tuan800 = _initial('tuan800') ;
		var model = tuan800.model ;
		var order = tuan800.orderable ;
		var mongoose = tuan800._mongoose ;

		var type = req.params[0] ;
		var city = req.params[2] ;
		var shoparea = req.params[3] ;
		var price = req.params[4] ;
		var tag = req.params[5] ;
		var start = req.params[6] ;
		var end = req.params[7] ;
		var post = req.params[8] ;
		var soldout = req.params[9] ;
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
		
		if(tag){
			tag = tag.replace(new RegExp('，','g'),'|').replace(new RegExp(',','g'),'|') ;
		}

		if(shoparea){
			shoparea = shoparea.replace(new RegExp(',','g'),'|').replace(new RegExp('，','g'),'|') ;
		}
		
		if(post){
			post = (post !=0 && post !=1) ? 'no' : post == 1 ? 'yes': 'no' ;
		}
		if(soldout){
			soldout = (soldout !=0 && soldout !=1) ? 'no' : soldout == 1 ? 'yes' : 'no' ;
		}

	
		if(start==null){
			start = new Date() ;
		}

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
		}

		key = ke || "{{key}}" ;

		if(pagesize){
			pagesize = parseInt(pagesize) ;
		}else{
			pagesize = 15000 ;
		}
		if(page){
			page = parseInt(page) ;
		}else{
			page = 1 ;
		}
		page = (page-1)*pagesize ;
		
		var query = model.find({}, {}) ;

		if(_order) query.sort('data.display.'+_order, _sortby) ; 
		if(city) query.where('data.display.city',city) ;

		if(tag) query.where('data.display.tag', new RegExp(tag,'g')) ;
		if(post) query.where('data.display.post',post) ;
		if(soldout) query.where('data.display.soldOut', soldout) ;

		if(keyword) query.or([{"data.display.title":new RegExp(keyword,'g')},{"data.display.tip":new RegExp(keyword,'g')},{"data.display.website":new RegExp(keyword,'g')},{"data.display.siteurl":new RegExp(keyword,'g')}]) ;

		if(pf!==undefined&&pe!==undefined) query.where('data.display.price').gte(pf).lte(pe) ;
		if(start) query.where('data.display.endTime').gte(start) ;
		if(end) query.where('data.display.endTime').lte(end) ;

		if(shoparea){
			query.where('data.shops.shop.name',new RegExp(shoparea,'g')) ;
			query.where('data.shops.shop.addr',new RegExp(shoparea,'g')) ;
			query.where('data.shops.shop.area',new RegExp(shoparea,'g')) ;
		}

		query.skip(page) ;
		query.limit(pagesize) ;

		query.exclude('_id','data._id','data.display._id','data.shops._id','data.shops.shop._id') ;
		query.exec(function(err, docs){
			if(err) throw err ;
			console.log(docs.length) ;
			_rebuild(type, key, docs, function(err, result, type){
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

var _rebuild = function(type, key, result, cb){
	if(!type) type='xml' ;
	var _result = '' ;
	switch(type){
		case 'xml':
		var tmp = '<urlset>' ;
		result.forEach(function(r){
			tmp += '<url>' ;
			r['loc'] = r['loc'].replace(reg,'http://r.union.meituan.com/url/visit/?a=1&key='+key+'&url='+"$1") ;
			r['wapLoc'] = r['wapLoc'].replace(reg,'http://r.union.meituan.com/url/visit/?a=1&key='+key+'&url='+"$1") ;
			tmp += '<loc>'+r['loc']+'</loc>' ;
			tmp += '<wapLoc>'+r['wapLoc']+'</wapLoc><data>' ;
			tmp += _mkxml(r['data']) ;
			tmp += '</data></url>' ;
		}) ;
		tmp += '</urlset>' ;
		_result = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"+tmp.replace(new RegExp('&','gm'),'&amp;') ;
		break ;
		case 'json':
		var tmp = [] ;
		result.forEach(function(r){
			r["loc"] = r["loc"].replace(reg,'http://r.union.meituan.com/url/visit/?a=1&amp;key='+key+'&amp;url='+"$1") ;
			r['wapLoc'] = r['wapLoc'].replace(reg,'http://r.union.meituan.com/url/visit/?a=1&key='+key+'&url='+"$1") ;
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
		return inner = result ;
	}else{
		if(JSON.stringify(result).indexOf('{')===0){
			Object.keys(result).map(function(key){
				if(key=='shop'){
					if(JSON.stringify(result[key]).indexOf('{')===0) {
						result[key] = [result[key]] ;
					}
				}
				if( key !='shop' ) inner += '<'+key+'>' ;
				inner += _mkxml(result[key]) ;
				if( key !='shop' ) inner += '</'+key+'>' ;
			}) ;
			return inner ;
		}
		if(JSON.stringify(result).indexOf('[')===0){
			result.forEach(function(r){
				inner += '<shop>' ;
				inner += _mkxml(r) ;
				inner += '</shop>' ;
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
}
