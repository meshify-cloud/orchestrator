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

export {
    lookup,
    available,
};

