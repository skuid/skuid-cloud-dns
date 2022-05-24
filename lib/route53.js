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

	async getHostedZoneId() {
		const response = await this.Route53.listHostedZonesByName({
			DNSName: this.domain,
		}).promise();
		return extractZoneIdFromResponse(response);
	}

	async addRecord(opts) {
		if (!this.domain) {
			throw new CustomError("Domain is not set!");
		}
		let hostedZoneId = await this.getHostedZoneId();
		let response = await this.Route53.changeResourceRecordSets(
			changeRequestMethod(
				generateParams(hostedZoneId, this.domain, opts), "UPSERT"
			)
		).promise();
		console.log("[INFO]", "Succesfully updated DNS for " + opts.name);
		return response;
	}


	async removeRecord(opts) {
		if (!this.domain) {
			throw new CustomError("Domain is not set!");
		}
		let hostedZoneId = await this.getHostedZoneId();
		let response = await this.Route53.changeResourceRecordSets(
			changeRequestMethod(
				generateParams(hostedZoneId, this.domain, opts), "DELETE"
			)
		).promise();
		console.log("[INFO]", "Succesfully deleted DNS for " + opts.name);
		return response;
	}

	async isHostnameAvailable(hostName) {
		if (!this.domain) {
			throw new CustomError("Domain is not set!");			
		}
		let zone = await this.getHostedZoneId();
		let response = await this.Route53.listResourceRecordSets({
			HostedZoneId: zone,
			StartRecordName: hostName.concat(".", this.domain, "."),
			MaxItems: "1",
		}).promise();
		return !checkForDomainInResponse(hostName, response, this.domain);
	}
}

module.exports = AWSHandler;