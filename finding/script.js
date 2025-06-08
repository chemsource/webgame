document.addEventListener('DOMContentLoaded', () => {
    const mazeContainer = document.getElementById('maze-container');
    const currentLevelEl = document.getElementById('current-level');
    const keysCountEl = document.getElementById('keys-count');
    const timeEl = document.getElementById('time');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const hintBtn = document.getElementById('hint-btn');
    
    // 游戏状态
    let gameRunning = false;
    let gamePaused = false;
    let gameTimer;
    let timeLeft = 60;
    let keysCollected = 0;
    let level = 1;
    let playerPos = { x: 1, y: 1 };
    let maze = [];
    
    // 初始化游戏
    initGame();
    
    // 事件监听器
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetGame);
    hintBtn.addEventListener('click', showHint);
    
    document.addEventListener('keydown', handleKeyPress);
    
    function initGame() {
        // 创建初始迷宫
        createMaze();
        
        // 重置游戏状态
        timeLeft = 60;
        keysCollected = 0;
        
        // 更新UI
        updateUI();
    }
    
    function createMaze() {
        mazeContainer.innerHTML = '';
        maze = [];
        
        // 迷宫尺寸 (随关卡增加)
        const size = 15;
        const walls = level * 3 + 15;
        
        // 初始化迷宫网格
        for (let y = 0; y < size; y++) {
            maze[y] = [];
            for (let x = 0; x < size; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // 边界墙
                if (x === 0 || y === 0 || x === size - 1 || y === size - 1) {
                    maze[y][x] = 'wall';
                    cell.classList.add('wall');
                } 
                // 内部墙
                else if (Math.random() * 100 < walls) {
                    maze[y][x] = 'wall';
                    cell.classList.add('wall');
                } 
                // 路径
                else {
                    maze[y][x] = 'path';
                }
                
                mazeContainer.appendChild(cell);
            }
        }
        
        // 确保起点和终点是路径
        maze[1][1] = 'path';
        maze[size-2][size-2] = 'path';
        
        // 放置玩家
        playerPos = { x: 1, y: 1 };
        const playerCell = document.querySelector(`.cell[data-x="1"][data-y="1"]`);
        playerCell.classList.add('player');
        
        // 放置宝藏
        const treasureCell = document.querySelector(`.cell[data-x="${size-2}"][data-y="${size-2}"]`);
        treasureCell.classList.add('treasure');
        maze[size-2][size-2] = 'treasure';
        
        // 放置钥匙
        placeItems('key', 3);
        
        // 放置怪物
        placeItems('monster', level + 1);
    }
    
    function placeItems(item, count) {
        const size = 15;
        for (let i = 0; i < count; i++) {
            let placed = false;
            while (!placed) {
                const x = Math.floor(Math.random() * (size - 4)) + 2;
                const y = Math.floor(Math.random() * (size - 4)) + 2;
                
                if (maze[y][x] === 'path' && 
                    !(x === 1 && y === 1) && 
                    !(x === size-2 && y === size-2)) {
                    
                    const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
                    cell.classList.add(item);
                    maze[y][x] = item;
                    placed = true;
                }
            }
        }
    }
    
    function startGame() {
        if (gameRunning) return;
        
        gameRunning = true;
        gamePaused = false;
        
        // 重置时间
        timeLeft = 60;
        updateUI();
        
        // 启动定时器
        gameTimer = setInterval(() => {
            if (!gamePaused) {
                timeLeft--;
                updateUI();
                
                if (timeLeft <= 0) {
                    gameOver(false);
                }
            }
        }, 1000);
        
        startBtn.disabled = true;
    }
    
    function togglePause() {
        gamePaused = !gamePaused;
        pauseBtn.innerHTML = gamePaused ? 
            '<i class="fas fa-play"></i> 继续' : 
            '<i class="fas fa-pause"></i> 暂停';
    }
    
    function resetGame() {
        clearInterval(gameTimer);
        gameRunning = false;
        gamePaused = false;
        startBtn.disabled = false;
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停';
        initGame();
    }
    
    function showHint() {
        if (!gameRunning) return;
        
        // 简单提示：高亮一条路径
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            if (cell.classList.contains('path-highlight')) {
                cell.classList.remove('path-highlight');
            }
        });
        
        // 随机高亮一些路径
        const pathCells = document.querySelectorAll('.cell:not(.wall):not(.player):not(.key):not(.treasure):not(.monster)');
        const highlightCount = Math.min(5, pathCells.length);
        
        for (let i = 0; i < highlightCount; i++) {
            const randomIndex = Math.floor(Math.random() * pathCells.length);
            pathCells[randomIndex].classList.add('path-highlight');
        }
    }
    
    function handleKeyPress(e) {
        if (!gameRunning || gamePaused) return;
        
        const key = e.key;
        let newX = playerPos.x;
        let newY = playerPos.y;
        
        switch(key) {
            case 'ArrowUp':
                newY--;
                break;
            case 'ArrowDown':
                newY++;
                break;
            case 'ArrowLeft':
                newX--;
                break;
            case 'ArrowRight':
                newX++;
                break;
            case 'r':
            case 'R':
                resetGame();
                return;
            default:
                return;
        }
        
        // 检查移动是否有效
        if (isValidMove(newX, newY)) {
            movePlayer(newX, newY);
        }
    }
    
    function isValidMove(x, y) {
        if (x < 0 || y < 0 || x >= 15 || y >= 15) return false;
        
        // 可以移动到路径、钥匙和宝藏
        const validTargets = ['path', 'key', 'treasure'];
        return validTargets.includes(maze[y][x]);
    }
    
    function movePlayer(newX, newY) {
        // 更新玩家位置
        const oldCell = document.querySelector(`.cell[data-x="${playerPos.x}"][data-y="${playerPos.y}"]`);
        const newCell = document.querySelector(`.cell[data-x="${newX}"][data-y="${newY}"]`);
        
        oldCell.classList.remove('player');
        newCell.classList.add('player');
        
        // 检查收集钥匙
        if (newCell.classList.contains('key')) {
            newCell.classList.remove('key');
            keysCollected++;
            maze[newY][newX] = 'path';
            updateUI();
        }
        
        // 检查到达宝藏
        if (newCell.classList.contains('treasure')) {
            if (keysCollected >= 3) {
                levelComplete();
            } else {
                alert(`需要收集所有3把钥匙才能打开宝箱！当前钥匙数: ${keysCollected}/3`);
            }
        }
        
        // 更新玩家位置
        playerPos.x = newX;
        playerPos.y = newY;
    }
    
    function levelComplete() {
        clearInterval(gameTimer);
        
        if (level >= 3) {
            alert(`恭喜！你已完成所有关卡！`);
            resetGame();
            return;
        }
        
        level++;
        alert(`恭喜！你已完成第${level-1}关！开始第${level}关`);
        resetGame();
    }
    
    function gameOver(isWin) {
        clearInterval(gameTimer);
        gameRunning = false;
        
        if (isWin) {
            alert('恭喜！你找到了宝藏！');
        } else {
            alert('时间结束！游戏结束');
        }
        
        resetGame();
    }
    
    function updateUI() {
        currentLevelEl.textContent = level;
        keysCountEl.textContent = keysCollected;
        timeEl.textContent = timeLeft;
    }
});
