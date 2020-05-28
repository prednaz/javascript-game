let TEST_CELLSIZE;
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

window.setInterval(function() {
    if(gameState.isalive) {
    movePlayer(gameState);
    drawOnCanvas(canvas, gameState);
    }
}, 200);


function movePlayer(gameState) {
    const headNew = Object.assign({}, gameState.snake[gameState.snake.length-1]);
        
    
    if (gameState.pressedKey === 'ArrowUp') {
        headNew.y--;
        gameState.snake.push(headNew);
    } else if (gameState.pressedKey === 'ArrowRight') {
        headNew.x++;
        gameState.snake.push(headNew);
    } else if (gameState.pressedKey === 'ArrowDown') {
        headNew.y++;
        gameState.snake.push(headNew);
    } else if (gameState.pressedKey === 'ArrowLeft') {
        headNew.x--;
        gameState.snake.push(headNew);
    }
    for (let i=0; i<gameState.snake.length-1; i++) {
        if(headNew.x === gameState.snake[i].x  && headNew.y === gameState.snake[i].y){
            gameState.isalive = false;
        }
    }
    if (!(gameState.apple.x === headNew.x && gameState.apple.y === headNew.y)){
        gameState.snake.shift();
    }
    if ((gameState.apple.x === headNew.x && gameState.apple.y === headNew.y)){    
        const newApple = {x: 0, y: 0};
        newApple.x = getRandomInt(8);
        newApple.y = getRandomInt(8);
    for (let i=0; i<gameState.snake.length; i++) {
        if (newApple.x === gameState.snake[i].x  && newApple.y === gameState.snake[i].y) {
            newApple.x = getRandomInt(8);
            newApple.y = getRandomInt(8);
            i = 0;
            }
    }        
    gameState.apple = newApple;
}
    if (headNew.x < 0 || headNew.x > 7 || headNew.y < 0 || headNew.y > 7){
        gameState.isalive = false;
    }
}


document.addEventListener('keyup', event => {
    gameState.pressedKey = event.key;
    console.log(event.key);
});

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
    {x: 5, y:2}],

    isalive: true,
   }
    

/*class apple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}*/

const canvas = document.getElementById('myCanvas')

drawOnCanvas(canvas, gameState);
