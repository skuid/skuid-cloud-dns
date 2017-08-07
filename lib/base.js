"use strict";

class DNSHandler {
	addRecord(hostName) {
		throw new Error({"message": "NotImplemented on superclass"})
	}

	removeRecord(hostName) {
		throw new Error({"message": "NotImplemented on superclass"})
	}

	isHostnameAvailable(hostName) {
		throw new new Error({"message": "NotImplemented on superclass"})	
	}
}

module.exports = DNSHandler;