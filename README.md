iis-baseurl
===========

Cut off IIS virtual path (base url) from the request url when running via IISNODE with URL Rewrite

Add "APPL_MD_PATH" to "promoteServerVars" iisnode attribute in web.config!!

Then use like this:
```
var express = require('express');
var iisBaseUrl = require('iis-baseurl');

var app = express();

app.use(iisBaseUrl());

app.listen(process.env.PORT || 3000);
```

It works seamlessly wether on dev machine or off IIS virtual path or app.
