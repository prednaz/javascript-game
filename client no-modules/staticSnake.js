let TEST_CELLSIZE;

window.setInterval(function() {
    movePlayer(gameState);
    drawOnCanvas(canvas, gameState);
}, 1000);

document.addEventListener('keyup', event => {
    gameState.pressedKey = event.code;
});

function movePlayer(gameState) {
    gameState.snake.shift();
    if (gameState.pressedKey === 'ArrowUp') {
        const headNew = gameState.snake[gameState.snake.length-1];
        gameState.snake[gameState.snake.length-1].y--;
        gameState.snake.push(headNew);
    } else if (gameState.pressedKey === 'ArrowRight') {
        const headNew = gameState.snake[gameState.snake.length-1];
        gameState.snake[gameState.snake.length-1].x++;
        gameState.snake.push(headNew);
    } else if (gameState.pressedKey === 'ArrowDown') {
        const headNew = gameState.snake[gameState.snake.length-1];
        gameState.snake[gameState.snake.length-1].y++;
        gameState.snake.push(headNew);
    } else if (gameState.pressedKey === 'ArrowLeft') {
        const headNew = gameState.snake[gameState.snake.length-1];
        gameState.snake[gameState.snake.length-1].x--;
        gameState.snake.push(headNew);
    }
}


function drawLine(x1, y1, x2, y2, context) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

function drawSquare(x, y, cellSize, color, context) {
    context.fillStyle = color;
    context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function drawOnCanvas(canvas, gameState) {
    const context = canvas.getContext('2d');
    
    context.clearRect(0, 0, canvas.width, canvas.height)

    const cellSize = canvas.width / gameState.extent;

    TEST_CELLSIZE = cellSize;

    for (let i = 1; i <= gameState.extent; i++) {
        drawLine(i * cellSize, 0, i * cellSize, canvas.height, context);
        drawLine(0, i * cellSize, canvas.width, i * cellSize, context);
    }

    for (let i = 1; i < gameState.snake.length; i++) {
        if (i === gameState.snake.length -1) {
            drawSquare(
                gameState.snake[i].x,
                gameState.snake[i].y,
                cellSize,
                'yellow',
                context
            );
        }
        else {
            drawSquare(
                gameState.snake[i].x,
                gameState.snake[i].y,
                cellSize,
                'black',
                context 
            );
        }
    }

    drawSquare(
        gameState.apple.x,
        gameState.apple.y,
        cellSize,
        'red',
        context
    );
}

const gameState = {
    pressedKey: 'ArrowRight',
    extent: 8,
    playerPosition: {
        x: 2,
        y: 3
    },
    apple: {
        x: 4,
        y: 5
    },
    snake: [{x: 1, y:2}, 
    {x: 2, y:2},
    {x: 3, y:2},
    {x: 4, y:2},
    {x: 5, y:2}]
}

/*class apple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}*/

const canvas = document.getElementById('myCanvas')

drawOnCanvas(canvas, gameState);
