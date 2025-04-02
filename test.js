import crypto from 'crypto';
import Dispatcher from './dispatcher.js';
import 'dotenv/config';
import {getContinentCountryCode, getCountryCode } from "./geoip.js";

/**
 * @param {string} uri - The request URI("/protected/file.txt")
 * @param {string} clientIp - Client IP
 * @param {number} expires - Expire timestamp (seconds)
 * @param {string} secret - Secret key
 */
function generateSecureLink(uri, clientIp, expires, secret = "666666") {
    // 计算MD5哈希 (格式: secret + clientIp + expires + uri)
    const hashInput = `${secret}${clientIp}${expires}${uri}`;
    const binaryHash = crypto.createHash('md5').update(hashInput).digest();
    var base64Value = (new Buffer.from(binaryHash).toString('base64')).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return `${uri}?md5=${base64Value}&expires=${expires}`;
}

// Example
const uri = "/live/sintel/index.m3u8";
const clientIp = "168.138.161.76"; // The client public ip
const expires = Math.floor(Date.now() / 1000) + 3600; // Expire in one hour

const url = generateSecureLink(uri, clientIp, expires);
console.log("Secure Link:", url);

const edge1 = { id: 0, url: 'http://meshifysg-monitorone-yb5ptd-7d381a-43-160-207-98.traefik.me' };
const edge2 = { id: 1, url: 'http://meshifysg-monitortwo-3gp1nq-4545eb-43-165-2-47.traefik.me' };
const edge3 = { id: 2, url: 'http://meshifysg-monitorthree-syshqs-24c86f-43-165-2-47.traefik.me' };

const dispatch = new Dispatcher([edge1, edge2, edge3], {

})

// dispatch.fetchServerStatus();
// setInterval(() => {
//     console.warn(dispatch.selectServer())
// }, 8000)

console.warn(getCountryCode('168.138.161.76'));
console.warn(getContinentCountryCode('168.138.161.76'));

