document.addEventListener('DOMContentLoaded', () => {
    const memoryBoard = document.getElementById('memory-board');
    const timeDisplay = document.getElementById('time');
    const movesDisplay = document.getElementById('moves');
    const restartBtn = document.getElementById('restart-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const winMessage = document.getElementById('win-message');
    const finalTimeDisplay = document.getElementById('final-time');
    const finalMovesDisplay = document.getElementById('final-moves');
    
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let time = 0;
    let timer;
    let gameStarted = false;
    
    // 卡片符号
    const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    
    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        time = 0;
        gameStarted = false;
        
        // 清空游戏板
        memoryBoard.innerHTML = '';
        
        // 隐藏胜利消息
        winMessage.classList.add('hidden');
        
        // 更新显示
        movesDisplay.textContent = moves;
        timeDisplay.textContent = time;
        
        // 创建卡片对
        const cardPairs = [...symbols, ...symbols];
        
        // 洗牌
        const shuffledCards = shuffleArray(cardPairs);
        
        // 创建卡片元素
        shuffledCards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.symbol = symbol;
            card.dataset.index = index;
            card.textContent = '?';
            card.addEventListener('click', flipCard);
            memoryBoard.appendChild(card);
            cards.push(card);
        });
    }
    
    // 洗牌函数
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    // 翻牌
    function flipCard() {
        // 如果游戏还没开始，开始计时
        if (!gameStarted) {
            startTimer();
            gameStarted = true;
        }
        
        // 如果已经翻开或已匹配，则不做任何操作
        if (this.classList.contains('flipped') || 
            this.classList.contains('matched') || 
            flippedCards.length >= 2) {
            return;
        }
        
        // 翻开卡片
        this.classList.add('flipped');
        this.textContent = this.dataset.symbol;
        flippedCards.push(this);
        
        // 如果翻开了两张卡片，检查是否匹配
        if (flippedCards.length === 2) {
            moves++;
            movesDisplay.textContent = moves;
            
            if (flippedCards[0].dataset.symbol === flippedCards[1].dataset.symbol) {
                // 匹配成功
                flippedCards.forEach(card => {
                    card.classList.add('matched');
                });
                flippedCards = [];
                matchedPairs++;
                
                // 检查游戏是否结束
                if (matchedPairs === symbols.length) {
                    endGame();
                }
            } else {
                // 不匹配，翻回去
                setTimeout(() => {
                    flippedCards.forEach(card => {
                        card.classList.remove('flipped');
                        card.textContent = '?';
                    });
                    flippedCards = [];
                }, 1000);
            }
        }
    }
    
    // 开始计时
    function startTimer() {
        clearInterval(timer);
        timer = setInterval(() => {
            time++;
            timeDisplay.textContent = time;
        }, 1000);
    }
    
    // 结束游戏
    function endGame() {
        clearInterval(timer);
        finalTimeDisplay.textContent = time;
        finalMovesDisplay.textContent = moves;
        winMessage.classList.remove('hidden');
    }
    
    // 事件监听
    restartBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', initGame);
    
    // 初始化游戏
    initGame();
});
