
export function withoutP2p (url) {
    return `
<!DOCTYPE html>
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
        #dplayer {
            width: 100vw;
            height: 56.25vw; /* 16:9 宽高比 */
            max-height: 100vh;
            max-width: 177.78vh; /* 防止在非常高的屏幕上过宽 */
        }
    </style>
</head>
<body>
    <div class="player-container">
        <div id="dplayer"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/dplayer@1.26.0/dist/DPlayer.min.js"></script>
    <script>
        // 检测移动端
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        const dp = new DPlayer({
            container: document.getElementById('dplayer'),
            live: true,
            autoplay: true,
            video: {
                url: '${url}',
            },
            mobile: {
                autoplay: isMobile, // 移动端可能限制自动播放
                click: true, // 允许点击播放/暂停
                theme: '#ff4e4e', // 主题色
                lock: false // 不锁定横屏
            }
        });

        // 处理横竖屏变化
        window.addEventListener('orientationchange', function() {
            setTimeout(() => dp.resize(), 300);
        });

        // 处理全屏变化
        dp.on('fullscreen', function() {
            setTimeout(() => dp.resize(), 300);
        });
    </script>
</body>
</html>
    `;
}

export function withP2p (url, zone, token) {
    return `
<!DOCTYPE html>
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
        #dplayer {
            width: 100vw;
            height: 56.25vw; /* 16:9 宽高比 */
            max-height: 100vh;
            max-width: 177.78vh; /* 防止在非常高的屏幕上过宽 */
        }
    </style>
</head>
<body>
    <div class="player-container">
        <div id="dplayer"></div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/@swarmcloud/hls/hls.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dplayer@1.26.0/dist/DPlayer.min.js"></script>
    <script>
        // 检测移动端
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        var p2pConfig = {
            live: true,
            trackerZone: '${zone}',
            token: '${token || ''}',
        }
        const dp = new DPlayer({
            container: document.getElementById('dplayer'),
            live: true,
            autoplay: true,
            video: {
                url: '${url}',
            },
            mobile: {
                autoplay: isMobile, // 移动端可能限制自动播放
                click: true, // 允许点击播放/暂停
                theme: '#ff4e4e', // 主题色
                lock: false // 不锁定横屏
            },
            type: 'customHls',
            customType: {
                'customHls': function (video, player) {
                    const hls = new Hls({
                        debug: false,
                        // Other hlsjsConfig options provided by hls.js
                        p2pConfig
                    });
                    hls.loadSource(video.src);
                    hls.attachMedia(video);
                }
            }
        });

        // 处理横竖屏变化
        window.addEventListener('orientationchange', function() {
            setTimeout(() => dp.resize(), 300);
        });

        // 处理全屏变化
        dp.on('fullscreen', function() {
            setTimeout(() => dp.resize(), 300);
        });
    </script>
</body>
</html>
    `;
}
