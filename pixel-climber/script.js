document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const heightDisplay = document.getElementById('height');
    const timeDisplay = document.getElementById('time');
    const restartBtn = document.getElementById('restart-btn');
    
    // 设置画布大小
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // 游戏状态
    let gameRunning = true;
    let startTime = Date.now();
    let highestPoint = 0;
    
    // 玩家属性
    const player = {
        x: canvas.width / 2,
        y: canvas.height - 100,
        width: 30,
        height: 50,
        velocityY: 0,
        velocityX: 0,
        isSwinging: false,
        hammerAngle: -Math.PI / 4,
        hammerLength: 60,
        color: '#FF5555'
    };
    
    // 方块数组
    let blocks = [];
    const blockSize = 40;
    
    // 生成初始地形
    function generateTerrain() {
        blocks = [];
        
        // 地面
        for (let x = 0; x < canvas.width; x += blockSize) {
            blocks.push({
                x: x,
                y: canvas.height - blockSize,
                width: blockSize,
                height: blockSize,
                color: '#8B4513' // 棕色
            });
        }
        
        // 随机生成障碍物
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * (canvas.width - blockSize);
            const y = Math.random() * (canvas.height / 2) + 100;
            
            // 确保不会生成在玩家起始位置
            if (Math.abs(x - player.x) > 100 || Math.abs(y - player.y) > 100) {
                blocks.push({
                    x: x,
                    y: y,
                    width: blockSize,
                    height: blockSize,
                    color: '#8B4513'
                });
            }
        }
        
        // 添加一些特殊方块
        for (let i = 0; i < 10; i++) {
            blocks.push({
                x: Math.random() * (canvas.width - blockSize),
                y: Math.random() * (canvas.height / 2),
                width: blockSize,
                height: blockSize,
                color: '#FF5555', // 红色
                isBouncy: true
            });
        }
    }
    
    // 游戏主循环
    function gameLoop() {
        if (!gameRunning) return;
        
        // 清空画布
        ctx.fillStyle = '#70a7ff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 更新玩家位置
        updatePlayer();
        
        // 绘制方块
        drawBlocks();
        
        // 绘制玩家
        drawPlayer();
        
        // 更新UI
        updateUI();
        
        requestAnimationFrame(gameLoop);
    }
    
    // 更新玩家位置
    function updatePlayer() {
        // 重力
        player.velocityY += 0.5;
        
        // 摩擦
        player.velocityX *= 0.95;
        
        // 检测碰撞
        let onGround = false;
        blocks.forEach(block => {
            // 简单的碰撞检测
            if (player.x < block.x + block.width &&
                player.x + player.width > block.x &&
                player.y < block.y + block.height &&
                player.y + player.height > block.y) {
                
                // 从上方碰撞
                if (player.velocityY > 0 && player.y + player.height < block.y + block.height / 2) {
                    player.y = block.y - player.height;
                    player.velocityY = block.isBouncy ? -player.velocityY * 0.8 : 0;
                    onGround = true;
                }
                // 从下方碰撞
                else if (player.velocityY < 0 && player.y > block.y + block.height / 2) {
                    player.y = block.y + block.height;
                    player.velocityY = 0;
                }
                // 从左侧碰撞
                else if (player.velocityX > 0 && player.x + player.width < block.x + block.width / 2) {
                    player.x = block.x - player.width;
                    player.velocityX = 0;
                }
                // 从右侧碰撞
                else if (player.velocityX < 0 && player.x > block.x + block.width / 2) {
                    player.x = block.x + block.width;
                    player.velocityX = 0;
                }
            }
        });
        
        // 更新位置
        player.x += player.velocityX;
        player.y += player.velocityY;
        
        // 边界检查
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
        if (player.y > canvas.height) {
            // 掉落到底部，游戏结束
            gameOver();
        }
        
        // 更新最高点
        const currentHeight = Math.round((canvas.height - player.y) / 10);
        if (currentHeight > highestPoint) {
            highestPoint = currentHeight;
        }
        
        // 锤子摆动逻辑
        if (player.isSwinging) {
            player.hammerAngle += 0.1;
            if (player.hammerAngle > Math.PI / 4) {
                player.isSwinging = false;
            }
        } else {
            player.hammerAngle = -Math.PI / 4;
        }
    }
    
    // 绘制方块
    function drawBlocks() {
        blocks.forEach(block => {
            ctx.fillStyle = block.color;
            ctx.fillRect(block.x, block.y, block.width, block.height);
            
            // 像素风格边框
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(block.x, block.y, block.width, block.height);
        });
    }
    
    // 绘制玩家
    function drawPlayer() {
        // 绘制玩家身体
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // 绘制锤子
        const hammerX = player.x + player.width / 2;
        const hammerY = player.y + player.height / 2;
        const endX = hammerX + Math.cos(player.hammerAngle) * player.hammerLength;
        const endY = hammerY + Math.sin(player.hammerAngle) * player.hammerLength;
        
        ctx.beginPath();
        ctx.moveTo(hammerX, hammerY);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#8B4513';
        ctx.stroke();
        
        // 锤头
        ctx.beginPath();
        ctx.arc(endX, endY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#555555';
        ctx.fill();
    }
    
    // 更新UI
    function updateUI() {
        heightDisplay.textContent = highestPoint;
        timeDisplay.textContent = Math.floor((Date.now() - startTime) / 1000);
    }
    
    // 游戏结束
    function gameOver() {
        gameRunning = false;
        alert(`游戏结束！\n最高高度: ${highestPoint}m\n用时: ${Math.floor((Date.now() - startTime) / 1000}秒`);
    }
    
    // 重新开始游戏
    function restartGame() {
        player.x = canvas.width / 2;
        player.y = canvas.height - 100;
        player.velocityX = 0;
        player.velocityY = 0;
        highestPoint = 0;
        startTime = Date.now();
        gameRunning = true;
        generateTerrain();
        gameLoop();
    }
    
    // 事件监听
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                player.velocityX = -5;
                break;
            case 'ArrowRight':
                player.velocityX = 5;
                break;
            case ' ':
                if (!player.isSwinging) {
                    player.isSwinging = true;
                    
                    // 锤子碰撞检测
                    const hammerX = player.x + player.width / 2 + Math.cos(player.hammerAngle) * player.hammerLength;
                    const hammerY = player.y + player.height / 2 + Math.sin(player.hammerAngle) * player.hammerLength;
                    
                    blocks.forEach(block => {
                        if (hammerX > block.x && hammerX < block.x + block.width &&
                            hammerY > block.y && hammerY < block.y + block.height) {
                            // 根据锤击方向施加力
                            player.velocityY = -10;
                            player.velocityX = Math.cos(player.hammerAngle) * 8;
                        }
                    });
                }
                break;
        }
    });
    
    // 鼠标/触摸控制
    canvas.addEventListener('mousedown', (e) => {
        if (!gameRunning) return;
        
        if (!player.isSwinging) {
            player.isSwinging = true;
            
            // 计算锤击方向
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            player.hammerAngle = Math.atan2(mouseY - (player.y + player.height / 2), 
                                        mouseX - (player.x + player.width / 2));
        }
    });
    
    restartBtn.addEventListener('click', restartGame);
    
    // 窗口大小调整
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        generateTerrain();
    });
    
    // 初始化游戏
    generateTerrain();
    gameLoop();
});
