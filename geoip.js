import { Reader } from 'maxmind';
import * as fs from "fs";

let lookup;
let available = false;
const geolite2CountryDB = process.env.COUNTRY_DB;
if (geolite2CountryDB && fs.existsSync(geolite2CountryDB)) {
    const buffer = fs.readFileSync(geolite2CountryDB);
    lookup = new Reader(buffer);
    available = true;
}

function getCountryCode(ip) {
    if (!available) return null;
    const result = lookup.get(ip);
    return result?.country?.iso_code
}

function getContinentCountryCode(ip) {
    if (!available) return null;
    const result = lookup.get(ip);
    const country = result?.country?.iso_code;
    const continent = result?.continent?.code;
    if (!country || !continent) return null;
    return {
        country,
        continent,
    }
}

export {
    lookup,
    available,
    getCountryCode,
    getContinentCountryCode,
};

