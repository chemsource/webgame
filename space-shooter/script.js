document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const levelElement = document.getElementById('level');
    const startButton = document.getElementById('start-btn');
    const restartButton = document.getElementById('restart-btn');
    const gameOverDiv = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    
    // 设置画布大小
    canvas.width = 800;
    canvas.height = 600;
    
    // 游戏状态
    let score = 0;
    let lives = 3;
    let level = 1;
    let gameRunning = false;
    let animationId;
    
    // 玩家飞船
    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 60,
        width: 50,
        height: 50,
        speed: 8,
        color: '#0ff',
        isMovingLeft: false,
        isMovingRight: false
    };
    
    // 子弹数组
    let bullets = [];
    const bulletSpeed = 10;
    
    // 敌人数组
    let enemies = [];
    let enemySpeed = 1;
    let enemySpawnRate = 60;
    let enemySpawnCounter = 0;
    
    // 爆炸效果数组
    let explosions = [];
    
    // 初始化游戏
    function initGame() {
        score = 0;
        lives = 3;
        level = 1;
        bullets = [];
        enemies = [];
        explosions = [];
        enemySpeed = 1;
        enemySpawnRate = 60;
        
        scoreElement.textContent = score;
        livesElement.textContent = lives;
        levelElement.textContent = level;
        
        player.x = canvas.width / 2 - 25;
        player.y = canvas.height - 60;
        player.isMovingLeft = false;
        player.isMovingRight = false;
        
        gameOverDiv.classList.add('hidden');
        gameRunning = true;
        
        if (!animationId) {
            gameLoop();
        }
    }
    
    // 游戏主循环
    function gameLoop() {
        if (!gameRunning) return;
        
        // 清空画布
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制星空背景
        drawStars();
        
        // 更新和绘制玩家
        updatePlayer();
        drawPlayer();
        
        // 更新和绘制子弹
        updateBullets();
        drawBullets();
        
        // 生成敌人
        spawnEnemies();
        
        // 更新和绘制敌人
        updateEnemies();
        drawEnemies();
        
        // 更新和绘制爆炸效果
        updateExplosions();
        drawExplosions();
        
        // 检查碰撞
        checkCollisions();
        
        // 检查升级
        checkLevelUp();
        
        animationId = requestAnimationFrame(gameLoop);
    }
    
    // 绘制星空背景
    function drawStars() {
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = (Math.random() * canvas.height + (Date.now() / 100) % canvas.height) % canvas.height;
            const size = Math.random() * 2;
            ctx.fillRect(x, y, size, size);
        }
    }
    
    // 更新玩家位置
    function updatePlayer() {
        if (player.isMovingLeft && player.x > 0) {
            player.x -= player.speed;
        }
        if (player.isMovingRight && player.x < canvas.width - player.width) {
            player.x += player.speed;
        }
    }
    
    // 绘制玩家
    function drawPlayer() {
        ctx.fillStyle = player.color;
        // 绘制飞船主体
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y);
        ctx.lineTo(player.x, player.y + player.height);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.closePath();
        ctx.fill();
        
        // 绘制飞船火焰
        if (Math.random() > 0.3) {
            ctx.fillStyle = '#f00';
            ctx.beginPath();
            ctx.moveTo(player.x + player.width / 2 - 5, player.y + player.height);
            ctx.lineTo(player.x + player.width / 2, player.y + player.height + 10);
            ctx.lineTo(player.x + player.width / 2 + 5, player.y + player.height);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    // 发射子弹
    function fireBullet() {
        bullets.push({
            x: player.x + player.width / 2 - 2.5,
            y: player.y,
            width: 5,
            height: 15,
            speed: bulletSpeed,
            color: '#0f0'
        });
    }
    
    // 更新子弹位置
    function updateBullets() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y -= bullets[i].speed;
            
            // 移除超出屏幕的子弹
            if (bullets[i].y < 0) {
                bullets.splice(i, 1);
            }
        }
    }
    
    // 绘制子弹
    function drawBullets() {
        ctx.fillStyle = '#0f0';
        bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }
    
    // 生成敌人
    function spawnEnemies() {
        enemySpawnCounter++;
        if (enemySpawnCounter >= enemySpawnRate) {
            enemies.push({
                x: Math.random() * (canvas.width - 40),
                y: -40,
                width: 40,
                height: 40,
                speed: enemySpeed,
                color: '#f00'
            });
            enemySpawnCounter = 0;
        }
    }
    
    // 更新敌人位置
    function updateEnemies() {
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].y += enemies[i].speed;
            
            // 移除超出屏幕的敌人
            if (enemies[i].y > canvas.height) {
                enemies.splice(i, 1);
                lives--;
                livesElement.textContent = lives;
                
                if (lives <= 0) {
                    gameOver();
                }
            }
        }
    }
    
    // 绘制敌人
    function drawEnemies() {
        enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            // 绘制敌人飞船
            ctx.beginPath();
            ctx.moveTo(enemy.x, enemy.y + enemy.height / 2);
            ctx.lineTo(enemy.x + enemy.width / 2, enemy.y);
            ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height / 2);
            ctx.lineTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
            ctx.closePath();
            ctx.fill();
        });
    }
    
    // 创建爆炸效果
    function createExplosion(x, y) {
        explosions.push({
            x: x,
            y: y,
            radius: 20,
            particles: []
        });
        
        // 创建爆炸粒子
        for (let i = 0; i < 20; i++) {
            explosions[explosions.length - 1].particles.push({
                x: x,
                y: y,
                radius: Math.random() * 3 + 1,
                color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`,
                speedX: (Math.random() - 0.5) * 5,
                speedY: (Math.random() - 0.5) * 5,
                life: 30
            });
        }
    }
    
    // 更新爆炸效果
    function updateExplosions() {
        for (let i = explosions.length - 1; i >= 0; i--) {
            const explosion = explosions[i];
            
            // 更新粒子
            for (let j = explosion.particles.length - 1; j >= 0; j--) {
                const particle = explosion.particles[j];
                
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                particle.life--;
                
                // 移除生命周期结束的粒子
                if (particle.life <= 0) {
                    explosion.particles.splice(j, 1);
                }
            }
            
            // 移除没有粒子的爆炸
            if (explosion.particles.length === 0) {
                explosions.splice(i, 1);
            }
        }
    }
    
    // 绘制爆炸效果
    function drawExplosions() {
        explosions.forEach(explosion => {
            explosion.particles.forEach(particle => {
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fill();
            });
        });
    }
    
    // 检查碰撞
    function checkCollisions() {
        // 检查子弹和敌人的碰撞
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (isColliding(bullets[i], enemies[j])) {
                    // 创建爆炸效果
                    createExplosion(enemies[j].x + enemies[j].width / 2, enemies[j].y + enemies[j].height / 2);
                    
                    // 移除子弹和敌人
                    bullets.splice(i, 1);
                    enemies.splice(j, 1);
                    
                    // 增加分数
                    score += 10;
                    scoreElement.textContent = score;
                    
                    break;
                }
            }
        }
        
        // 检查玩家和敌人的碰撞
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (isColliding(player, enemies[i])) {
                // 创建爆炸效果
                createExplosion(enemies[i].x + enemies[i].width / 2, enemies[i].y + enemies[i].height / 2);
                
                // 移除敌人
                enemies.splice(i, 1);
                
                // 减少生命值
                lives--;
                livesElement.textContent = lives;
                
                if (lives <= 0) {
                    gameOver();
                }
                
                break;
            }
        }
    }
    
    // 碰撞检测
    function isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    // 检查升级
    function checkLevelUp() {
        const nextLevel = Math.floor(score / 100) + 1;
        if (nextLevel > level) {
            level = nextLevel;
            levelElement.textContent = level;
            
            // 增加难度
            enemySpeed += 0.2;
            if (enemySpawnRate > 20) {
                enemySpawnRate -= 5;
            }
        }
    }
    
    // 游戏结束
    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        animationId = null;
        
        finalScoreElement.textContent = score;
        gameOverDiv.classList.remove('hidden');
    }
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                player.isMovingLeft = true;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                player.isMovingRight = true;
                break;
            case ' ':
                fireBullet();
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                player.isMovingLeft = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                player.isMovingRight = false;
                break;
        }
    });
    
    // 触摸控制（移动设备）
    let touchStartX = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        e.preventDefault();
    }, false);
    
    canvas.addEventListener('touchmove', (e) => {
        if (!gameRunning) return;
        
        const touchX = e.touches[0].clientX;
        const touchDiff = touchX - touchStartX;
        
        if (Math.abs(touchDiff) > 10) {
            if (touchDiff > 0) {
                player.isMovingLeft = false;
                player.isMovingRight = true;
            } else {
                player.isMovingLeft = true;
                player.isMovingRight = false;
            }
        }
        
        e.preventDefault();
    }, false);
    
    canvas.addEventListener('touchend', (e) => {
        player.isMovingLeft = false;
        player.isMovingRight = false;
        
        // 点击屏幕发射子弹
        if (gameRunning) {
            fireBullet();
        }
        
        e.preventDefault();
    }, false);
    
    // 按钮事件
    startButton.addEventListener('click', initGame);
    restartButton.addEventListener('click', initGame);
});
