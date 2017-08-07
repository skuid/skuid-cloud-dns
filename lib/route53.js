"use strict";

const _ = require("lodash");
const AWS = require("aws-sdk");
const Promise = require("bluebird");

const CustomError = require("./errors")
const DNSHandler = require("./base")

class AWSHandler extends DNSHandler {

	constructor(domainName) {
		super();
		this.domainName = domainName;
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

	_getHostedZoneId() {
		return this.Route53.listHostedZonesByName({
			DNSName: this.DomainName,
		}).promise()
			.then(response => _.filter(_.flatMap(response), [
				"Config.PrivateZone",
				false,
			])[0].Id)
			.catch(error => {
				console.log("[ERROR]", error);
			});
	}

	_generateParams(hostedZoneId, opts) {
		let params = {
			HostedZoneId: hostedZoneId,
			ChangeBatch: {
				Changes: [
					{
						Action: "",
						ResourceRecordSet: {
							Name: opts.name.concat(".", this.domainName, "."),
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
		return Promise.resolve(params);
	}

	addRecord(opts) {
		return this._getHostedZoneId()
			.then(hostedZoneId => this._generateParams(hostedZoneId, opts))
			.then((params) => {
				params.ChangeBatch.Changes[0].Action = "UPSERT";
				return Promise.resolve(params);
			})
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
		return this._getHostedZoneId()
			.then(hostedZoneId => this._generateParams(hostedZoneId, opts))
			.then((params) => {
				params.ChangeBatch.Changes[0].Action = "DELETE";
				return Promise.resolve(params);
			})
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
		return this._getHostedZoneId()
			.then(zone => this.Route53.listResourceRecordSets({
				HostedZoneId: zone,
			}).promise())
			.then((response) => {
				let record = _.filter(_.flatMap(response), {
					"Name": hostName.concat(".", this.domainName, "."),
				});
				if (!(_.first(record))) {
					return Promise.resolve(true);
				} else {
					throw new CustomError("Subdomain " + hostName + " is currently in use!");
				}
			})
			.catch(error => {
				console.log("[ERROR]", error)
			});
	}
}

module.exports = AWSHandler;