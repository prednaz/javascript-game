class Snake {
    constructor(x, y, pressedKey, cellSize, context) {
        this.x = x;
        this.y = y;
        this.pressedKey = pressedKey;
        this.cellSize = cellSize;
        this.context = context;


        // EventListener mit bin
        document.addEventListener('keyup', this.handleKeyUp.bind(this))

        // EventListener mit Arrow-Funktion
        // document.addEventListener('keyup', event => {
        //     this.handleKeyUp(event);
        // });
    }

    handleKeyUp(event) {
        if (event.key === 'ArrowRight' ||
            event.key === 'ArrowLeft' ||
            event.key === 'ArrowUp' ||
            event.key === 'ArrowDown') {
            this.pressedKey = event.key;
        }
    }

    draw() {
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
}


    update() {
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
}

class Game {
    constructor(canvas, extent) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.extent = extent;
        this.cellSize = this.canvas.width / this.extent;

        this.square = new Snake(2, 3, 'ArrowRight', this.cellSize, this.context, this.assets);

        setInterval(this.loop.bind(this), 500);

    }

    drawLine(x1, y1, x2, y2) {
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }

    drawGrid() {
        for (let i = 1; i < this.extent; i++) {
            this.drawLine(0, i * this.cellSize, this.canvas.width, i * this.cellSize);
            this.drawLine(i * this.cellSize, 0, i * this.cellSize, this.canvas.height);
        }
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid();
        this.square.draw();
    }

    update() {
        this.square.update();
    }

    loop() {
        this.update();
        this.draw();
    }
}


new Game(document.getElementById('myCanvas'), 8)


