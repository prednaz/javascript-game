function helloWorld(name) {
    return 'Hello ' + name + '!';
}

function doSomethingOnCanvas() {
    const canvas = document.getElementById('myCanvas');
    const context = canvas.getContext('2d');

    context.fillStyle = 'red';
    context.fillRect(0, 20, 30, 55);
}

console.log(helloWorld('JavaScript'));
doSomethingOnCanvas();