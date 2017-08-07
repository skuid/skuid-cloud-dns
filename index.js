"use strict";

const AmazonHandler = require("./lib/route53")

const getClient = function(platform, domainName) {
	let subclass;
	switch(platform) {
		case "aws":
			subclass = AmazonHandler;
	}
	return new subclass(domainName);
}

module.exports = {
	"getClient": getClient
}