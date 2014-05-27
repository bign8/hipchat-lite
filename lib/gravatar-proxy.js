var http = require('http'),
	crypto = require('crypto'),
	fs = require('fs');

// Gravatar Docs: https://en.gravatar.com/site/implement/images/

module.exports = function(basePath, apiKey) {
	var proxyTo = function(url, response, writable) {
		try {
			return http.get(url, function (res) {
				if (res.statusCode == 200) {
					res.pipe( writable );
					res.pipe( response );
				} else response.sendfile(__dirname + '/gravatar-proxy/none.jpg');
			});
		} catch (err) {
			response.writeHead(500, { "Content-Type": "text/html" });
			response.end(url, err.message);
		}
	};

	var proxy = function(req, res, next) {
		var hash = crypto.createHash('md5').update( req.params.hash ).digest('hex'),
			cache_file = __dirname + '/gravatar-proxy/' + hash + '.jpg';
		return fs.exists( cache_file, function (exists) {
			if (exists) {
				res.sendfile( cache_file );
			} else {
				var writable = fs.createWriteStream( cache_file );
				proxyTo("http://gravatar.com/avatar/" + hash + "?d=404&s=100", res, writable);
			}
		});
	};
	return proxy;
};