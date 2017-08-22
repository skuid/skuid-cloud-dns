Skuid Cloud DNS Adapter
----

[![Build Status](https://overwatch.skuid.ink/api/badges/skuid/skuid-cloud-dns/status.svg)](https://overwatch.skuid.ink/skuid/skuid-cloud-dns)

Public API:

Instance Methods on Platform Specific handler:
- addRecord
- removeRecord
- isHostnameAvailable

Static Methods on the library import:

```
const cloudDns = require('skuid-cloud-dns')
let awsDns = cloudDns.getClient('aws', 'skuidsite.com')

awsDns.addRecord({
  'name': 'org',
  'ttl': 3600,
  'type': 'CNAME',
  'values': ['127.0.0.1']
})
```

Route53 tested working.

Arguments to add and remove record methods
