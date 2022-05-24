"use strict";

const AmazonHandler = require("./lib/route53");
const CloudflareHandler = require("./lib/cloudflare");

const getClient = function(opts) {
	let subclass;
	switch(opts.platform) {
		case "aws":
			subclass = AmazonHandler;
			break;
		case "cloudflare":
			subclass = CloudflareHandler;
			break;
	}
	return new subclass(opts.domain);
}

module.exports = {
	"getClient": getClient
}