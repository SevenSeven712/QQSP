// ===================================================
//  jiekou.js - 七七视频解析 · 接口数据文件
//  接口网址已使用 Base64 编码隐藏，运行时自动解码
//  修改接口：编辑下方数组，url 字段为 Base64 编码后的字符串
//  如需修改或新增接口，请先将真实网址进行 Base64 编码后填入
// ===================================================

(function() {
    // 原始接口数据（url 已编码）
    var encodedInterfaces = [
        {
            id: 'search',
            name: '搜索专用',
            url: 'aHR0cHM6Ly96MS4xOTAwMDAwMDAwMDcudG9wLz9qeA==',
            icon: 'fa-search',
            badge: '推荐',
            disabled: false
        },
        {
            id: 'play3m8u',
            name: 'play3m8u',
            url: 'aHR0cHM6Ly93d3cucGxheW0zdTguY24vamlleGkucGhwP3VybD0=',
            icon: 'fa-play',
            badge: '高速',
            disabled: false
        },
        {
            id: 'bilibili',
            name: 'B站',
            url: 'aHR0cHM6Ly9qeC5qc29ucGxheWVyLmNvbS9wbGF5ZXIvP3VybD0=',
            icon: 'fa-bilibili',
            badge: '专用',
            disabled: false
        },
        {
            id: '8090',
            name: '8090',
            url: 'aHR0cHM6Ly93d3cuODA5MGcuY24vP3VybD0=',
            icon: 'fa-globe',
            badge: '稳定',
            disabled: false
        },
        {
            id: 'aidou',
            name: '爱豆',
            url: 'aHR0cHM6Ly9qeC5haWRvdWVyLm5ldC8/dXJsPQ==',
            icon: 'fa-heart',
            badge: '好用',
            disabled: false
        },
        {
            id: 'qianqi',
            name: 'qianqi',
            url: 'aHR0cHM6Ly9hcGkucWlhbnFpLm5ldC92aXAvP3VybD0=',
            icon: 'fa-diamond',
            badge: 'VIP',
            disabled: false
        },
        {
            id: 'm1907',
            name: 'm1907',
            url: 'aHR0cHM6Ly9pbTE5MDcudG9wLz9qeD0=',
            icon: 'fa-film',
            badge: '备用',
            disabled: false
        }
    ];

    // 解码函数：将 Base64 字符串还原为真实网址
    function decodeUrl(encoded) {
        try {
            return atob(encoded);
        } catch (e) {
            console.error('接口地址解码失败：', encoded);
            return '';
        }
    }


    window.QQ_INTERFACES = encodedInterfaces.map(function(item) {
        return {
            id: item.id,
            name: item.name,
            url: decodeUrl(item.url),
            icon: item.icon,
            badge: item.badge,
            disabled: item.disabled
        };
    });
})();