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
	const params = {
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
		params.ChangeBatch.Changes[0].ResourceRecordSet.ResourceRecords = opts.values.map( r => { return {Value: r}; }); 
	}
	return params;
}

function checkForDomainInResponse(hostName, response, domain) {
	return _.some(_.flatMap(response), {"Name": hostName.concat(".", domain, ".")})
}

function extractZoneIdFromResponse(response) {
	return _.chain(response)
	.flatMap()
	.find(["Config.PrivateZone",false])
	.get("Id")
	.value(); 
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
		.then(extractZoneIdFromResponse)
		.catch(console.error);
	}

	addRecord(opts) {
		return this.getHostedZoneId()
			.then(hostedZoneId => this.Route53.changeResourceRecordSets(
				changeRequestMethod(
					generateParams(hostedZoneId, this.domain, opts), "UPSERT"
				)
			).promise())
			.then(response => {
				console.log("[INFO]", "Succesfully updated DNS for " + opts.name);
				return response;
			})
			.catch(console.error);
	}


	removeRecord(opts) {
		return this.getHostedZoneId()
			.then(hostedZoneId => this.Route53.changeResourceRecordSets(
				changeRequestMethod(
					generateParams(hostedZoneId, this.domain, opts), "DELETE"
				)
			).promise())
			.then(response => {
				console.log("[INFO]", "Succesfully deleted DNS for " + opts.name);
				return response;
			})
			.catch(console.error);
	}

	isHostnameAvailable(hostName) {
		return this.getHostedZoneId()
			.then(zone => this.Route53.listResourceRecordSets({
				HostedZoneId: zone,
			}).promise())
			.then(response => !(checkForDomainInResponse(hostName, response, this.domain)))
			.catch(console.error);
	}
}

module.exports = AWSHandler;