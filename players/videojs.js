
export function withoutP2p(url) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link href="https://cdn.jsdelivr.net/npm/video.js@8.18.1/dist/video-js.css" rel="stylesheet">
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
        /* 播放器容器（PC 端尽量全屏，移动端限制宽度） */
        #player-container {
            width: 100%;
            max-width: 100%; /* PC 端默认全屏 */
        }
        /* 播放器本身（固定 16:9 比例） */
        #my-video {
            width: 100%;
            aspect-ratio: 16 / 9; /* 16:9 宽高比 */
        }
        /* 移动端（宽度 < 768px）限制最大宽度 */
        @media (max-width: 768px) {
            #player-container {
                width: 100%;
                max-width: 100vw; /* 移动端占满屏幕宽度 */
            }
        }
        /* PC 端（宽度 >= 1024px）尽量全屏 */
        @media (min-width: 1024px) {
            #player-container {
                width: 100vw;
                height: 56.25vw; /* 16:9 高度 */
                max-height: 100vh;
            }
            #my-video {
                height: 100%;
            }
        }
    </style>
</head>
<body>
<!-- 播放器容器 -->
<div id="player-container">
    <video
            id="my-video"
            class="video-js vjs-default-skin"
            controls
            autoplay
            preload="auto"
            data-setup='{}'
    >
        <source src="${url}" type="application/x-mpegURL">
    </video>
</div>

<script src="https://cdn.jsdelivr.net/npm/video.js@8.18.1/dist/video.min.js"></script>

<script>
    // 初始化 Video.js
    const player = videojs('my-video', {
        controls: true,
        autoplay: true,
        fluid: false,
        responsive: true,
        playbackRates: [0.5, 1, 1.5, 2],
    });

    // 可选：监听窗口大小变化调整播放器
    window.addEventListener('resize', () => {
        player.width(document.getElementById('player-container').offsetWidth);
    });
</script>
</body>
</html>
    `
}

export function withP2p(url, zone, token) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link href="https://cdn.jsdelivr.net/npm/video.js@8.18.1/dist/video-js.css" rel="stylesheet">
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
        /* 播放器容器（PC 端尽量全屏，移动端限制宽度） */
        #player-container {
            width: 100%;
            max-width: 100%; /* PC 端默认全屏 */
        }
        /* 播放器本身（固定 16:9 比例） */
        #my-video {
            width: 100%;
            aspect-ratio: 16 / 9; /* 16:9 宽高比 */
        }
        /* 移动端（宽度 < 768px）限制最大宽度 */
        @media (max-width: 768px) {
            #player-container {
                width: 100%;
                max-width: 100vw; /* 移动端占满屏幕宽度 */
            }
        }
        /* PC 端（宽度 >= 1024px）尽量全屏 */
        @media (min-width: 1024px) {
            #player-container {
                width: 100vw;
                height: 56.25vw; /* 16:9 高度 */
                max-height: 100vh;
            }
            #my-video {
                height: 100%;
            }
        }
    </style>
</head>
<body>
<!-- 播放器容器 -->
<div id="player-container">
    <video
            id="my-video"
            class="video-js vjs-default-skin"
            controls
            autoplay
            preload="auto"
            data-setup='{}'
    >
    </video>
</div>

<script src="https://cdn.jsdelivr.net/npm/video.js@8.18.1/dist/video.min.js"></script>
<!-- p2p-plugin -->
<script src="https://cdn.jsdelivr.net/npm/@swarmcloud/vhs"></script>
<script>
    // 初始化 Video.js
    const player = videojs('my-video', {
        controls: true,
        autoplay: true,
        fluid: false,
        responsive: true,
        playbackRates: [0.5, 1, 1.5, 2],
        html5: {
            vhs: {
                overrideNative: true,         // Enable p2p if the platform supports Media Source Extensions
                experimentalUseMMS: true
            },
        }
    });
    var engine;
    player.on('xhr-hooks-ready', () => {
        if (engine) {
            engine.destroy();
        }
        engine = new P2PEngineVHS(player, {
            trackerZone: '${zone}',
            token: '${token || ''}',
        })
    });

    player.src('${url}')   // live
    player.play();

    window.addEventListener('resize', () => {
        player.width(document.getElementById('player-container').offsetWidth);
    });
</script>
</body>
</html>
    `
}
