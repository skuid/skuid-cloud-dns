"use strict";

/* example success response:
{
  "result": {
    "id":"2d4d028de3015345da9420df5514dad0",
    "type":"A",
    "name":"blog.example.com",
    "content":"2.6.4.5",
    "proxiable":true,
    "proxied":false,
    "ttl":1,
    "priority":0,
    "locked":false,
    "zone_id":"cd7d068de3012345da9420df9514dad0",
    "zone_name":"example.com",
    "modified_on":"2014-05-28T18:46:18.764425Z",
    "created_on":"2014-05-28T18:46:18.764425Z"
  },
  "success": true,
  "errors": [],
  "messages": [],
  "result_info": {
    "page": 1,
    "per_page": 20,
    "count": 1,
    "total_count": 200
  }
}
*/
/* example error response:
{
  "result": null,
  "success": false,
  "errors": [{"code":1003,"message":"Invalid or missing zone id."}],
  "messages": []
}
*/

const CustomError = require("./errors")
const DNSHandler = require("./base")

const cloudflare = require('cloudflare');
let cf;

const NO_DOMAIN_MSG = "Domain is required";
const NO_ZONE_MSG = "Could not get zone ID for domain";
const NO_DOMAIN_ID_MSG = "Could not get DNS record ID for domain";

async function getZone(domain) {
	const zones = await cf.zones.browse({
		name: domain,
	});
	if (!zones.result || zones.success !== true) {
		let msg = "Could not retrieve zones";
		if (zones.errors && zones.errors.length) {
			msg += ": " + zones.errors[0].message;
		}
		throw new CustomError(msg);
	}
	if (!zones.result.length) {
		throw new CustomError(`${NO_ZONE_MSG} ${domain}`);
	}
	const zoneId = zones.result[0].id;
	if (!zoneId) {
		throw new CustomError(`${NO_ZONE_MSG} ${domain}`);
	}
	return zoneId;
}

async function getDNSRecords(zoneId) {
	const records = await cf.dnsRecords.browse(zoneId);
	return records;
}

class CloudflareHandler extends DNSHandler {
	constructor(domain) {
		cf = cloudflare({
		  email: process.env.CLOUDFLARE_EMAIL,
		  key: process.env.CLOUDFLARE_API_KEY,
		});
		if (!domain) {
			throw new CustomError(NO_DOMAIN_MSG);
		}
		super();
		this.domain = domain;
		this._cf = cf;
	}

	async addRecord(opts) {
		const zoneId = await getZone(this.domain);
		let value = "";
		if (opts.values && opts.values.length > 0) {
			value = opts.values[0]; // cloudflare only supports one value
		}
		const record = {
			type: "CNAME",
			name: opts.name.concat(".", this.domain, "."),
			content: opts.values && opts.values.length > 0 && opts.values[0],
			ttl: opts.ttl || 3600,
		};
		const response = await cf.dnsRecords.add(zoneId, record);
		console.log("[INFO]", "Succesfully updated DNS for " + opts.name);
		return response;
	}

	async removeRecord(opts) {
		const zoneId = await getZone(this.domain);
		const dnsRecords = await getDNSRecords(zoneId);
		if (!dnsRecords || !dnsRecords.success || !dnsRecords.result || dnsRecords.result.length < 1) {
			throw new CustomError(NO_DOMAIN_ID_MSG);
		}
		const dnsId = dnsRecords.result[0].id;
		const response = await cf.dnsRecords.del(zoneId, dnsId);
		console.log("[INFO]", "Succesfully deleted DNS for " + opts.name);
		return response;
	}

	async isHostnameAvailable(hostName) {
		const zoneId = await getZone(this.domain);
		const dnsRecords = await getDNSRecords(zoneId);
		return (!!dnsRecords && dnsRecords.success && !!dnsRecords.result && dnsRecords.result.length < 1);
	}
}

module.exports = CloudflareHandler;