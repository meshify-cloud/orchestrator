import { getContinentCountryCode } from "./geoip.js";

export class GeoLookup {
    constructor() {
        this.countryMap = new Map();   // country -> edges
        this.continentMap = new Map();   // continent -> edges
    }

    matchEdges(clientIp) {
        const result = getContinentCountryCode(clientIp);
        if (!result) return [];
        const { country, continent } = result;
        let edges = this.countryMap.get(country);
        if (edges && edges.length > 0) {
            // console.warn(`match country`)
            return edges
        }
        edges = this.continentMap.get(continent);
        if (edges && edges.length > 0) {
            // console.warn(`match continent`)
            return edges
        }
        return []
    }

    lookupEdge(server) {
        const { id, monitorHost } = server;
        const ip = monitorHost.split(':')[0];
        const result = getContinentCountryCode(ip);
        if (result) {
            const { country, continent } = result;
            let edges = this.countryMap.get(country);
            if (!edges) {
                edges = [];
            }
            edges.push(id);
            this.countryMap.set(country, edges);
            edges = this.continentMap.get(continent);
            if (!edges) {
                edges = [];
            }
            edges.push(id);
            this.continentMap.set(continent, edges);
        }
        // console.warn(this.countryMap)
        // console.warn(this.continentMap)
    }
}

class EdgeServer {
    constructor(id, url, monitorHost) {
        this.id = id;    // id是index
        this.url = url;
        this.monitorHost = monitorHost;
        this.weight = 100; // 初始权重
        this.online = false; // 初始状态
        this.cpuLoad = 0; // CPU负载 0-100
        this.lastUpdated = null; // 最后更新时间
    }

    updateStatus(online, cpuLoad) {
        this.online = online;
        this.cpuLoad = cpuLoad;
        this.lastUpdated = new Date();

        // 如果离线，权重设为0
        if (!online) {
            this.weight = 0;
            return;
        }

        if (cpuLoad >= 85) {
            this.weight = 0;
            return;
        }

        // 根据CPU负载调整权重
        // CPU负载越高，权重越低
        this.weight = Math.max(10, 100 - (cpuLoad * 1.25));
        // console.warn(`this.weight ${this.weight}`)
    }
}

export class Dispatcher {
    constructor(servers, options = {}) {
        // 初始化服务器列表
        this.servers = servers.map(server => new EdgeServer(server.id, server.url, server.monitorHost));
        // console.warn(this.servers)
        // 配置选项
        this.options = {
            updateInterval: 5000, // 10秒更新一次状态
            ...options
        };

        // 更新定时器
        this.updateTimer = null;

        this.geoLookup = options.geoLookup;

        if (this.geoLookup) {
            servers.forEach(server => {
                this.geoLookup.lookupEdge(server)
            })
        }

        // 初始化
        this.init();
    }

    async init() {
        // 初始状态更新
        await this.updateAllServerStatuses();

        // 启动定时更新
        this.startRegularUpdates();
    }

    // 开始定期更新
    startRegularUpdates() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        this.updateTimer = setInterval(
            () => this.updateAllServerStatuses(),
            this.options.updateInterval
        );
    }

    // 停止定期更新
    stopRegularUpdates() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    // 更新所有服务器状态
    async updateAllServerStatuses() {
        const updatePromises = this.servers.map(server =>
            {
                // console.warn(server)
                return this.fetchServerStatus(server)
                    .then(status => server.updateStatus(status.online, status.cpuLoad))
                    .catch(error => {
                        console.error(`Failed to update server ${server.id}:`, error);
                        server.updateStatus(false, 1); // 标记为离线
                    })
            }
        );

        await Promise.all(updatePromises);
        // console.log('Server statuses updated at', new Date());
    }

    // 模拟获取服务器状态 - 实际项目中替换为真实的API调用
    async fetchServerStatus(server) {
        // console.warn(server)
        // 这里应该是实际的API调用
        // 模拟实现:
        return new Promise((resolve) => {
            fetch(`http://${server.monitorHost}/metrics?limit=1`, {
                headers: {
                    'Authorization': `Bearer metrics`
                },
            }).then(response => {
                if (!response.ok) {
                    resolve({ online: false });
                }
                return response.json();
            }).then(data => {
                // console.log(data);
                let cpuLoad = data[data.length - 1].cpu;
                // if (server.id === 2) {
                //     cpuLoad = 90;
                // }
                // if (server.id === 1) {
                //     cpuLoad = 65;
                // }
                resolve({ online: true, cpuLoad });
            }).catch(error => {
                console.error(`fetch ${server.monitorHost} err: ${error}`)
                resolve({ online: false });
            });
        });
    }

    // 选择最优服务器
    selectServer(clientIp) {
        // 过滤掉权重为0的服务器
        let availableServers = this.servers.filter(server => server.weight > 0);

        if (this.geoLookup) {
            let availableEdges = this.geoLookup.matchEdges(clientIp);
            // console.warn(availableEdges)
            if (availableEdges.length > 0) {
                const availableServerIds = availableServers.map(server => server.id);
                availableEdges = availableEdges.filter(edgeId => availableServerIds.includes(edgeId));
                if (availableEdges.length > 0) {
                    availableServers = availableServers.filter(server => availableEdges.includes(server.id));
                }
            }

        }
        // console.warn(availableServers)
        if (availableServers.length === 0) {
            console.error('No available edge servers');
            return null
        }

        // 计算总权重
        const totalWeight = availableServers.reduce((sum, server) => sum + server.weight, 0);

        // 随机选择基于权重
        const randomValue = Math.random() * totalWeight;
        let selectedServer = null;
        let cumulativeWeight = 0;
        for (const server of availableServers) {
            cumulativeWeight += server.weight;
            if (randomValue < cumulativeWeight) {
                selectedServer = server;
                break;
            }
        }

        // 确保总是返回一个服务器
        selectedServer = selectedServer || availableServers[0];

        // console.log(`Selected server ${selectedServer.id} with weight ${selectedServer.weight}`);
        // console.log(availableServers);
        return selectedServer.url;
    }

    // 获取服务器状态快照
    getServerStatusSnapshot() {
        return this.servers.map(server => ({
            id: server.id,
            url: server.url,
            monitorHost: server.monitorHost,
            weight: server.weight,
            online: server.online,
            cpuLoad: server.cpuLoad,
            lastUpdated: server.lastUpdated
        }));
    }
}
