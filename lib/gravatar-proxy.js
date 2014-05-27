var http = require('http'),
	crypto = require('crypto'),
	fs = require('fs'),
	sep = require('path').sep
	proxy_base =  __dirname + sep + 'gravatar-proxy' + sep,
	known_bad = [];

// Gravatar Docs: https://en.gravatar.com/site/implement/images/

module.exports = function(basePath, apiKey) {
	var proxyTo = function(url, response, cache_file, hash) {
		try {
			return http.get(url, function (res) {
				if (res.statusCode == 200) {
					var writable = fs.createWriteStream( cache_file );
					res.pipe( writable );
					res.pipe( response );
				} else {
					response.sendfile(proxy_base + 'none.jpg');
					known_bad.push(hash);
				}
			});
		} catch (err) {
			response.writeHead(500, { "Content-Type": "text/html" });
			response.end(url, err.message);
		}
	};

	var proxy = function(req, res) {
		var hash = crypto.createHash('md5').update( req.params.hash ).digest('hex'),
			cache_file = proxy_base + hash + '.jpg';
		return fs.exists( cache_file, function (exists) {
			if ( exists ) {
				res.sendfile( cache_file );
			} else if ( known_bad.indexOf(hash) > -1 ) {
				res.sendfile(proxy_base + 'none.jpg');
			} else {
				proxyTo('http://gravatar.com/avatar/'+hash+'?d=404&s=100', res, cache_file, hash);
			}
		});
	};
	return proxy;
};