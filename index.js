"use strict";

const AmazonHandler = require("./lib/route53")

const getClient = function(opts) {
	let subclass;
	switch(opts.platform) {
		case "aws":
			subclass = AmazonHandler;
	}
	return new subclass(opts.domain);
}

module.exports = {
	"getClient": getClient
}