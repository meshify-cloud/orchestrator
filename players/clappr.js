
export function withoutP2p (url) {
    return `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        #player-wrapper {
            width: 100%;
            aspect-ratio: 16 / 9; /* 固定 16:9 比例 */
        }
        /* PC 端（宽度 >= 1024px）全屏 */
        @media (min-width: 1024px) {
            #player-wrapper {
                width: 100vw;
                height: 56.25vw; /* 16:9 高度计算 (100 * 9/16) */
                max-height: 100vh;
                max-width: 177.78vh; /* 防止在超宽屏幕上拉伸 */
            }
        }
        /* 移动端（宽度 < 1024px）居中，宽度限制 */
        @media (max-width: 1023px) {
            #player-wrapper {
                width: 100%;
                max-width: 800px; /* 移动端最大宽度 */
            }
        }
    </style>
</head>
<body>
<div id="player-wrapper"></div>

<script src="//cdn.jsdelivr.net/npm/@clappr/player@0.11.3/dist/clappr.min.js"></script>

<script>
    // 初始化 Clappr 播放器
    const player = new Clappr.Player({
        parentId: "#player-wrapper",
        source: "${url}",
        autoPlay: true,
        height: "100%",
        width: "100%",
        // 可选：自定义 UI 或控制栏
        mediacontrol: {
            seekbar: "#E62117", // 进度条颜色
            buttons: "#FFFFFF", // 按钮颜色
        },
        // 启用全屏按钮（PC 端可手动全屏）
        enableFullscreen: true,
    });
</script>
</body>
</html>
    `
}

export function withP2p (url, zone, token) {
    return `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        #player-wrapper {
            width: 100%;
            aspect-ratio: 16 / 9; /* 固定 16:9 比例 */
        }
        /* PC 端（宽度 >= 1024px）全屏 */
        @media (min-width: 1024px) {
            #player-wrapper {
                width: 100vw;
                height: 56.25vw; /* 16:9 高度计算 (100 * 9/16) */
                max-height: 100vh;
                max-width: 177.78vh; /* 防止在超宽屏幕上拉伸 */
            }
        }
        /* 移动端（宽度 < 1024px）居中，宽度限制 */
        @media (max-width: 1023px) {
            #player-wrapper {
                width: 100%;
                max-width: 800px; /* 移动端最大宽度 */
            }
        }
    </style>
</head>
<body>
<div id="player-wrapper"></div>

<script src="//cdn.jsdelivr.net/npm/@clappr/player@0.11.3/dist/clappr.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/@swarmcloud/hls/p2p-engine.min.js"></script>
<script>
    var p2pConfig = {
        live: true,
        trackerZone: '${zone}',
        token: '${token || ''}',
    }
    // 初始化 Clappr 播放器
    const player = new Clappr.Player({
        parentId: "#player-wrapper",
        autoPlay: true,
        height: "100%",
        width: "100%",
        // 可选：自定义 UI 或控制栏
        mediacontrol: {
            seekbar: "#E62117", // 进度条颜色
            buttons: "#FFFFFF", // 按钮颜色
        },
        // 启用全屏按钮（PC 端可手动全屏）
        enableFullscreen: true,
    });
    player.load({source: "${url}"});
    p2pConfig.hlsjsInstance = player.core.getCurrentPlayback()?._hls;
    var engine = new P2PEngineHls(p2pConfig);
</script>
</body>
</html>
    `
}
