document.addEventListener('DOMContentLoaded', () => {
    const playerScoreElement = document.getElementById('player-score');
    const computerScoreElement = document.getElementById('computer-score');
    const drawsElement = document.getElementById('draws');
    const resultElement = document.getElementById('result');
    const historyList = document.getElementById('history-list');
    const resetButton = document.getElementById('reset-btn');
    const choiceButtons = document.querySelectorAll('.choice-btn');
    
    let playerScore = 0;
    let computerScore = 0;
    let draws = 0;
    
    // 游戏选项
    const choices = ['rock', 'paper', 'scissors'];
    const choiceEmojis = {
        rock: '✊',
        paper: '✋',
        scissors: '✌️'
    };
    
    // 游戏逻辑
    function playGame(playerChoice) {
        // 电脑随机选择
        const computerChoice = choices[Math.floor(Math.random() * 3)];
        
        // 决定胜负
        let result;
        if (playerChoice === computerChoice) {
            result = 'draw';
            draws++;
            drawsElement.textContent = draws;
        } else if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            result = 'win';
            playerScore++;
            playerScoreElement.textContent = playerScore;
        } else {
            result = 'lose';
            computerScore++;
            computerScoreElement.textContent = computerScore;
        }
        
        // 显示结果
        showResult(playerChoice, computerChoice, result);
        
        // 添加到历史记录
        addToHistory(playerChoice, computerChoice, result);
    }
    
    // 显示结果
    function showResult(playerChoice, computerChoice, result) {
        let resultText;
        let resultClass;
        
        switch (result) {
            case 'win':
                resultText = `你赢了! ${choiceEmojis[playerChoice]} 胜过 ${choiceEmojis[computerChoice]}`;
                resultClass = 'win';
                break;
            case 'lose':
                resultText = `你输了! ${choiceEmojis[computerChoice]} 胜过 ${choiceEmojis[playerChoice]}`;
                resultClass = 'lose';
                break;
            case 'draw':
                resultText = `平局! 都是 ${choiceEmojis[playerChoice]}`;
                resultClass = 'draw';
                break;
        }
        
        resultElement.innerHTML = `<p class="${resultClass}">${resultText}</p>`;
    }
    
    // 添加到历史记录
    function addToHistory(playerChoice, computerChoice, result) {
        const listItem = document.createElement('li');
        let resultText;
        let resultClass;
        
        switch (result) {
            case 'win':
                resultText = '获胜';
                resultClass = 'win';
                break;
            case 'lose':
                resultText = '失败';
                resultClass = 'lose';
                break;
            case 'draw':
                resultText = '平局';
                resultClass = 'draw';
                break;
        }
        
        listItem.innerHTML = `
            <span class="${resultClass}">
                ${choiceEmojis[playerChoice]} vs ${choiceEmojis[computerChoice]} - ${resultText}
            </span>
        `;
        
        historyList.insertBefore(listItem, historyList.firstChild);
        
        // 限制历史记录数量
        if (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
    }
    
    // 重置游戏
    function resetGame() {
        playerScore = 0;
        computerScore = 0;
        draws = 0;
        
        playerScoreElement.textContent = playerScore;
        computerScoreElement.textContent = computerScore;
        drawsElement.textContent = draws;
        
        resultElement.innerHTML = '<p>选择石头、剪刀或布开始游戏</p>';
        historyList.innerHTML = '';
    }
    
    // 事件监听
