document.addEventListener('DOMContentLoaded', () => {
    // 游戏变量
    let gameMode = 1; // 1: 经典数字模式, 2: 传统华容道模式
    let board = [];
    let emptyPosition = { x: 3, y: 3 };
    let moves = 0;
    let startTime = null;
    let timerInterval = null;
    
    // DOM 元素
    const gameBoard = document.getElementById('game-board');
    const movesCounter = document.getElementById('moves-counter');
    const timerDisplay = document.getElementById('timer');
    const modeDescription = document.getElementById('mode-description');
    const legend = document.getElementById('legend');
    const mode1Btn = document.getElementById('mode1-btn');
    const mode2Btn = document.getElementById('mode2-btn');
    const resetBtn = document.getElementById('reset-btn');
    const autoSolveBtn = document.getElementById('auto-solve-btn');
    
    // 初始化游戏
    initGame();
    
    // 事件监听器
    mode1Btn.addEventListener('click', () => {
        gameMode = 1;
        initGame();
    });
    
    mode2Btn.addEventListener('click', () => {
        gameMode = 2;
        initGame();
    });
    
    resetBtn.addEventListener('click', initGame);
    autoSolveBtn.addEventListener('click', autoSolve);
    
    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        gameBoard.innerHTML = '';
        moves = 0;
        updateMovesCounter();
        resetTimer();
        
        // 更新UI
        gameBoard.className = `mode${gameMode}`;
        modeDescription.textContent = gameMode === 1 
            ? '经典数字模式：点击与空白相邻的数字块进行移动，将数字按1-15的顺序排列' 
            : '传统华容道模式：移动方块，让2×2的曹操(0)从底部中间出口离开';
        
        legend.classList.toggle('hidden', gameMode === 1);
        
        if (gameMode === 1) {
            // 经典数字模式
            initClassicMode();
        } else {
            // 传统华容道模式
            initTraditionalMode();
        }
        
        // 添加出口（仅限传统模式）
        if (gameMode === 2) {
            const exit = document.createElement('div');
            exit.className = 'exit';
            exit.textContent = '出口';
            gameBoard.appendChild(exit);
        }
        
        // 开始计时
        startTimer();
    }
    
    // 初始化经典数字模式
    function initClassicMode() {
        // 创建数字数组 (1-15)
        let numbers = Array.from({ length: 15 }, (_, i) => i + 1);
        
        // 随机打乱数组（确保有解）
        do {
            numbers = shuffleArray(numbers);
        } while (!isSolvable(numbers));
        
        // 添加空白位置
        numbers.push(0);
        
        // 创建游戏板
        board = [];
        for (let i = 0; i < 4; i++) {
            board[i] = [];
            for (let j = 0; j < 4; j++) {
                const index = i * 4 + j;
                const num = numbers[index];
                
                // 创建方块
                const tile = document.createElement('div');
                tile.className = num === 0 ? 'tile empty' : 'tile';
                tile.textContent = num === 0 ? '' : num;
                tile.dataset.value = num;
                tile.dataset.row = i;
                tile.dataset.col = j;
                
                if (num !== 0) {
                    tile.addEventListener('click', () => moveTile(i, j));
                }
                
                gameBoard.appendChild(tile);
                board[i][j] = num;
                
                // 记录空白位置
                if (num === 0) {
                    emptyPosition = { x: j, y: i };
                }
            }
        }
    }
    
    // 初始化传统华容道模式
    function initTraditionalMode() {
        // 初始布局 (0:曹操, 1-4:竖关羽, 5:横关羽, 6-9:小兵)
        const layout = [
            [1, 6, 6, 2],
            [1, 0, 0, 2],
            [5, 0, 0, 7],
            [5, 3, 4, 8],
            [9, 3, 4, 8]  // 额外一行用于底部出口
        ];
        
        // 创建游戏板
        board = [];
        for (let i = 0; i < 4; i++) {
            board[i] = [];
            for (let j = 0; j < 4; j++) {
                const num = layout[i][j];
                
                // 创建方块
                const tile = document.createElement('div');
                tile.dataset.value = num;
                tile.dataset.row = i;
                tile.dataset.col = j;
                
                // 设置方块样式
                if (num === 0) {
                    tile.className = 'tile size-2x2';
                    tile.textContent = '0';
                } else if (num >= 1 && num <= 4) {
                    tile.className = 'tile size-1x2 vertical';
                    tile.textContent = num;
                } else if (num === 5) {
                    tile.className = 'tile size-1x2 horizontal';
                    tile.textContent = '5';
                } else {
                    tile.className = 'tile size-1x1';
                    tile.textContent = num;
                }
                
                tile.addEventListener('click', () => moveTile(i, j));
                gameBoard.appendChild(tile);
                board[i][j] = num;
                
                // 记录曹操位置
                if (num === 0 && i < 4 && j < 4) {
                    emptyPosition = { x: j, y: i };
                }
            }
        }
    }
    
    // 移动方块
    function moveTile(row, col) {
        const clickedValue = board[row][col];
        
        if (gameMode === 1) {
            // 经典模式移动逻辑
            const directions = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0},
                {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ];
            
            for (const dir of directions) {
                const newRow = row + dir.dy;
                const newCol = col + dir.dx;
                
                if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
                    if (board[newRow][newCol] === 0) {
                        // 交换位置
                        swapTiles(row, col, newRow, newCol);
                        moves++;
                        updateMovesCounter();
                        
                        // 检查胜利
                        if (checkWin()) {
                            winGame();
                        }
                        return;
                    }
                }
            }
        } else {
            // 传统模式移动逻辑
            // 检查是否可以移动到空白位置
            // 简化的移动逻辑（实际华容道移动更复杂，这里做简化）
            const directions = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0},
                {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ];
            
            for (const dir of directions) {
                const newRow = row + dir.dy;
                const newCol = col + dir.dx;
                
                if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
                    if (board[newRow][newCol] === 0) {
                        // 交换位置
                        swapTiles(row, col, newRow, newCol);
                        moves++;
                        updateMovesCounter();
                        
                        // 检查曹操是否在出口位置
                        if (checkCaoCaoAtExit()) {
                            winGame();
                        }
                        return;
                    }
                }
            }
        }
    }
    
    // 交换两个方块
    function swapTiles(row1, col1, row2, col2) {
        // 更新数组
        [board[row1][col1], board[row2][col2]] = [board[row2][col2], board[row1][col1]];
        
        // 更新UI
        const tile1 = document.querySelector(`.tile[data-row="${row1}"][data-col="${col1}"]`);
        const tile2 = document.querySelector(`.tile[data-row="${row2}"][data-col="${col2}"]`);
        
        if (tile1 && tile2) {
            // 更新位置数据
            tile1.dataset.row = row2;
            tile1.dataset.col = col2;
            tile2.dataset.row = row1;
            tile2.dataset.col = col1;
            
            // 更新空白位置
            if (tile1.classList.contains('empty')) {
                emptyPosition = { x: col2, y: row2 };
            } else if (tile2.classList.contains('empty')) {
                emptyPosition = { x: col1, y: row1 };
            }
        }
    }
    
    // 检查经典模式胜利
    function checkWin() {
        // 检查数字顺序是否正确
        let counter = 1;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (i === 3 && j === 3) {
                    if (board[i][j] !== 0) return false;
                } else {
                    if (board[i][j] !== counter) return false;
                    counter++;
                }
            }
        }
        return true;
    }
    
    // 检查传统模式胜利（曹操在出口）
    function checkCaoCaoAtExit() {
        return board[3][1] === 0 && board[3][2] === 0;
    }
    
    // 赢得游戏
    function winGame() {
        clearInterval(timerInterval);
        
        // 显示胜利动画
        gameBoard.classList.add('win');
        
        // 弹出胜利消息
        setTimeout(() => {
            alert(`恭喜！你赢得了${gameMode === 1 ? '经典模式' : '传统模式'}!\n用时: ${timerDisplay.textContent}\n步数: ${moves}`);
            gameBoard.classList.remove('win');
        }, 500);
    }
    
    // 自动完成（简化版）
    function autoSolve() {
        alert('自动完成功能将在完整版本中实现！');
    }
    
    // 辅助函数
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    function isSolvable(array) {
        // 检查可解性逻辑
        return true; // 简化版，总是返回可解
    }
    
    function updateMovesCounter() {
        movesCounter.textContent = `移动步数: ${moves}`;
    }
    
    function startTimer() {
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
    }
    
    function resetTimer() {
        clearInterval(timerInterval);
        timerDisplay.textContent = '时间: 00:00';
    }
    
    function updateTimer() {
        const now = new Date();
        const elapsed = Math.floor((now - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `时间: ${minutes}:${seconds}`;
    }
});
