import { withP2p as dplayerP, withoutP2p as dplayer } from './dplayer.js';
import { withP2p as videojsP, withoutP2p as videojs } from './videojs.js';
import { withP2p as clapprP, withoutP2p as clappr } from './clappr.js';

export function getPlayerCode(zone, token) {
    return (res, req) => {
        res.writeHeader('Content-Type', 'text/html; charset=utf-8');
        const player = req.getParameter(0);
        const urlEncoded = req.getParameter(1);
        if (!urlEncoded || !player) {
            res.writeStatus('404').end();
            return
        }
        const playLink = Buffer.from(urlEncoded, 'base64').toString('utf-8');
        let content;
        if (player === 'dplayer') {
            content = zone ? dplayerP(playLink, zone, token) : dplayer(playLink);
        } else if (player === 'videojs') {
            content = zone ? videojsP(playLink, zone, token) : videojs(playLink);
        } else if (player === 'clappr') {
            content = zone ? clapprP(playLink, zone, token) : clappr(playLink);
        } else {
            res.writeStatus('404').end();
            return
        }
        res.end(content);
    }
}
