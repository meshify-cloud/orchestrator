import { Reader } from 'maxmind';
import * as fs from "fs";

let lookup;
let available = false;
if (fs.existsSync('./GeoLite2-Country.mmdb')) {
    const buffer = fs.readFileSync('./GeoLite2-Country.mmdb');
    lookup = new Reader(buffer);
    available = true;
}

export {
    lookup,
    available,
};

