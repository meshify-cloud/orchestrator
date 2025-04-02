import Crypto from "crypto";
import crypto from "crypto";

export function setCorsHeaders(response, allowOrigin) {
    // You can change the below headers as they're just examples
    response.writeHeader("Access-Control-Allow-Origin", allowOrigin || "*");
    response.writeHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
}

export const getArrayFromEnv = (name) => {
    const arr = process.env[name] ? process.env[name].split(',') : [];
    return arr.map(item => item.trim())
}

export function verifyAuth(md5Str, expires, uri, clientIp, secret) {
    if (md5Str === undefined || expires === undefined) {
        return false;
    }
    if (expires < Math.floor(Date.now() / 1000)) {
        return false;
    }
    // console.warn(`secret ${secret} clientIp ${clientIp} expires ${expires} uri ${uri}`);
    const hashInput = `${secret}${clientIp}${expires}${uri}`;
    const binaryHash = crypto.createHash('md5').update(hashInput).digest();
    const base64Value = (new Buffer.from(binaryHash).toString('base64')).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return base64Value === md5Str
}

export function getRealIp(req, res) {
    return req.getHeader('x-real-ip') || req.getHeader('x-forwarded-for') || Buffer.from(res.getRemoteAddressAsText()).toString('utf-8');
}

export class WeightedLoadBalancer {
    constructor(servers) {
        // servers 格式: [{id: 0, weight: 5, url}, {id: 1, weight: 3, url}]
        this.servers = servers;
        this.totalWeight = servers.reduce((sum, server) => sum + server.weight, 0);
        // 初始化当前权重
        this.currentWeights = servers.map(server => ({
            id: server.id,
            url: server.url,
            weight: server.weight,
            currentWeight: 0
        }));
    }

    // 获取下一个服务器
    getNextServer() {
        // 1. 对于每个服务器，当前权重加上其权重
        this.currentWeights.forEach(server => {
            server.currentWeight += server.weight;
        });

        // 2. 选择当前权重最大的服务器
        let selectedServer = this.currentWeights[0];
        for (let i = 1; i < this.currentWeights.length; i++) {
            if (this.currentWeights[i].currentWeight > selectedServer.currentWeight) {
                selectedServer = this.currentWeights[i];
            }
        }

        // 3. 选中的服务器的当前权重减去总权重
        selectedServer.currentWeight -= this.totalWeight;

        return selectedServer;
    }

    getNextUrl() {
        return this.getNextServer().url
    }

    // 添加新服务器
    addServer(server) {
        this.servers.push(server);
        this.totalWeight += server.weight;
        this.currentWeights.push({
            id: server.id,
            url: server.url,
            weight: server.weight,
            currentWeight: 0
        });
    }

    // 移除服务器
    removeServer(serverName) {
        const index = this.currentWeights.findIndex(s => s.id === serverName);
        if (index !== -1) {
            this.totalWeight -= this.currentWeights[index].weight;
            this.currentWeights.splice(index, 1);
            this.servers.splice(index, 1);
        }
    }
}
