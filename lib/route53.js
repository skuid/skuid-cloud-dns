"use strict";

const _ = require("lodash");
const AWS = require("aws-sdk");
const Promise = require("bluebird");

const CustomError = require("./errors")
const DNSHandler = require("./base")


function changeRequestMethod(params, method) {
	params.ChangeBatch.Changes[0].Action = method;
	return params;
}

function generateParams(hostedZoneId, domain, opts) {
	let params = {
		HostedZoneId: hostedZoneId,
		ChangeBatch: {
			Changes: [
				{
					Action: "",
					ResourceRecordSet: {
						Name: opts.name.concat(".", domain, "."),
						Type: opts.type || "CNAME",
						TTL: opts.ttl || 3600,
					},
				},
			],
		},
	};

	if (opts.values) {
		params.ChangeBatch.Changes[0].ResourceRecordSet.ResourceRecords = opts.values.map(function(r){
			return {
				Value: r
			}
		});
	}
	return params;
}

function checkForDomainInResponse(hostName, response, domain) {
	let record = _.filter(_.flatMap(response), {
		"Name": hostName.concat(".", domain, "."),
	});

	if (_.first(record)) {
		return false;
	} else {
		return true;
	}
}


class AWSHandler extends DNSHandler {

	constructor(domain) {
		super();
		this.domain = domain;
	}

	get Route53() {
		if (!(this._route53)) {
			this._route53 = new this.AWS.Route53();
		}
		return this._route53;
	}

	get AWS() {
		if (!(this._awsSdk)) {
			this._awsSdk = AWS;
		}
		return this._awsSdk;
	}

	getHostedZoneId() {
		return this.Route53.listHostedZonesByName({
			DNSName: this.domain,
		}).promise()
		.then(response => _.filter(_.flatMap(response), [
			"Config.PrivateZone",
			false,
		])[0].Id)
		.catch(error => {
			console.log("[ERROR]", error);
		});
	}

	addRecord(opts) {
		return this.getHostedZoneId()
			.then(hostedZoneId => generateParams(hostedZoneId, this.domain, opts))
			.then(params => changeRequestMethod(params, "UPSERT"))
			.then(params => this.Route53.changeResourceRecordSets(params).promise())
			.then(response => {
				console.log("[INFO]", "Succesfully updated DNS for " + opts.name);
				return response;
			})
			.catch(error => {
				console.log("[ERROR]", error);
			});
	}


	removeRecord(opts) {
		return this.getHostedZoneId()
			.then(hostedZoneId => generateParams(hostedZoneId, this.domain, opts))
			.then(params => changeRequestMethod(params, "DELETE"))
			.then(params => this.Route53.changeResourceRecordSets(params).promise())
			.then(response => {
				console.log("[INFO]", "Succesfully deleted DNS for " + opts.name);
				return response;
			})
			.catch(error => {
				console.log("[ERROR]", error);
			});
	}

	isHostnameAvailable(hostName) {
		return this.getHostedZoneId()
			.then(zone => this.Route53.listResourceRecordSets({
				HostedZoneId: zone,
			}).promise())
			.then(response => checkForDomainInResponse(hostName, response, this.domain))
			.catch(error => {
				console.log("[ERROR]", error)
			});
	}
}

module.exports = AWSHandler;