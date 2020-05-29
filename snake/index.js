// to-do. Bug: Pressing the space key causes the snake to stop and shrink.

let TEST_CELLSIZE; // to-do. Do we still need that?

const canvas = document.getElementById('myCanvas')

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
    snake: [
        {x: 1, y:2},
        {x: 2, y:2},
        {x: 3, y:2},
        {x: 4, y:2},
        {x: 5, y:2}
    ],
    isalive: true,
    assets: null
}

document.addEventListener('keyup', event => {
    gameState.pressedKey = event.key;
    console.log(event.key); // to-do. Do we still need this?
});

function update(gameState) {
    const headNew = Object.assign({}, gameState.snake[gameState.snake.length-1]);
    if (gameState.pressedKey === 'ArrowUp') {
        headNew.y--;
        gameState.snake.push(headNew); // to-do. Is this statement always executed? In that case it might better be outside any if branches and only once.
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
    if (!(gameState.apple.x === headNew.x && gameState.apple.y === headNew.y)) {
        gameState.snake.shift();
    }
    if ((gameState.apple.x === headNew.x && gameState.apple.y === headNew.y)) { // to-do. Could this be an else branch?
        const newApple = {x: 0, y: 0};
        newApple.x = getRandomInt(8); // to-do. use "gameState.extent" instead of "8"
        newApple.y = getRandomInt(8); // to-do. use "gameState.extent" instead of "8"
        for (let i=0; i<gameState.snake.length; i++) {
            if (newApple.x === gameState.snake[i].x  && newApple.y === gameState.snake[i].y) {
                newApple.x = getRandomInt(8); // to-do. use "gameState.extent" instead of "8"
                newApple.y = getRandomInt(8); // to-do. use "gameState.extent" instead of "8"
                i = 0;
            }
        }
        gameState.apple = newApple;
    }
    for (let i=0; i<gameState.snake.length-1; i++) {
        if (headNew.x === gameState.snake[i].x && headNew.y === gameState.snake[i].y) {
            gameState.isalive = false;
        }
    }
    if (headNew.x < 0 || headNew.x > 7 || headNew.y < 0 || headNew.y > 7) { // to-do. use "gameState.extent" instead of "7"
        gameState.isalive = false;
    }
}

function draw(canvas, gameState) {
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height)

    const cellSize = canvas.width / gameState.extent;
    const cellSizeImage = 32;

    TEST_CELLSIZE = cellSize; // to-do. Do we still need that?

    for (let i = 1; i <= gameState.extent; i++) {
        drawLine(i * cellSize, 0, i * cellSize, canvas.height, context);
        drawLine(0, i * cellSize, canvas.width, i * cellSize, context);
    }

    for (let i = 0; i < gameState.snake.length; i++) {
        if (i === gameState.snake.length -1) {
            if (gameState.pressedKey === "ArrowUp"){
                drawImageSquare(gameState.snake[i].x, gameState.snake[i].y, cellSize, 0, 0, cellSizeImage, context);
            }
            else if (gameState.pressedKey === "ArrowRight"){
                drawImageSquare(gameState.snake[i].x, gameState.snake[i].y, cellSize, 1, 0, cellSizeImage, context);
            }
            else if (gameState.pressedKey === "ArrowDown") {
                drawImageSquare(gameState.snake[i].x, gameState.snake[i].y, cellSize, 2, 0, cellSizeImage, context);
            }
            else if (gameState.pressedKey === "ArrowLeft"){
                drawImageSquare(gameState.snake[i].x, gameState.snake[i].y, cellSize, 3, 0, cellSizeImage, context);
            }
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

function drawImageSquare(xCanvas, yCanvas, cellSizeCanvas, xImage, yImage, cellSizeImage, context) {
    context.drawImage(
        gameState.assets.snake,
        xImage * cellSizeImage,
        yImage * cellSizeImage,
        cellSizeImage,
        cellSizeImage,
        xCanvas * cellSizeCanvas,
        yCanvas * cellSizeCanvas,
        cellSizeCanvas,
        cellSizeCanvas
    );
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

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

class AssetLoader {
    loadAsset(name, url) {
        return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;
        image.addEventListener('load', function() {
            return resolve({ name, image: this });
        });
        });
    }
    
    loadAssets(assetsToLoad) {
        return Promise.all(
        assetsToLoad.map(asset => this.loadAsset(asset.name, asset.url))
        )
        .then(assets =>
            assets.reduceRight(
            (acc, elem) => ({ ...acc, [elem.name]: elem.image }),
            {}
            )
        )
        .catch(error => {
            throw new Error('Not all assets could be loaded.');
        });
    }
}

new AssetLoader()
    .loadAssets([{
        name: 'snake',
        url: 'snake.png'
    }])
    .then(assetsNew => {
        gameState.assets = assetsNew;
        window.setInterval(function() {
            if(gameState.isalive) { // to-do. Can we clear the interval altogether?
                update(gameState);
                draw(canvas, gameState);
            }
        }, 500);        
    });
