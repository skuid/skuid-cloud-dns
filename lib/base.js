"use strict";

class DNSHandler {
	addRecord() {
		throw new Error({
			"message": "NotImplemented on superclass",
		});
	}

	removeRecord() {
		throw new Error({
			"message": "NotImplemented on superclass",
		});
	}

	isHostnameAvailable() {
		throw new new Error({
			"message": "NotImplemented on superclass",
		});
	}
}

module.exports = DNSHandler;