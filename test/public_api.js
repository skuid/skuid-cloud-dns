"use strict";

const Path = require("path");
const nock = require('nock');
const should = require('chai').should();

const dnsHandler = require('../index')


describe('Client Factory', function() {
  describe('#getClient({"platform": "aws", "domain": "skuid.eu"})', function() {
    var awsClient = dnsHandler.getClient({'platform': 'aws', 'domain': 'skuid.eu'});
    it('should return a handler bound to the correct domain', function(done){
      awsClient.should.have.property('domain');
      awsClient.domain.should.equal('skuid.eu');
      done();
    });

    it('should bind to the correct Cloud Provider', function(done) {
      awsClient.should.have.property('Route53');
      done();
    });
  });
});

describe("awsClient Public API", function() {


  let awsClient = dnsHandler.getClient({'platform': 'aws', 'domain': 'skuid.eu'});
  
  awsClient.AWS.config.credentials = new awsClient.AWS.SharedIniFileCredentials({
    profile: "ops",
    filename: Path.resolve("test/aws_credentials")
  });


  describe("#isHostnameAvailable()", function() {
    it("should fail when the subdomain is in use", function() {

        nock("https://route53.amazonaws.com:443", {
          "encodedQueryParams": true,
        })
          .get("/2013-04-01/hostedzonesbyname")
          .query(true)
          .reply(200, "<?xml version=\"1.0\"?>\n<ListHostedZonesByNameResponse xmlns=\"https://route53.amazonaws.com/doc/2013-04-01/\"><HostedZones><HostedZone><Id>/hostedzone/Z3M3AYV9KKG4AK</Id><Name>skuid.eu.</Name><CallerReference>RISWorkflow-aa29316118d68e0a0fd3e45f9c71efff</CallerReference><Config><Comment>HostedZone created by Route53 Registrar</Comment><PrivateZone>false</PrivateZone></Config><ResourceRecordSetCount>2</ResourceRecordSetCount></HostedZone></HostedZones><DNSName>skuid.eu</DNSName><IsTruncated>false</IsTruncated><MaxItems>100</MaxItems></ListHostedZonesByNameResponse>", [
            "x-amzn-RequestId",
            "3b5ebad7-de81-11e6-84bc-2589eab727d5",
            "Content-Type",
            "text/xml",
            "Content-Length",
            "567",
            "Date",
            "Thu, 19 Jan 2017 19:55:30 GMT",
          ]
          );
    
        nock("https://route53.amazonaws.com:443", {
          "encodedQueryParams": true,
        })
          .get("/2013-04-01/hostedzone/Z3M3AYV9KKG4AK/rrset")
          .query(true)
          .reply(200, "<?xml version=\"1.0\"?>\n<ListResourceRecordSetsResponse xmlns=\"https://route53.amazonaws.com/doc/2013-04-01/\"><ResourceRecordSets><ResourceRecordSet><Name>skuid.eu.</Name><Type>NS</Type><TTL>172800</TTL><ResourceRecords><ResourceRecord><Value>ns-1758.awsdns-27.co.uk.</Value></ResourceRecord><ResourceRecord><Value>ns-186.awsdns-23.com.</Value></ResourceRecord><ResourceRecord><Value>ns-1419.awsdns-49.org.</Value></ResourceRecord><ResourceRecord><Value>ns-740.awsdns-28.net.</Value></ResourceRecord></ResourceRecords></ResourceRecordSet><ResourceRecordSet><Name>skuid.eu.</Name><Type>SOA</Type><TTL>900</TTL><ResourceRecords><ResourceRecord><Value>ns-1758.awsdns-27.co.uk. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400</Value></ResourceRecord></ResourceRecords></ResourceRecordSet><ResourceRecordSet><Name>motorworld.skuid.eu.</Name><Type>CNAME</Type><TTL>3600</TTL><ResourceRecords><ResourceRecord><Value>dualstack.load.balancer.address</Value></ResourceRecord></ResourceRecords></ResourceRecordSet></ResourceRecordSets><IsTruncated>false</IsTruncated><MaxItems>100</MaxItems></ListResourceRecordSetsResponse>", [
            "x-amzn-RequestId",
            "3b77c06d-de81-11e6-b9af-373ba96ff5e6",
            "Content-Type",
            "text/xml",
            "Content-Length",
            "899",
            "Date",
            "Thu, 19 Jan 2017 19:55:30 GMT",
          ]
          );
    
        return awsClient.isHostnameAvailable("motorworld")
        .then(response => response.should.be.false)
      });

      it("should pass when the subdomain is in not in use", function() {
        
                nock("https://route53.amazonaws.com:443", {
                  "encodedQueryParams": true,
                })
                  .get("/2013-04-01/hostedzonesbyname")
                  .query(true)
                  .reply(200, "<?xml version=\"1.0\"?>\n<ListHostedZonesByNameResponse xmlns=\"https://route53.amazonaws.com/doc/2013-04-01/\"><HostedZones><HostedZone><Id>/hostedzone/Z3M3AYV9KKG4AK</Id><Name>skuid.eu.</Name><CallerReference>RISWorkflow-aa29316118d68e0a0fd3e45f9c71efff</CallerReference><Config><Comment>HostedZone created by Route53 Registrar</Comment><PrivateZone>false</PrivateZone></Config><ResourceRecordSetCount>2</ResourceRecordSetCount></HostedZone></HostedZones><DNSName>skuid.eu</DNSName><IsTruncated>false</IsTruncated><MaxItems>100</MaxItems></ListHostedZonesByNameResponse>", [
                    "x-amzn-RequestId",
                    "3b5ebad7-de81-11e6-84bc-2589eab727d5",
                    "Content-Type",
                    "text/xml",
                    "Content-Length",
                    "567",
                    "Date",
                    "Thu, 19 Jan 2017 19:55:30 GMT",
                  ]
                  );
            
                nock("https://route53.amazonaws.com:443", {
                  "encodedQueryParams": true,
                })
                  .get("/2013-04-01/hostedzone/Z3M3AYV9KKG4AK/rrset")
                  .query(true)
                  .reply(200, "<?xml version=\"1.0\"?>\n<ListResourceRecordSetsResponse xmlns=\"https://route53.amazonaws.com/doc/2013-04-01/\"><ResourceRecordSets><ResourceRecordSet><Name>skuid.eu.</Name><Type>NS</Type><TTL>172800</TTL><ResourceRecords><ResourceRecord><Value>ns-1758.awsdns-27.co.uk.</Value></ResourceRecord><ResourceRecord><Value>ns-186.awsdns-23.com.</Value></ResourceRecord><ResourceRecord><Value>ns-1419.awsdns-49.org.</Value></ResourceRecord><ResourceRecord><Value>ns-740.awsdns-28.net.</Value></ResourceRecord></ResourceRecords></ResourceRecordSet><ResourceRecordSet><Name>skuid.eu.</Name><Type>SOA</Type><TTL>900</TTL><ResourceRecords><ResourceRecord><Value>ns-1758.awsdns-27.co.uk. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400</Value></ResourceRecord></ResourceRecords></ResourceRecordSet></ResourceRecordSets><IsTruncated>false</IsTruncated><MaxItems>100</MaxItems></ListResourceRecordSetsResponse>", [
                    "x-amzn-RequestId",
                    "3b77c06d-de81-11e6-b9af-373ba96ff5e6",
                    "Content-Type",
                    "text/xml",
                    "Content-Length",
                    "899",
                    "Date",
                    "Thu, 19 Jan 2017 19:55:30 GMT",
                  ]
                  );
            
                return awsClient.isHostnameAvailable("motorworld")
                .then(response => response.should.be.true)
              });
    });

  describe("#addRecord()", function() {
    it("should call the AWS SDK Route53 method", function() {

      nock("https://route53.amazonaws.com:443", {
        "encodedQueryParams": true,
      })
        .get("/2013-04-01/hostedzonesbyname")
        .query({
          "dnsname": "skuid.eu",
        })
        .reply(200, "<?xml version=\"1.0\"?>\n<ListHostedZonesByNameResponse xmlns=\"https://route53.amazonaws.com/doc/2013-04-01/\"><HostedZones><HostedZone><Id>/hostedzone/Z3M3AYV9KKG4AK</Id><Name>skuid.eu.</Name><CallerReference>RISWorkflow-aa29316118d68e0a0fd3e45f9c71efff</CallerReference><Config><Comment>HostedZone created by Route53 Registrar</Comment><PrivateZone>false</PrivateZone></Config><ResourceRecordSetCount>2</ResourceRecordSetCount></HostedZone></HostedZones><DNSName>skuid.eu</DNSName><IsTruncated>false</IsTruncated><MaxItems>100</MaxItems></ListHostedZonesByNameResponse>", [
          "x-amzn-RequestId",
          "4afa7c44-d8ec-11e6-9733-5dfc9ad61f2e",
          "Content-Type",
          "text/xml",
          "Content-Length",
          "567",
          "Date",
          "Thu, 12 Jan 2017 17:26:46 GMT",
        ]
        );

      nock("https://route53.amazonaws.com:443", {
        "encodedQueryParams": true,
      })
        .post("/2013-04-01/hostedzone/Z3M3AYV9KKG4AK/rrset/")
        .reply(200, "<?xml version=\"1.0\"?>\n<ChangeResourceRecordSetsResponse xmlns=\"https://route53.amazonaws.com/doc/2013-04-01/\"><ChangeInfo><Id>/change/C3BYWILBV9185Z</Id><Status>PENDING</Status><SubmittedAt>2017-01-12T17:26:46.516Z</SubmittedAt></ChangeInfo></ChangeResourceRecordSetsResponse>", [
          "x-amzn-RequestId",
          "4b135b26-d8ec-11e6-848d-d96497850936",
          "Content-Type",
          "text/xml",
          "Content-Length",
          "276",
          "Date",
          "Thu, 12 Jan 2017 17:26:46 GMT",
        ]
        );

      return awsClient.addRecord({
        "name": "motorworld",
        "type": "CNAME",
        "ttl": 3600,
        "values": ["asdf.amazonaws.com"]
      }).then(response => response.ChangeInfo.Id.should.equal("/change/C3BYWILBV9185Z"));
    });
  });

  describe("#removeRecord()", function() {
    it("should call the AWS SDK Route53 method", function() {

      nock("https://route53.amazonaws.com:443", {
        "encodedQueryParams": true,
      })
        .get("/2013-04-01/hostedzonesbyname")
        .query({
          "dnsname": "skuid.eu",
        })
        .reply(200, "<?xml version=\"1.0\"?>\n<ListHostedZonesByNameResponse xmlns=\"https://route53.amazonaws.com/doc/2013-04-01/\"><HostedZones><HostedZone><Id>/hostedzone/Z3M3AYV9KKG4AK</Id><Name>skuid.eu.</Name><CallerReference>RISWorkflow-aa29316118d68e0a0fd3e45f9c71efff</CallerReference><Config><Comment>HostedZone created by Route53 Registrar</Comment><PrivateZone>false</PrivateZone></Config><ResourceRecordSetCount>2</ResourceRecordSetCount></HostedZone></HostedZones><DNSName>skuid.eu</DNSName><IsTruncated>false</IsTruncated><MaxItems>100</MaxItems></ListHostedZonesByNameResponse>", [
          "x-amzn-RequestId",
          "4afa7c44-d8ec-11e6-9733-5dfc9ad61f2e",
          "Content-Type",
          "text/xml",
          "Content-Length",
          "567",
          "Date",
          "Thu, 12 Jan 2017 17:26:46 GMT",
        ]
        );

      nock("https://route53.amazonaws.com:443", {
        "encodedQueryParams": true,
      })
        .post("/2013-04-01/hostedzone/Z3M3AYV9KKG4AK/rrset/")
        .reply(200, "<?xml version=\"1.0\"?>\n<ChangeResourceRecordSetsResponse xmlns=\"https://route53.amazonaws.com/doc/2013-04-01/\"><ChangeInfo><Id>/change/C3BYWILBV9185Z</Id><Status>PENDING</Status><SubmittedAt>2017-01-12T17:26:46.516Z</SubmittedAt></ChangeInfo></ChangeResourceRecordSetsResponse>", [
          "x-amzn-RequestId",
          "4b135b26-d8ec-11e6-848d-d96497850936",
          "Content-Type",
          "text/xml",
          "Content-Length",
          "276",
          "Date",
          "Thu, 12 Jan 2017 17:26:46 GMT",
        ]
        );

      return awsClient.removeRecord({
        "name": "motorworld",
        "values": ["asdf.amazonaws.com"]
      }).then(response => response.ChangeInfo.Id.should.equal("/change/C3BYWILBV9185Z"));
    });
  });
});