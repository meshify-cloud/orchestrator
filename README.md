
## Playlist Server
This server can make sub-playlist redirect to do load balance among edge servers.

## Environment Variable
| Field     | Description              | Require  | Default |
| --------- | ------------------------ | -------- | ------- |
| ORIGIN    | The url of origin server | Yes      | -       |
| PORT      | The http server port     | No       | 80      |
| LOG_LEVEL | debug, info, warn, error | No       | 'warn'  |
| LOG_FILE  | debug, info, warn, error | No       | false   |
| EDGE_SERVERS | The array of edge server url | No       | []    |
| EDGE_WEIGHTS | The array of edge server weight | No       | []    |
| EDGE_MONITORS | The array of edge monitor ip:port | No       | []    |
| ALLOW_ORIGIN | Value for Access-Control-Allow-Origin | No       | '*'  |
| ALLOW_COUNTRIES | The array of Country ISO code that allowed to access | No       | []  |
| ALLOW_REFERERS | The array of referrer that allowed to access | No   | []   |
| SECURE_LINK_SECRET | the secure link secret | No |  ''  |
| COUNTRY_DB | The path to geolite2 country mmdb | No |  ''  |
| MONITOR_UPDATE_INTERVAL | Time interval for update monitor metrics | No |  15000  |
| P2P_TRACKER_ZONE | The tracker zone of P2P SDK | No |  ''  |
| P2P_TOKEN |  The token of P2P SDK | No |  ''  |
