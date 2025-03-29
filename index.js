import createLogger from "./logger.js";
import { App } from "uWebSockets.js";
import {setCorsHeaders, WeightedLoadBalancer, getArrayFromEnv, verifyAuth, getRealIp} from "./utils.js";
import 'dotenv/config';
import { lookup, available } from "./geoip.js";

const logLevel = process.env.LOG_LEVEL;
const logFile = !!process.env.LOG_FILE;
const logger = createLogger(logLevel || 'warn', logFile);

const port = Number(process.env.PORT) || 80;
const origin = process.env.ORIGIN;
const edgeServers = getArrayFromEnv('EDGE_SERVERS');
const edgeWeights = getArrayFromEnv('EDGE_WEIGHTS');
const edgeMonitors = getArrayFromEnv('EDGE_MONITORS');
const allowOrigin = process.env.ALLOW_ORIGIN;
const allowCountries = getArrayFromEnv('ALLOW_COUNTRIES');
const secureLinkSecret = process.env.SECURE_LINK_SECRET;
const allowReferrers = getArrayFromEnv('ALLOW_REFERERS');

const originOnly = edgeServers.length === 0;
if (!origin) {
    throw new Error('origin is required');
}
if (edgeMonitors.length > 0 && edgeServers.length !== edgeMonitors.length) {
    throw new Error('EDGE_MONITORS length should be equal to EDGE_SERVERS length');
}
if (edgeWeights.length > 0 && edgeServers.length !== edgeWeights.length) {
    throw new Error('EDGE_WEIGHTS length should be equal to EDGE_SERVERS length');
}
const countryLimited = allowCountries.length > 0;
const allowCountrySet = new Set(allowCountries);

const edges = edgeServers.map((url, index) => {
    let weight = 1;
    if (edgeWeights.length > 0) {
        weight = edgeWeights[index];
    }
    return { url, weight, name: `edge${index}` }
})
const loadBalancer = new WeightedLoadBalancer(edges);

const app = App()
    .get('/*.m3u8', (res, req) => {
        if (allowReferrers.length > 0) {
            const referer = req.getHeader('referer')?.replace(/^[a-zA-Z]+:\/\//, '');
            if (!referer || allowReferrers.every(domain => !referer.startsWith(domain))) {
                res.writeStatus('403 Forbidden').end();
                return;
            }
        }
        const uri = req.getUrl();
        const query = req.getQuery();
        const clientIp = getRealIp(req, res);
        if (secureLinkSecret
            && !verifyAuth(req.getQuery('md5'), req.getQuery('expires'), uri,
                clientIp, secureLinkSecret)) {
            res.writeStatus('403 Forbidden').end();
            return;
        }
        if (countryLimited && available) {
            const result = lookup.get(clientIp);
            // console.warn(result)
            // console.warn(clientIp)
            const code = result?.country?.iso_code
            if (!code || !allowCountrySet.has(code)) {
                res.writeStatus('403 Forbidden').end();
                return;
            }
        }
        const host = originOnly ? origin : loadBalancer.getNextUrl();
        setCorsHeaders(res, allowOrigin);
        res.writeHeader('Content-Type', 'application/vnd.apple.mpegurl');
        // console.warn(server)
        const content = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=2000000
${host}${uri}${query ? `?${query}` : ''}
`
        res.end(content);
});

app.listen(port, (token) => {
    if (token) {
        logger.warn('Listening to port ' + port);
    } else {
        logger.error('Failed to listen to port ' + port);
    }
});

