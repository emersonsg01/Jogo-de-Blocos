// Configurações do jogo
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const GAME_TIME = 240; // Tempo de jogo em segundos
const COLORS = [
    '#000000', // Preto (fundo)
    '#FF0000', // Vermelho (I)
    '#00FF00', // Verde (J)
    '#0000FF', // Azul (L)
    '#FFFF00', // Amarelo (O)
    '#FF00FF', // Magenta (S)
    '#00FFFF', // Ciano (Z)
    '#FFA500'  // Laranja (T)
];

// Formas das peças (tetrominós)
const SHAPES = [
    [], // Espaço vazio para índice 0
    [ // I
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [ // J
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
    ],
    [ // L
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
    ],
    [ // O
        [4, 4],
        [4, 4]
    ],
    [ // S
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
    ],
    [ // Z
        [6, 6, 0],
        [0, 6, 6],
        [0, 0, 0]
    ],
    [ // T
        [0, 7, 0],
        [7, 7, 7],
        [0, 0, 0]
    ]
];

// Variáveis do jogo
let canvas, ctx;
let nextPieceCanvas, nextPieceCtx;
let board;
let currentPiece, nextPiece;
let score;
let level = 1;
let gameOver;
let gameLoop;
let timerInterval;
let remainingTime = GAME_TIME; // Tempo restante em segundos
let baseDropInterval = 1000; // Tempo base em ms para a peça cair um bloco
let dropInterval = baseDropInterval; // Tempo atual em ms para a peça cair um bloco
let lastDropTime;

// Inicialização do jogo
window.onload = function() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    nextPieceCanvas = document.getElementById('next-piece');
    nextPieceCtx = nextPieceCanvas.getContext('2d');
    
    // Adicionar event listeners para controles
    document.addEventListener('keydown', handleKeyPress);
    
    // Detectar dispositivo móvel e configurar controles de toque
    setupMobileControls();
    
    // Iniciar o jogo
    startGame();
};

// Função para iniciar/reiniciar o jogo
function startGame() {
    // Inicializar o tabuleiro (matriz)
    board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    
    // Resetar pontuação e nível
    score = 0;
    level = 1;
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    
    // Resetar timer
    remainingTime = GAME_TIME;
    document.getElementById('timer').textContent = formatTime(remainingTime);
    
    // Resetar velocidade de queda
    dropInterval = baseDropInterval;
    
    // Esconder tela de game over
    document.getElementById('game-over').style.display = 'none';
    
    // Criar peça atual e próxima peça
    currentPiece = createPiece();
    nextPiece = createPiece();
    
    // Resetar estado do jogo
    gameOver = false;
    
    // Limpar intervalos anteriores se existirem
    if (gameLoop) clearInterval(gameLoop);
    if (timerInterval) clearInterval(timerInterval);
    
    // Iniciar loop do jogo
    lastDropTime = Date.now();
    gameLoop = setInterval(update, 30); // Atualizar a cada 30ms
    
    // Iniciar timer
    timerInterval = setInterval(updateTimer, 1000); // Atualizar a cada segundo
    
    // Desenhar o jogo inicial
    draw();
}

// Função para criar uma nova peça aleatória
function createPiece() {
    const shapeIndex = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    const shape = SHAPES[shapeIndex];
    
    return {
        shape: shape,
        color: shapeIndex,
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0
    };
}

// Função principal de atualização do jogo
function update() {
    const now = Date.now();
    const delta = now - lastDropTime;
    
    if (delta > dropInterval) {
        movePiece(0, 1);
        lastDropTime = now;
    }
    
    draw();
}

// Função para atualizar o timer
function updateTimer() {
    if (gameOver) return;
    
    remainingTime--;
    document.getElementById('timer').textContent = formatTime(remainingTime);
    
    if (remainingTime <= 0) {
        // Tempo acabou, fim de jogo
        gameOver = true;
        clearInterval(gameLoop);
        clearInterval(timerInterval);
        document.getElementById('game-over').style.display = 'block';
        document.getElementById('final-score').textContent = score;
    }
}

// Função para formatar o tempo (MM:SS)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Função para desenhar o jogo
function draw() {
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar o tabuleiro
    drawBoard();
    
    // Desenhar a peça atual
    drawPiece(ctx, currentPiece);
    
    // Desenhar a próxima peça no canvas secundário
    drawNextPiece();
}

// Desenhar o tabuleiro com as peças fixas
function drawBoard() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x] !== 0) {
                drawBlock(ctx, x, y, board[y][x]);
            }
        }
    }
}

// Desenhar um bloco individual
function drawBlock(context, x, y, colorIndex) {
    const color = COLORS[colorIndex];
    
    // Desenhar o bloco principal
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // Desenhar borda 3D
    context.fillStyle = lightenColor(color, 30);
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, 2);
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, 2, BLOCK_SIZE);
    
    context.fillStyle = darkenColor(color, 30);
    context.fillRect(x * BLOCK_SIZE + BLOCK_SIZE - 2, y * BLOCK_SIZE, 2, BLOCK_SIZE);
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE + BLOCK_SIZE - 2, BLOCK_SIZE, 2);
}

// Função auxiliar para clarear uma cor
function lightenColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

// Função auxiliar para escurecer uma cor
function darkenColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

// Desenhar a peça atual
function drawPiece(context, piece) {
    const shape = piece.shape;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x] !== 0) {
                drawBlock(context, piece.x + x, piece.y + y, piece.color);
            }
        }
    }
}

// Desenhar a próxima peça
function drawNextPiece() {
    // Limpar canvas da próxima peça
    nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    
    const shape = nextPiece.shape;
    const blockSize = 20; // Tamanho menor para o preview
    
    // Calcular posição central
    const offsetX = (nextPieceCanvas.width - shape[0].length * blockSize) / 2;
    const offsetY = (nextPieceCanvas.height - shape.length * blockSize) / 2;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x] !== 0) {
                // Desenhar bloco com tamanho menor
                nextPieceCtx.fillStyle = COLORS[nextPiece.color];
                nextPieceCtx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                
                // Borda 3D
                nextPieceCtx.fillStyle = lightenColor(COLORS[nextPiece.color], 30);
                nextPieceCtx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, 2);
                nextPieceCtx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, 2, blockSize);
                
                nextPieceCtx.fillStyle = darkenColor(COLORS[nextPiece.color], 30);
                nextPieceCtx.fillRect(offsetX + x * blockSize + blockSize - 2, offsetY + y * blockSize, 2, blockSize);
                nextPieceCtx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize + blockSize - 2, blockSize, 2);
            }
        }
    }
}

// Mover a peça atual
function movePiece(dx, dy) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    
    // Verificar colisão
    if (hasCollision()) {
        // Reverter movimento
        currentPiece.x -= dx;
        currentPiece.y -= dy;
        
        // Se a colisão foi ao mover para baixo, fixar a peça
        if (dy > 0) {
            lockPiece();
            clearLines();
            
            // Criar nova peça
            currentPiece = nextPiece;
            nextPiece = createPiece();
            
            // Verificar game over
            if (hasCollision()) {
                gameOver = true;
                clearInterval(gameLoop);
                document.getElementById('game-over').style.display = 'block';
                document.getElementById('final-score').textContent = score;
            }
        }
        
        return false;
    }
    
    return true;
}

// Rotacionar a peça atual
function rotatePiece() {
    const originalShape = currentPiece.shape;
    const rows = originalShape.length;
    const cols = originalShape[0].length;
    
    // Criar nova matriz rotacionada
    const rotatedShape = Array.from({length: cols}, () => Array(rows).fill(0));
    
    // Preencher a matriz rotacionada
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            rotatedShape[x][rows - 1 - y] = originalShape[y][x];
        }
    }
    
    // Salvar a forma original
    const originalPiece = {...currentPiece};
    
    // Atualizar a forma
    currentPiece.shape = rotatedShape;
    
    // Se houver colisão após rotação, reverter
    if (hasCollision()) {
        currentPiece.shape = originalShape;
        return false;
    }
    
    return true;
}

// Verificar colisão da peça atual com o tabuleiro ou bordas
function hasCollision() {
    const shape = currentPiece.shape;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x] !== 0) {
                const boardX = currentPiece.x + x;
                const boardY = currentPiece.y + y;
                
                // Verificar limites do tabuleiro
                if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                    return true;
                }
                
                // Verificar colisão com peças existentes
                if (boardY >= 0 && board[boardY][boardX] !== 0) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// Fixar a peça atual no tabuleiro
function lockPiece() {
    const shape = currentPiece.shape;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x] !== 0) {
                const boardX = currentPiece.x + x;
                const boardY = currentPiece.y + y;
                
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                }
            }
        }
    }
}

// Verificar e limpar linhas completas
function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        // Verificar se a linha está completa
        if (board[y].every(cell => cell !== 0)) {
            // Remover a linha
            board.splice(y, 1);
            // Adicionar nova linha vazia no topo
            board.unshift(Array(COLS).fill(0));
            // Incrementar contador de linhas e pontuação
            linesCleared++;
            // Manter o mesmo índice para verificar a próxima linha
            y++;
        }
    }
    
    // Atualizar pontuação baseado no número de linhas limpas
    if (linesCleared > 0) {
        // Sistema de pontuação: mais linhas de uma vez = mais pontos por linha
        const points = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4 linhas
        score += points[linesCleared] || points[points.length - 1];
        document.getElementById('score').textContent = score;
        
        // Atualizar nível a cada 1000 pontos
        const newLevel = Math.floor(score / 1000) + 1;
        if (newLevel > level) {
            level = newLevel;
            document.getElementById('level').textContent = level;
            
            // Aumentar velocidade com base no nível (0.25x mais rápido por nível)
            dropInterval = baseDropInterval / (1 + (level - 1) * 0.25);
        }
    }
}

// Manipular eventos de teclado
function handleKeyPress(event) {
    if (gameOver) return;
    
    switch(event.keyCode) {
        case 37: // Seta esquerda
            movePiece(-1, 0);
            break;
        case 39: // Seta direita
            movePiece(1, 0);
            break;
        case 40: // Seta para baixo
            movePiece(0, 1);
            break;
        case 38: // Seta para cima (rotacionar)
            rotatePiece();
            break;
        case 32: // Espaço (queda rápida)
            dropPiece();
            break;
    }
    
    draw();
}

// Função para queda rápida da peça
function dropPiece() {
    while (movePiece(0, 1)) {
        // Continuar movendo para baixo até colidir
    }
}

// Configurar controles para dispositivos móveis
function setupMobileControls() {
    // Verificar se é um dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Mostrar controles móveis
        document.getElementById('mobile-controls').style.display = 'block';
        
        // Configurar event listeners para os botões
        document.getElementById('left-btn').addEventListener('click', function() {
            movePiece(-1, 0);
            draw();
        });
        
        document.getElementById('right-btn').addEventListener('click', function() {
            movePiece(1, 0);
            draw();
        });
        
        document.getElementById('down-btn').addEventListener('click', function() {
            movePiece(0, 1);
            draw();
        });
        
        document.getElementById('rotate-btn').addEventListener('click', function() {
            rotatePiece();
            draw();
        });
        
        document.getElementById('drop-btn').addEventListener('click', function() {
            dropPiece();
            draw();
        });
    }
}