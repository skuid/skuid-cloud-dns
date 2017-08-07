"use strict";

const _ = require("lodash");
const AWS = require("aws-sdk");
const CustomError = require("errors")
const DNSHandler = require("handler")
const Promise = require("bluebird");

class AWSHandler extends DNSHandler {

	static get Route53() {
		if (!(this._route53)) {
			this._route53 = new this.AWS.Route53();
		}
		return this._route53;
	}

	static get AWS() {
		if (!(this._awsSdk)) {
			this._awsSdk = AWS;
		}
		return this._awsSdk;
	}

	static getHostedZoneId() {
		return this.Route53.listHostedZonesByName({
			DNSName: config.web.host,
		}).promise()
			.then(response => _.filter(_.flatMap(response), [
				"Config.PrivateZone",
				false,
			])[0].Id)
			.catch(error => {
				console.log("[ERROR]", error);
			});
	}

	static createParams(hostedZoneId, hostName) {
		let params = {
			HostedZoneId: hostedZoneId,
			ChangeBatch: {
				Changes: [
					{
						Action: "UPSERT",
						ResourceRecordSet: {
							Name: hostName + ".",
							Type: "CNAME",
							TTL: 3600,
							ResourceRecords: [
								{
									Value: ,
								},
							],
						},
					},
				],
			},
		};
		return Promise.resolve(params);
	}

	addRecord(hostName) {
		return this.getHostedZoneId(config)
			.then(hostedZoneId => this.createParams(hostedZoneId, hostName))
			.then((params) => {
				params.ChangeBatch.Changes[0].Action = "UPSERT";
				return Promise.resolve(params);
			})
			.then(params => this.Route53.changeResourceRecordSets(params).promise())
			.then(response => {
				console.log("[INFO]", "Succesfully updated DNS for " + hostName);
				return response;
			})
			.catch(error => {
				console.log("[ERROR]", error);
			});
	}


	removeRecord(hostName) {
		return this.getHostedZoneId(config)
			.then(hostedZoneId => this.createParams(hostedZoneId, hostName))
			.then((params) => {
				params.ChangeBatch.Changes[0].Action = "DELETE";
				return Promise.resolve(params);
			})
			.then(params => this.Route53.changeResourceRecordSets(params).promise())
			.then(response => {
				console.log("[INFO]", "Succesfully deleted DNS for " + hostName);
				return response;
			})
			.catch(error => {
				console.log("[ERROR]", error);
			});
	}

	isHostnameAvailable(hostName) {
		return this.getHostedZoneId(config)
			.then(zone => this.Route53.listResourceRecordSets({
				HostedZoneId: zone,
			}).promise())
			.then((response) => {
				let record = _.filter(_.flatMap(response), {
					"Name": hostName.concat(".", config.web.host, "."),
				});
				if (!(_.first(record))) {
					return Promise.resolve(true);
				} else {
					throw new CustomError("Subdomain " + hostName + " is currently in use!");
				}
			});
	}
}

module.exports = DNSRoute53;