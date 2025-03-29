import crypto from 'crypto';

/**
 * 生成 Nginx secure_link 访问令牌
 * @param {string} uri - 请求的URI路径 (例如 "/protected/file.txt")
 * @param {string} clientIp - 客户端IP (必须与Nginx收到的$remote_addr一致)
 * @param {number} expires - 过期时间戳 (秒级, 例如当前时间 + 3600)
 * @param {string} secret - 密钥 (需与Nginx配置中的"666666"一致)
 * @returns {string} 返回完整URL (包含md5和expires参数)
 */
function generateSecureLink(uri, clientIp, expires, secret = "666666") {
    // 计算MD5哈希 (格式: secret + clientIp + expires + uri)
    const hashInput = `${secret}${clientIp}${expires}${uri}`;
    const binaryHash = crypto.createHash('md5').update(hashInput).digest();
    var base64Value = (new Buffer.from(binaryHash).toString('base64')).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    // 返回带参数的URL
    return `${uri}?md5=${base64Value}&expires=${expires}`;
}

// 示例使用
const uri = "/live/sintel/index.m3u8";
const clientIp = "168.138.161.76"; // 必须与Nginx收到的$remote_addr一致
const expires = Math.floor(Date.now() / 1000) + 3600; // 1小时后过期

const url = generateSecureLink(uri, clientIp, expires);
console.log("生成的Secure Link:", url);
