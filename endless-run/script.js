// 游戏变量
const player = document.getElementById('player');
const gameOverScreen = document.getElementById('gameOver');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

let score = 0;
let gameSpeed = 8;
let isJumping = false;
let isGameOver = false;
let obstacles = [];
let clouds = [];
let gameInterval;
let obstacleInterval;

// 初始化游戏
function initGame() {
    // 重置变量
    score = 0;
    gameSpeed = 8;
    isJumping = false;
    isGameOver = false;
    obstacles = [];
    clouds = [];
    
    // 更新UI
    scoreElement.textContent = score;
    gameOverScreen.style.display = 'none';
    player.style.bottom = '40px';
    player.classList.remove('jump');
    
    // 移除所有障碍物
    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
    
    // 创建初始云朵
    createClouds();
    
    // 开始游戏循环
    if (gameInterval) clearInterval(gameInterval);
    if (obstacleInterval) clearInterval(obstacleInterval);
    
    gameInterval = setInterval(updateGame, 20);
    obstacleInterval = setInterval(createObstacle, 1500);
}

// 创建云朵装饰
function createClouds() {
    const gameContainer = document.querySelector('.game-container');
    
    // 移除旧云朵
    document.querySelectorAll('.cloud').forEach(cloud => cloud.remove());
    
    // 创建新云朵
    for (let i = 0; i < 8; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        
        // 随机位置和大小
        const size = Math.random() * 60 + 40;
        const x = Math.random() * 700;
        const y = Math.random() * 200;
        
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size * 0.6}px`;
        cloud.style.left = `${x}px`;
        cloud.style.top = `${y}px`;
        
        gameContainer.appendChild(cloud);
        clouds.push({
            element: cloud,
            x: x,
            y: y,
            speed: Math.random() * 0.5 + 0.2
        });
    }
}

// 生成障碍物
function createObstacle() {
    if (isGameOver) return;
    
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    
    // 随机高度
    const height = Math.random() * 30 + 40;
    obstacle.style.height = `${height}px`;
    
    // 随机位置（避免重叠）
    let topOffset = 0;
    if (Math.random() > 0.7) {
        topOffset = Math.random() * 20;
        obstacle.style.bottom = `${40 + topOffset}px`;
    }
    
    const gameContainer = document.querySelector('.game-container');
    gameContainer.appendChild(obstacle);
    
    obstacles.push({
        element: obstacle,
        x: 800,
        passed: false,
        height: height,
        topOffset: topOffset
    });
}

// 跳跃功能
function jump() {
    if (isJumping || isGameOver) return;
    
    isJumping = true;
    player.classList.add('jump');
    
    // 添加跳跃音效（虽然没有实际文件，但保留结构）
    tryPlaySound('jump');
    
    setTimeout(() => {
        player.classList.remove('jump');
        isJumping = false;
    }, 800);
}

// 更新游戏状态
function updateGame() {
    if (isGameOver) return;
    
    // 更新分数
    score++;
    scoreElement.textContent = Math.floor(score / 10);
    
    // 增加游戏难度
    if (score % 500 === 0) {
        gameSpeed += 0.5;
    }
    
    // 移动云朵
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        cloud.element.style.left = `${cloud.x}px`;
        
        // 如果云朵移出屏幕，重新放置到右侧
        if (cloud.x < -100) {
            cloud.x = 800;
        }
    });
    
    // 移动障碍物
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= gameSpeed;
        obstacle.element.style.left = `${obstacle.x}px`;
        
        // 检测碰撞
        if (!obstacle.passed && obstacle.x < 150 && obstacle.x > 100) {
            const playerBottom = parseInt(player.style.bottom);
            const obstacleHeight = obstacle.height;
            
            if (playerBottom < obstacleHeight + 40 - obstacle.topOffset) {
                gameOver();
                return;
            } else {
                obstacle.passed = true;
                // 增加分数
                score += 50;
            }
        }
        
        // 移除屏幕外的障碍物
        if (obstacle.x < -50) {
            obstacle.element.remove();
            obstacles.splice(index, 1);
        }
    });
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    clearInterval(obstacleInterval);
    
    // 显示游戏结束画面
    finalScoreElement.textContent = Math.floor(score / 10);
    gameOverScreen.style.display = 'flex';
    
    // 移除所有障碍物
    obstacles.forEach(obstacle => obstacle.element.remove());
    obstacles = [];
    
    // 播放游戏结束音效
    tryPlaySound('gameover');
}

// 伪音频播放函数（实际项目中可以添加真实音效）
function tryPlaySound(soundName) {
    // 在实际项目中，这里会播放音效
    // 例如：new Audio(`sounds/${soundName}.mp3`).play();
}

// 事件监听
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        jump();
    } else if (e.code === 'Enter' && isGameOver) {
        initGame();
    }
});

document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

document.addEventListener('click', () => {
    jump();
});

restartBtn.addEventListener('click', initGame);

// 启动游戏
window.addEventListener('load', initGame);
