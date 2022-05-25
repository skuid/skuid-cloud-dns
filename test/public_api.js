"use strict";

const Path = require("path");
const nock = require('nock');
const should = require('chai').should();

const dnsHandler = require('../index')

process.env.CLOUDFLARE_EMAIL = 'ops@skuid.com';
process.env.CLOUDFLARE_API_KEY = 'key';

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

  describe('#getClient({"platform": "cloudflare", "domain": "skuid.eu"})', function() {
    var cfClient = dnsHandler.getClient({'platform': 'cloudflare', 'domain': 'skuid.eu'});
    it('should return a handler bound to the correct domain', function(done){
      cfClient.should.have.property('domain');
      cfClient.domain.should.equal('skuid.eu');
      done();
    });

    it('should bind to the correct Cloud Provider', function(done) {
      cfClient._cf.should.have.property('zones');
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

describe("cloudflare Public API", function() {

  let cfClient = dnsHandler.getClient({'platform': 'cloudflare', 'domain': 'skuid.eu'});
  let zoneId = "023e105f4ecef8ad9ca31a8372d0c353";
  let recordId = "372e67954025e0ba6aaa6d586b9e0b59";
  let zoneReply = `{
    "success": true,
    "errors": [],
    "messages": [],
    "result": [
      {
        "id": "${zoneId}",
        "name": "example.com",
        "development_mode": 7200,
        "original_name_servers": [
          "ns1.originaldnshost.com",
          "ns2.originaldnshost.com"
        ],
        "original_registrar": "GoDaddy",
        "original_dnshost": "NameCheap",
        "created_on": "2014-01-01T05:20:00.12345Z",
        "modified_on": "2014-01-01T05:20:00.12345Z",
        "activated_on": "2014-01-02T00:01:00.12345Z",
        "owner": {
          "id": {},
          "email": {},
          "type": "user"
        },
        "account": {
          "id": "01a7362d577a6c3019a474fd6f485823",
          "name": "Demo Account"
        },
        "permissions": [
          "#zone:read",
          "#zone:edit"
        ],
        "plan": {
          "id": "e592fd9519420ba7405e1307bff33214",
          "name": "Pro Plan",
          "price": 20,
          "currency": "USD",
          "frequency": "monthly",
          "legacy_id": "pro",
          "is_subscribed": true,
          "can_subscribe": true
        },
        "plan_pending": {
          "id": "e592fd9519420ba7405e1307bff33214",
          "name": "Pro Plan",
          "price": 20,
          "currency": "USD",
          "frequency": "monthly",
          "legacy_id": "pro",
          "is_subscribed": true,
          "can_subscribe": true
        },
        "status": "active",
        "paused": false,
        "type": "full",
        "name_servers": [
          "tony.ns.cloudflare.com",
          "woz.ns.cloudflare.com"
        ]
      }
    ]
  }`;

  describe("#isHostnameAvailable()", function() {
    it("should fail when the subdomain is in use", async function() {

      nock("https://api.cloudflare.com", {
        "encodedQueryParams": true,
      })
        .get("/client/v4/zones")
        .query(true)
        .reply(200, zoneReply);
    
      nock("https://api.cloudflare.com", {
        "encodedQueryParams": true,
      })
        .get(`/client/v4/zones/${zoneId}/dns_records`)
        .query(true)
        .reply(200, `{
          "success": true,
          "errors": [],
          "messages": [],
          "result": [
            {
              "id": "${recordId}",
              "type": "A",
              "name": "motorworld.com",
              "content": "198.51.100.4",
              "proxiable": true,
              "proxied": false,
              "ttl": 3600,
              "locked": false,
              "zone_id": "023e105f4ecef8ad9ca31a8372d0c353",
              "zone_name": "motorworld.com",
              "created_on": "2014-01-01T05:20:00.12345Z",
              "modified_on": "2014-01-01T05:20:00.12345Z",
              "data": {},
              "meta": {
                "auto_added": true,
                "source": "primary"
              }
            }
          ]
        }`);
  
      let response = await cfClient.isHostnameAvailable("motorworld.com")
      response.should.be.false;
    });

    it("should pass when the subdomain is in not in use", async function() {
      nock("https://api.cloudflare.com", {
        "encodedQueryParams": true,
      })
        .get("/client/v4/zones")
        .query(true)
        .reply(200, zoneReply);
  
      nock("https://api.cloudflare.com", {
        "encodedQueryParams": true,
      })
        .get(`/client/v4/zones/${zoneId}/dns_records`)
        .query(true)
        .reply(200, `{
          "success": true,
          "errors": [],
          "messages": [],
          "result": []
        }`);
  
      let response = await cfClient.isHostnameAvailable("motorworld.com")
      response.should.be.true;
    });
  });

  describe("#addRecord()", function() {
    it("should call the Cloudflare DNS record add method", async function() {

      nock("https://api.cloudflare.com", {
        "encodedQueryParams": true,
      })
        .get("/client/v4/zones")
        .query(true)
        .reply(200, zoneReply);

      nock("https://api.cloudflare.com", {
        "encodedQueryParams": true,
      })
        .post(`/client/v4/zones/${zoneId}/dns_records`)
        .reply(200, `{
          "success": true,
          "errors": [],
          "messages": [],
          "result": {
            "id": "${recordId}",
            "type": "A",
            "name": "motorworld.com",
            "content": "198.51.100.4",
            "proxiable": true,
            "proxied": false,
            "ttl": 3600,
            "locked": false,
            "zone_id": "023e105f4ecef8ad9ca31a8372d0c353",
            "zone_name": "motorworld.com",
            "created_on": "2014-01-01T05:20:00.12345Z",
            "modified_on": "2014-01-01T05:20:00.12345Z",
            "data": {},
            "meta": {
              "auto_added": true,
              "source": "primary"
            }
          }
        }`);

      let response = await cfClient.addRecord({
        "name": "motorworld.com",
        "type": "CNAME",
        "ttl": 3600,
        "values": ["asdf.cloudflare.com"]
      });
      response.success.should.equal(true);
      response.result.id.should.equal(recordId);
    });
  });

  describe("#removeRecord()", function() {
    it("should call the Cloudflare DNS record delete method", async function() {

      nock("https://api.cloudflare.com", {
        "encodedQueryParams": true,
      })
        .get("/client/v4/zones")
        .query(true)
        .reply(200, zoneReply);

      nock("https://api.cloudflare.com", {
        "encodedQueryParams": true,
      })
        .get(`/client/v4/zones/${zoneId}/dns_records`)
        .query(true)
        .reply(200, `{
          "success": true,
          "errors": [],
          "messages": [],
          "result": [
            {
              "id": "${recordId}",
              "type": "A",
              "name": "motorworld.com",
              "content": "198.51.100.4",
              "proxiable": true,
              "proxied": false,
              "ttl": 3600,
              "locked": false,
              "zone_id": "${zoneId}",
              "zone_name": "motorworld.com",
              "created_on": "2014-01-01T05:20:00.12345Z",
              "modified_on": "2014-01-01T05:20:00.12345Z",
              "data": {},
              "meta": {
                "auto_added": true,
                "source": "primary"
              }
            }
          ]
        }`);

      nock("https://api.cloudflare.com", {
        "encodedQueryParams": true,
      })
        .delete(`/client/v4/zones/${zoneId}/dns_records/${recordId}`)
        .reply(200, `{
          "result": {
            "id": "${recordId}"
          }
        }`);

      let response = await cfClient.removeRecord({
        "name": "motorworld.com",
        "values": ["asdf.amazonaws.com"]
      });
      response.result.id.should.equal(recordId);
    });
  });
});