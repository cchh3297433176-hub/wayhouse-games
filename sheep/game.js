const CARD_TYPES = ['🐑', '🌾', '🥕', '🚜', '🌻', '🍎', '🎀'];
const SLOT_LIMIT = 7;
const CARD_W = 56;
const CARD_H = 74;

let currentLevel = 1;
let slots = [];

function initGame() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    slots = [];
    document.getElementById('slot-area').innerHTML = '';

    const types = CARD_TYPES.slice(0, Math.min(2 + currentLevel, CARD_TYPES.length));
    const cardCount = 3 + currentLevel * 2;

    types.forEach(type => {
        for (let i = 0; i < cardCount; i++) {
            createCard(type, gameBoard);
        }
    });
}

function createCard(type, container) {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = type;

    const maxX = Math.max(container.offsetWidth - CARD_W, 0);
    const maxY = Math.max(container.offsetHeight - CARD_H, 0);
    card.style.left = Math.random() * maxX + 'px';
    card.style.top = Math.random() * maxY + 'px';
    card.style.zIndex = Math.floor(Math.random() * 100);

    card.addEventListener('click', () => handleCardClick(card));
    container.appendChild(card);
}

function handleCardClick(card) {
    if (card.parentElement.id === 'slot-area') return;
    if (isCardCovered(card)) return;
    if (slots.length >= SLOT_LIMIT) return;

    card.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    card.style.zIndex = 999;

    const slotArea = document.getElementById('slot-area');
    const targetX = slots.length * 56 + 8;
    card.style.left = targetX + 'px';
    card.style.top = '0px';

    setTimeout(() => {
        card.style.transition = 'none';
        card.style.left = '';
        card.style.top = '';
        card.style.zIndex = '';
        slotArea.appendChild(card);
        slots.push(card);
        checkMatch();
        checkSlotLimit();
    }, 350);
}

function isCardCovered(card) {
    const rect = card.getBoundingClientRect();
    const cardZ = parseInt(card.style.zIndex);
    return Array.from(document.querySelectorAll('#game-board .card'))
        .some(other => {
            if (other === card) return false;
            const otherZ = parseInt(other.style.zIndex);
            if (otherZ <= cardZ) return false;
            const otherRect = other.getBoundingClientRect();
            const overlap = !(rect.right < otherRect.left ||
                              rect.left > otherRect.right ||
                              rect.bottom < otherRect.top ||
                              rect.top > otherRect.bottom);
            return overlap;
        });
}

function checkSlotLimit() {
    if (slots.length >= SLOT_LIMIT) {
        setTimeout(() => {
            alert('卡槽已满，游戏失败！');
            resetGame();
        }, 300);
    }
}

function checkMatch() {
    if (slots.length < 3) return;

    for (let i = 0; i <= slots.length - 3; i++) {
        const trio = [slots[i], slots[i + 1], slots[i + 2]];
        if (trio[0].textContent === trio[1].textContent &&
            trio[1].textContent === trio[2].textContent) {
            trio.forEach(c => {
                c.style.transform = 'scale(0)';
                c.style.transition = 'transform 0.3s';
                setTimeout(() => c.remove(), 300);
            });
            slots.splice(i, 3);
            setTimeout(() => {
                checkWin();
                checkMatch();
            }, 350);
            return;
        }
    }
}

function checkWin() {
    const remaining = document.querySelectorAll('#game-board .card').length;
    if (remaining === 0 && slots.length === 0) {
        setTimeout(() => {
            if (confirm(`恭喜通过第${currentLevel}关！进入下一关？`)) {
                currentLevel++;
                document.getElementById('level').textContent = currentLevel;
                initGame();
            }
        }, 500);
    }
}

function resetGame() {
    currentLevel = 1;
    document.getElementById('level').textContent = currentLevel;
    initGame();
}

function toggleHelp() {
    const modal = document.getElementById('help-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

window.addEventListener('load', initGame);
window.addEventListener('resize', () => {
    const board = document.getElementById('game-board');
    document.querySelectorAll('#game-board .card').forEach(card => {
        const maxX = Math.max(board.offsetWidth - CARD_W, 0);
        const maxY = Math.max(board.offsetHeight - CARD_H, 0);
        const curX = parseFloat(card.style.left);
        const curY = parseFloat(card.style.top);
        if (curX > maxX) card.style.left = maxX + 'px';
        if (curY > maxY) card.style.top = maxY + 'px';
    });
});
