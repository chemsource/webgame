document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const bestScoreElement = document.getElementById('best-score');
    const newGameButton = document.getElementById('new-game-btn');
    
    let grid = [];
    let score = 0;
    let bestScore = localStorage.getItem('2048-best-score') || 0;
    let isGameOver = false;
    
    bestScoreElement.textContent = bestScore;
    
    // 初始化游戏
    function initGame() {
        // 清空游戏板
        board.innerHTML = '';
        isGameOver = false;
        score = 0;
        scoreElement.textContent = score;
        
        // 创建4x4网格
        grid = Array(4).fill().map(() => Array(4).fill(0));
        
        // 创建网格背景
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid';
        
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            gridContainer.appendChild(cell);
        }
        
        board.appendChild(gridContainer);
        
        // 添加两个初始方块
        addRandomTile();
        addRandomTile();
        
        // 渲染游戏板
        renderBoard();
    }
    
    // 添加随机方块
    function addRandomTile() {
        const emptyCells = [];
        
        // 找出所有空格子
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            // 随机选择一个空格子
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            
            // 90%概率生成2，10%概率生成4
            grid[row][col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    // 渲染游戏板
    function renderBoard() {
        // 移除所有现有的方块
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());
        
        // 添加所有方块
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const value = grid[row][col];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value}`;
                    tile.textContent = value;
                    
                    // 计算位置
                    const x = col * (25 + 15) + 15;
                    const y = row * (25 + 15) + 15;
                    
                    tile.style.left = `${x}px`;
                    tile.style.top = `${y}px`;
                    
                    board.appendChild(tile);
                }
            }
        }
    }
    
    // 移动方块
    function moveTiles(direction) {
        if (isGameOver) return false;
        
        let moved = false;
        const oldGrid = JSON.parse(JSON.stringify(grid));
        
        // 根据方向处理移动
        switch (direction) {
            case 'up':
                for (let col = 0; col < 4; col++) {
                    moved = moveColumn(col, -1) || moved;
                }
                break;
            case 'down':
                for (let col = 0; col < 4; col++) {
                    moved = moveColumn(col, 1) || moved;
                }
                break;
            case 'left':
                for (let row = 0; row < 4; row++) {
                    moved = moveRow(row, -1) || moved;
                }
                break;
            case 'right':
                for (let row = 0; row < 4; row++) {
                    moved = moveRow(row, 1) || moved;
                }
                break;
        }
        
        // 如果有移动，添加新方块并检查游戏状态
        if (moved) {
            addRandomTile();
            renderBoard();
            checkGameOver();
        }
        
        return moved;
    }
    
    // 移动行
    function moveRow(row, direction) {
        const line = grid[row].filter(val => val !== 0);
        let moved = false;
        
        if (direction === 1) {
            // 向右移动
            for (let i = line.length - 1; i > 0; i--) {
                if (line[i] === line[i - 1]) {
                    line[i] *= 2;
                    line[i - 1] = 0;
                    score += line[i];
                    moved = true;
                }
            }
            
            const newLine = line.filter(val => val !== 0);
            while (newLine.length < 4) {
                newLine.unshift(0);
            }
            
            if (JSON.stringify(grid[row]) !== JSON.stringify(newLine)) {
                moved = true;
            }
            
            grid[row] = newLine;
        } else {
            // 向左移动
            for (let i = 0; i < line.length - 1; i++) {
                if (line[i] === line[i + 1]) {
                    line[i] *= 2;
                    line[i + 1] = 0;
                    score += line[i];
                    moved = true;
                }
            }
            
            const newLine = line.filter(val => val !== 0);
            while (newLine.length < 4) {
                newLine.push(0);
            }
            
            if (JSON.stringify(grid[row]) !== JSON.stringify(newLine)) {
                moved = true;
            }
            
            grid[row] = newLine;
        }
        
        if (moved) {
            scoreElement.textContent = score;
            if (score > bestScore) {
                bestScore = score;
                bestScoreElement.textContent = bestScore;
                localStorage.setItem('2048-best-score', bestScore);
            }
        }
        
        return moved;
    }
    
    // 移动列
    function moveColumn(col, direction) {
        const column = [];
        for (let row = 0; row < 4; row++) {
            if (grid[row][col] !== 0) {
                column.push(grid[row][col]);
            }
        }
        
        let moved = false;
        
        if (direction === 1) {
            // 向下移动
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    column[i - 1] = 0;
                    score += column[i];
                    moved = true;
                }
            }
            
            const newColumn = column.filter(val => val !== 0);
            while (newColumn.length < 4) {
                newColumn.unshift(0);
            }
            
            for (let row = 0; row < 4; row++) {
                if (grid[row][col] !== newColumn[row]) {
                    moved = true;
                    grid[row][col] = newColumn[row];
                }
            }
        } else {
            // 向上移动
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    column[i + 1] = 0;
                    score += column[i];
                    moved = true;
                }
            }
            
            const newColumn = column.filter(val => val !== 0);
            while (newColumn.length < 4) {
                newColumn.push(0);
            }
            
            for (let row = 0; row < 4; row++) {
                if (grid[row][col] !== newColumn[row]) {
                    moved = true;
                    grid[row][col] = newColumn[row];
                }
            }
        }
        
        if (moved) {
            scoreElement.textContent = score;
            if (score > bestScore) {
                bestScore = score;
                bestScoreElement.textContent = bestScore;
                localStorage.setItem('2048-best-score', bestScore);
            }
        }
        
        return moved;
    }
    
    // 检查游戏是否结束
    function checkGameOver() {
        // 检查是否有空格子
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (grid[row][col] === 0) {
                    return false;
                }
            }
        }
        
        // 检查是否有可合并的相邻方块
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const value = grid[row][col];
                
                // 检查右侧
                if (col < 3 && grid[row][col + 1] === value) {
                    return false;
                }
                
                // 检查下方
                if (row < 3 && grid[row + 1][col] === value) {
                    return false;
                }
            }
        }
        
        // 游戏结束
        isGameOver = true;
        showGameOver();
        return true;
    }
    
    // 显示游戏结束
    function showGameOver() {
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        
        gameOverDiv.innerHTML = `
            <h2>游戏结束!</h2>
            <p>你的分数: ${score}</p>
            <button onclick="location.reload()">再玩一次</button>
        `;
        
        board.appendChild(gameOverDiv);
    }
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                moveTiles('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                moveTiles('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                moveTiles('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                moveTiles('right');
                break;
        }
    });
    
    // 新游戏按钮
    newGameButton.addEventListener('click', initGame);
    
    // 触摸滑动控制（移动设备）
    let touchStartX = 0;
    let touchStartY = 0;
    
    board.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, false);
    
    board.addEventListener('touchmove', (e) => {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // 水平滑动
            if (diffX > 0) {
                // 向左滑动
                moveTiles('left');
            } else {
                // 向右滑动
                moveTiles('right');
            }
        } else {
            // 垂直滑动
            if (diffY > 0) {
                // 向上滑动
                moveTiles('up');
            } else {
                // 向下滑动
                moveTiles('down');
            }
        }
        
        touchStartX = 0;
        touchStartY = 0;
        e.preventDefault();
    }, false);
    
    // 初始化游戏
    initGame();
});
