class Square {
    constructor(x, y, pressedKey, cellSize, context, assets) {
        this.x = x;
        this.y = y;
        this.pressedKey = pressedKey;
        this.cellSize = cellSize;
        this.context = context;
        this.assets = assets;
        this.spritePositions = {
            ArrowUp: {
                x: 48,
                y: 0
            },
            ArrowDown: {
                x: 0,
                y: 48
            },
            ArrowLeft: {
                x: 0,
                y: 0
            },
            ArrowRight: {
                x: 48,
                y: 48
            }
        }


        // EventListener mit bin
        document.addEventListener('keyup', this.handleKeyUp.bind(this))

        // EventListener mit Arrow-Funktion
        // document.addEventListener('keyup', event => {
        //     this.handleKeyUp(event);
        // });
    }

    handleKeyUp(event) {
        if (event.code === 'ArrowRight' ||
            event.code === 'ArrowLeft' ||
            event.code === 'ArrowUp' ||
            event.code === 'ArrowDown') {
            this.pressedKey = event.code;
        }
    }

    draw() {

        this.context.drawImage(
            this.assets.chicken,
            this.spritePositions[this.pressedKey].x,
            this.spritePositions[this.pressedKey].y, 
            48,
            48,
            this.x * this.cellSize,
            this.y * this.cellSize,
            this.cellSize,
            this.cellSize
        )


        this.context.fillStyle = 'red';
        this.context.fillRect(this.x * this.cellSize, this.y * this.cellSize, this.cellSize, this.cellSize);
    }

    update() {
        if (this.pressedKey === 'ArrowRight') {
            this.x += 1;
        } else if (this.pressedKey === 'ArrowDown') {
            this.y += 1;
        } else if (this.pressedKey === 'ArrowLeft') {
            this.x -= 1;
        } else if (this.pressedKey === 'ArrowUp') {
            this.y -= 1;
        }
    }

}

class Game {
    constructor(canvas, extent, assets) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.extent = extent;
        this.cellSize = this.canvas.width / this.extent;
        this.assets = assets;

        this.square = new Square(2, 3, 'ArrowRight', this.cellSize, this.context, this.assets);

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

new Game(document.getElementById('myCanvas'), 8)

new AssetLoader()
    .loadAssets([{
        name: 'chicken',
        url: '/chicken.png'
    }])
    .then(assets => {
        const game = new Game(document.getElementById('myCanvas'), 8, assets);
    });
