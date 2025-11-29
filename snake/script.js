document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const startButton = document.getElementById('start-btn');
    const pauseButton = document.getElementById('pause-btn');
    
    // 游戏设置
    const gridSize = 20;
    const tileCount = 15;
    canvas.width = gridSize * tileCount;
    canvas.height = gridSize * tileCount;
    
    // 游戏状态
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let gameSpeed = 150; // 毫秒
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameLoop;
    let isPaused = false;
    let isGameRunning = false;
    
    highScoreElement.textContent = highScore;
    
    // 初始化游戏
    function initGame() {
        // 初始化蛇
        snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        
        // 初始化食物
        placeFood();
        
        // 重置方向和分数
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        scoreElement.textContent = score;
        
        isGameRunning = true;
        isPaused = false;
        pauseButton.textContent = '暂停';
    }
    
    // 随机放置食物
    function placeFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // 确保食物不会出现在蛇身上
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                return placeFood();
            }
        }
    }
    
    // 游戏主循环
    function gameUpdate() {
        if (isPaused || !isGameRunning) return;
        
        // 更新方向
        direction = nextDirection;
        
        // 移动蛇
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch (direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        
        // 检查碰撞
        if (
            head.x < 0 || head.x >= tileCount ||
            head.y < 0 || head.y >= tileCount ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
            gameOver();
            return;
        }
        
        // 添加新头部
        snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreElement.textContent = score;
            placeFood();
            
            // 随着分数增加加快游戏速度
            if (score % 5 === 0 && gameSpeed > 50) {
                gameSpeed -= 10;
                clearInterval(gameLoop);
                gameLoop = setInterval(gameUpdate, gameSpeed);
            }
        } else {
            // 如果没有吃到食物，移除尾部
            snake.pop();
        }
        
        // 绘制游戏
        drawGame();
    }
    
    // 绘制游戏
    function drawGame() {
        // 清空画布
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制蛇
        ctx.fillStyle = '#2ecc71';
        for (let segment of snake) {
            ctx.fillRect(
                segment.x * gridSize, 
                segment.y * gridSize, 
                gridSize - 1, 
                gridSize - 1
            );
        }
        
        // 绘制头部（不同颜色）
        ctx.fillStyle = '#e74c3c';
        const head = snake[0];
        ctx.fillRect(
            head.x * gridSize, 
            head.y * gridSize, 
            gridSize - 1, 
            gridSize - 1
        );
        
        // 绘制食物
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(
            food.x * gridSize, 
            food.y * gridSize, 
            gridSize - 1, 
            gridSize - 1
        );
    }
    
    // 游戏结束
    function gameOver() {
        clearInterval(gameLoop);
        isGameRunning = false;
        
        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        alert(`游戏结束! 你的分数是: ${score}`);
    }
    
    // 键盘控制
    document.addEventListener('keydown', e => {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (direction !== 'left') nextDirection = 'right';
                break;
            case ' ':
                togglePause();
                break;
        }
    });
    
    // 开始游戏
    startButton.addEventListener('click', () => {
        if (isGameRunning) {
            clearInterval(gameLoop);
        }
        initGame();
        gameLoop = setInterval(gameUpdate, gameSpeed);
    });
    
    // 暂停/继续游戏
    function togglePause() {
        if (!isGameRunning) return;
        
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? '继续' : '暂停';
    }
    
    pauseButton.addEventListener('click', togglePause);
    
    // 初始绘制
    drawGame();
});
