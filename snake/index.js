"use strict";

let TEST_CELLSIZE; // to-do. Do we still need that?

const canvas = document.getElementById('myCanvas')

class Game {
    constructor(assets) {
        this.pressedKey = "ArrowRight";
        this.extent = 8;
        this.playerPosition = {x: 2, y: 3}; // to-do. Do we still need this?
        this.apple = new Apple(4, 5);
        this.snake = new Snake(
            [
                {x: 1, y:2},
                {x: 2, y:2},
                {x: 3, y:2},
                {x: 4, y:2},
                {x: 5, y:2}
            ]
        );
        this.game_over = false;
        this.assets = assets;
        document.addEventListener('keyup', event => {
            if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowRight") {
                this.pressedKey = event.key;
                console.log(event.key); // to-do. Do we still need this?
            }
        });
        window.setInterval(() => {
            if(!this.game_over) { // to-do. Can we clear the interval altogether?
                this.update();
                this.draw();
            }
        }, 500);
    }
    update() {
        this.snake.update(this.pressedKey, this.apple);
        this.game_over = !this.snake.isalive;
        this.apple.update(this.snake.positions);
    }
    draw() {
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height)

        const cellSize = canvas.width / this.extent;
        const cellSizeImage = 32;

        TEST_CELLSIZE = cellSize; // to-do. Do we still need that?

        for (let i = 0; i < this.extent; ++i) {
            for (let j = 0; j < this.extent; ++j) {
                this.drawImageSquare(i, j, cellSize, 3, 3, cellSizeImage, context);
            }
        }

        for (let i = 1; i < this.extent; i++) {
            drawLine(i * cellSize, 0, i * cellSize, canvas.height, context);
            drawLine(0, i * cellSize, canvas.width, i * cellSize, context);
        }

        this.snake.draw(this.pressedKey, context, cellSize, cellSizeImage, this.drawImageSquare.bind(this));

        this.apple.draw(context, cellSize, cellSizeImage, this.drawImageSquare.bind(this));
    }
    drawImageSquare(xCanvas, yCanvas, cellSizeCanvas, xImage, yImage, cellSizeImage, context) {
        context.drawImage(
            this.assets.snake,
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
}

class Apple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.eaten = false;
    }
    eat() {
        this.eaten = true;
    }
    update(snake_positions) {
        if (!this.eaten) {
            return;
        }
        this.eaten = false;
        this.x = getRandomInt(8); // to-do. use "Game::extent" instead of "8"
        this.y = getRandomInt(8); // to-do. use "Game::extent" instead of "8"
        for (let i=0; i<snake_positions.length; i++) {
            if (this.x === snake_positions[i].x  && this.y === snake_positions[i].y) {
                this.x = getRandomInt(8); // to-do. use "Game::extent" instead of "8"
                this.y = getRandomInt(8); // to-do. use "Game::extent" instead of "8"
                i = 0;
            }
        }
    }
    draw(context, cellSize, cellSizeImage, drawImageSquare) {
        drawImageSquare(this.x, this.y, cellSize, 2, 3, cellSizeImage, context);
    }
}

class Snake {
    constructor(positions) {
        this.positions = positions;
        this.isalive = true;
    }
    update(pressedKey, apple) {
        const headNew = Object.assign({}, this.positions[this.positions.length-1]);
        if (pressedKey === 'ArrowUp') {
            headNew.y--;
            this.positions.push(headNew); // to-do. Is this statement always executed? In that case it might better be outside any if branches and only once.
        } else if (pressedKey === 'ArrowRight') {
            headNew.x++;
            this.positions.push(headNew);
        } else if (pressedKey === 'ArrowDown') {
            headNew.y++;
            this.positions.push(headNew);
        } else if (pressedKey === 'ArrowLeft') {
            headNew.x--;
            this.positions.push(headNew);
        }
        if (!(apple.x === headNew.x && apple.y === headNew.y)) {
            this.positions.shift();
        }
        if ((apple.x === headNew.x && apple.y === headNew.y)) { // to-do. Could this be an else branch?
            apple.eat();
        }
        for (let i=0; i<this.positions.length-1; i++) {
            if (headNew.x === this.positions[i].x && headNew.y === this.positions[i].y) {
                this.isalive = false; // to-do. Do we really have to continue with the loop at this point?
            }
        }
        if (headNew.x < 0 || headNew.x > 7 || headNew.y < 0 || headNew.y > 7) { // to-do. use "Game::extent" instead of "7"
            this.isalive = false;
        }
    }
    draw(pressedKey, context, cellSize, cellSizeImage, drawImageSquare) {
        for (let i = 0; i < this.positions.length; i++) {
            if (i === this.positions.length -1) {
                if (pressedKey === "ArrowUp"){
                    drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 0, 0, cellSizeImage, context);
                }
                else if (pressedKey === "ArrowRight"){
                    drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 1, 0, cellSizeImage, context);
                }
                else if (pressedKey === "ArrowDown") {
                    drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 2, 0, cellSizeImage, context);
                }
                else if (pressedKey === "ArrowLeft"){
                    drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 3, 0, cellSizeImage, context);
                }
            }
            else if (i === 0) {
                    if (this.positions[0].x === this.positions[1].x && this.positions[0].y === this.positions[1].y + 1) {
                        drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 0, 1, cellSizeImage, context);
                    }
                    if (this.positions[0].x === this.positions[1].x && this.positions[0].y === this.positions[1].y - 1) {
                        drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 2, 1, cellSizeImage, context);
                    }
                    if (this.positions[0].x + 1 === this.positions[1].x && this.positions[0].y === this.positions[1].y) {
                        drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 1, 1, cellSizeImage, context);
                    }
                    if (this.positions[0].x - 1 === this.positions[1].x && this.positions[0].y === this.positions[1].y) {
                        drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 3, 1, cellSizeImage, context);
                    }
                }
            else {
                if (this.positions[i].x === this.positions[i+1].x && this.positions[i].y - 1 === this.positions[i+1].y) {
                    if (this.positions[i].x - 1 === this.positions[i-1].x  && this.positions[i].y === this.positions[i-1].y) {
                        drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 3, 2, cellSizeImage, context);
                    }
                    if (this.positions[i].x + 1=== this.positions[i-1].x && this.positions[i].y === this.positions[i-1].y) {
                        drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 0, 2, cellSizeImage, context);
                    }
                    if (this.positions[i].x === this.positions[i-1].x  && this.positions[i].y + 1 === this.positions[i-1].y) {
                        drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 0, 3, cellSizeImage, context);
                    }
                }
                else if (this.positions[i].x === this.positions[i+1].x && this.positions[i].y + 1 === this.positions[i+1].y) {
                    if (this.positions[i].x - 1 === this.positions[i-1].x && this.positions[i].y === this.positions[i-1].y) {
                        drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 2, 2, cellSizeImage, context);
                    }
                    if (this.positions[i].x + 1 === this.positions[i-1].x && this.positions[i].y === this.positions[i-1].y) {
                        drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 1, 2, cellSizeImage, context);
                    }
                    if (this.positions[i].x === this.positions[i-1].x  && this.positions[i].y - 1 === this.positions[i-1].y) {
                        drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 0, 3, cellSizeImage, context);
                    }
                }
                else if (this.positions[i].x - 1 === this.positions[i+1].x && this.positions[i].y === this.positions[i+1].y) {
                    if (this.positions[i].x + 1 === this.positions[i-1].x && this.positions[i].y === this.positions[i-1].y) {
                       drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 1, 3, cellSizeImage, context);
                    }
                    if (this.positions[i].x === this.positions[i-1].x  && this.positions[i].y - 1 === this.positions[i-1].y) {
                        drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 3, 2, cellSizeImage, context);
                    }
                    if (this.positions[i].x === this.positions[i-1].x  && this.positions[i].y + 1 === this.positions[i-1].y) {
                        drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 2, 2, cellSizeImage, context);
                    }
                }
                else if (this.positions[i].x + 1 === this.positions[i+1].x && this.positions[i].y === this.positions[i+1].y) {
                    if (this.positions[i].x - 1 === this.positions[i-1].x && this.positions[i].y === this.positions[i-1].y) {
                        drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 1, 3, cellSizeImage, context);
                    }
                    if (this.positions[i].x === this.positions[i-1].x && this.positions[i].y - 1 === this.positions[i-1].y) {
                        drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 0, 2, cellSizeImage, context);
                    }
                    if (this.positions[i].x === this.positions[i-1].x  && this.positions[i].y + 1 === this.positions[i-1].y) {
                        drawImageSquare(this.positions[i].x, this.positions[i].y, cellSize, 1, 2, cellSizeImage, context);
                    }
                }
            }
        }
    }
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
    .then(assetsNew => {new Game(assetsNew);});

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
