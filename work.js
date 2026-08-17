// ===================================================
//  work.js - 七七视频解析 · 任务模式
//  观看视频累计达到指定分钟数即可解锁对应接口
//  支持邀请码解锁所有任务接口
//  ------------------------------------------------
//  修改解锁时间：编辑下方 window.QQ_TASKS 数组中的 unlockMinutes
//  数值单位：分钟（可以是小数，例如 5.5 表示 5分30秒）
//  任务判定基于 id，修改接口名称不影响解锁
//  第一个任务建议为 0 分钟（默认解锁）
// ===================================================

(function () {
    // ========== 任务配置（修改这里） ==========
    window.QQ_TASKS = [
        { id: 'search',    name: '搜索专用',   unlockMinutes: 0 },      // 默认解锁
        { id: 'play3m8u',  name: 'play3m8u',  unlockMinutes: 60 },     // 60分钟解锁
        { id: 'bilibili',  name: 'B站',       unlockMinutes: 20 },     // 20分钟解锁
        { id: '8090',     name: '8090',      unlockMinutes: 60 },     // 60分钟解锁
        { id: 'aidou',    name: '爱豆',      unlockMinutes: 60 },     // 60分钟解锁
        { id: 'qianqi',   name: 'qianqi',    unlockMinutes: 20 },     // 20分钟解锁
        { id: 'm1907',    name: 'm1907',     unlockMinutes: 60 }      // 60分钟解锁
    ];
    // ==========================================

    const STORAGE_KEY_WATCH = 'qq_watch_time_mobile';
    const STORAGE_KEY_UNLOCKED = 'qq_unlocked_interfaces_mobile';
    const STORAGE_KEY_HISTORY = 'qq_watch_history_mobile';
    const STORAGE_KEY_ALL_UNLOCKED = 'qq_all_unlocked_mobile';

    // ---------- 本地存储辅助 ----------
    function getWatchTime() {
        return parseFloat(localStorage.getItem(STORAGE_KEY_WATCH) || '0');
    }
    function setWatchTime(minutes) {
        localStorage.setItem(STORAGE_KEY_WATCH, minutes.toString());
    }
    function getUnlockedList() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY_UNLOCKED) || '[]');
        } catch (e) {
            return [];
        }
    }
    function setUnlockedList(arr) {
        localStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(arr));
    }
    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
        } catch (e) {
            return [];
        }
    }
    function setHistory(arr) {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(arr));
    }

    // ---------- 默认解锁第一个接口 ----------
    function ensureDefaultUnlocked() {
        const unlocked = getUnlockedList();
        const firstTask = window.QQ_TASKS[0];
        if (firstTask && !unlocked.includes(firstTask.id)) {
            unlocked.push(firstTask.id);
            setUnlockedList(unlocked);
        }
    }
    ensureDefaultUnlocked();

    // ---------- 任务查询 ----------
    function getTask(id) {
        return window.QQ_TASKS.find(t => t.id === id);
    }
    function isUnlocked(id) {
        // 如果邀请了全部解锁，则所有任务接口均视为解锁
        if (localStorage.getItem(STORAGE_KEY_ALL_UNLOCKED) === 'true') {
            return true;
        }
        return getUnlockedList().includes(id);
    }
    function getRequiredMinutes(id) {
        const task = getTask(id);
        return task ? task.unlockMinutes : Infinity;
    }

    // ---------- 观看计时 ----------
    let watchStartTime = null;

    function startWatch() {
        if (watchStartTime === null) {
            watchStartTime = Date.now();
        }
    }

    function stopWatch() {
        if (watchStartTime !== null) {
            const elapsedMinutes = (Date.now() - watchStartTime) / 60000;
            watchStartTime = null;
            if (elapsedMinutes > 0) {
                return addWatchTime(elapsedMinutes);
            }
        }
        return getWatchTime();
    }

    // ---------- 累计观看时间并检查解锁 ----------
    function addWatchTime(minutes) {
        const current = getWatchTime();
        const newTime = current + minutes;
        setWatchTime(newTime);
        checkUnlocks();
        return newTime;
    }

    function checkUnlocks() {
        const watchTime = getWatchTime();
        const unlocked = getUnlockedList();
        let changed = false;

        window.QQ_TASKS.forEach(task => {
            if (task.unlockMinutes > 0 && watchTime >= task.unlockMinutes && !unlocked.includes(task.id)) {
                unlocked.push(task.id);
                changed = true;
            }
        });

        if (changed) {
            setUnlockedList(unlocked);
        }

        document.dispatchEvent(new CustomEvent('task-progress-updated'));
        return unlocked;
    }

    function getNextLocked() {
        // 如果全部解锁，则返回 null
        if (localStorage.getItem(STORAGE_KEY_ALL_UNLOCKED) === 'true') {
            return null;
        }
        const unlocked = getUnlockedList();
        for (let task of window.QQ_TASKS) {
            if (!unlocked.includes(task.id)) {
                return task;
            }
        }
        return null;
    }

    // ---------- 历史记录 ----------
    function addHistory(record) {
        const history = getHistory();
        const filtered = history.filter(item => item.url !== record.url);
        filtered.unshift({
            id: record.id,
            name: record.name,
            url: record.url,
            time: new Date().toLocaleString()
        });
        if (filtered.length > 20) filtered.pop();
        setHistory(filtered);
        document.dispatchEvent(new CustomEvent('history-updated'));
    }

    function clearHistory() {
        localStorage.removeItem(STORAGE_KEY_HISTORY);
        document.dispatchEvent(new CustomEvent('history-updated'));
    }

    // ---------- 邀请码解锁所有接口 ----------
    function unlockAllInterfaces() {
        // 解锁所有任务接口（忽略解锁分钟数）
        const allTaskIds = window.QQ_TASKS.map(t => t.id);
        setUnlockedList(allTaskIds);
        // 设置全部解锁标记
        localStorage.setItem(STORAGE_KEY_ALL_UNLOCKED, 'true');
        document.dispatchEvent(new CustomEvent('task-progress-updated'));
    }

    // 重置全部解锁（用于退出邀请码状态）
    function resetAllUnlocked() {
        localStorage.removeItem(STORAGE_KEY_ALL_UNLOCKED);
        // 恢复根据观看时间解锁的状态
        checkUnlocks();
        document.dispatchEvent(new CustomEvent('task-progress-updated'));
    }

    // ---------- 调试 / 重置 ----------
    function resetProgress() {
        localStorage.removeItem(STORAGE_KEY_WATCH);
        localStorage.removeItem(STORAGE_KEY_UNLOCKED);
        localStorage.removeItem(STORAGE_KEY_HISTORY);
        localStorage.removeItem(STORAGE_KEY_ALL_UNLOCKED);
        ensureDefaultUnlocked();
        document.dispatchEvent(new CustomEvent('task-progress-updated'));
        document.dispatchEvent(new CustomEvent('history-updated'));
    }

    // ---------- 暴露全局 API ----------
    window.QQ_TASK_API = {
        isUnlocked,
        getRequiredMinutes,
        getCurrentWatchTime: getWatchTime,
        startWatch,
        stopWatch,
        addWatchTime,
        checkUnlocks,
        getNextLocked,
        resetProgress,
        tasks: window.QQ_TASKS,
        addHistory,
        clearHistory,
        getHistory,
        getUnlockedList,
        unlockAllInterfaces,
        resetAllUnlocked
    };
})();