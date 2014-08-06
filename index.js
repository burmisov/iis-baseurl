var url = require('url');

// Cut off IIS virtual path (base url) from the request url when running via IISNODE
// with URL Rewrite
//
// Add "APPL_MD_PATH" to "promoteServerVars" iisnode attribute in web.config
module.exports = function () {
	// res.redirect patch to support redirections on base url
	var newRedirect = function (status, urlTo) {
		// Allow optional "status"
		if (typeof urlTo === 'undefined') {
			urlTo = status;
			status = 302;
		}

		// If passed url is has protocol (probably leading out of site),
		// or is one of special cases - "parent" or "..", do original redirect
		var urlObj = url.parse(urlTo);
		if ((!!urlObj.protocol) || (urlTo === 'parent') || (urlTo === '..')) {
			return this.originalRedirect.call(this, status, urlTo);
		}

		if (this.req.iisNodeBaseUrl) {
			return this.originalRedirect.call(this, status, this.req.iisNodeBaseUrl + urlTo);
		} else {
			return this.originalRedirect.call(this, status, urlTo);
		}
	};

	var middleWareFunc = function (req, res, next) {
		var appMdPath = req.headers['x-iisnode-appl_md_path'];
 
		if (appMdPath) {
			var rootPos = appMdPath.search("/ROOT");
			if (rootPos > -1) {
				// Transform e.g. '/LM/W3SVC/1/ROOT/testbaseurl' -> '/testbaseurl'
				var baseUrl = (appMdPath.slice(appMdPath.search("/ROOT") + ("/ROOT").length)).toLowerCase();
				res.locals.iisBaseUrl = baseUrl;
				if (baseUrl != "") {
					// Transform e.g. '/testbaseurl/assets/js/script.js' -> '/assets/js/script.js'
					// If url becomes blank, replace it with "/" to avoid routing fails
					req.url = req.url.toLowerCase().replace(baseUrl, "") || "/";
					req.iisNodeBaseUrl = baseUrl;

					// Patch res.redirect for correct redirection
					res.originalRedirect = res.redirect;
					res.redirect = newRedirect;
				}
			}
		}
 
		return next();
	};
	
	return middleWareFunc;
};
