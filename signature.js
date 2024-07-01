const canvas = document.getElementById('signature-pad');
const ctx = canvas.getContext('2d');
let drawing = false;
let paths = [];
let undonePaths = [];
let penSize = document.getElementById('pen-size').value;
let penColor = document.getElementById('pen-color').value;
let lastX = 0;
let lastY = 0;

function resizeCanvas() {
    const containerWidth = document.querySelector('.canvas-container').offsetWidth;
    canvas.width = containerWidth;
    canvas.height = containerWidth / 3; // Maintain aspect ratio
    redraw();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function getPointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX || event.touches[0].clientX) - rect.left;
    const y = (event.clientY || event.touches[0].clientY) - rect.top;
    return { x, y };
}

function startDrawing(event) {
    drawing = true;
    const point = getPointerPosition(event);
    paths.push({ x: point.x, y: point.y, size: penSize, color: penColor });
    [lastX, lastY] = [point.x, point.y];
    redraw();
}

function draw(event) {
    if (!drawing) return;
    
    const point = getPointerPosition(event);
    const dist = Math.sqrt((point.x - lastX) ** 2 + (point.y - lastY) ** 2);
    if (dist >= 2) { // Adjust threshold for capturing points
        paths.push({ x: point.x, y: point.y, size: penSize, color: penColor });
        lastX = point.x;
        lastY = point.y;
        debounceRedraw();
    }
}

function stopDrawing() {
    drawing = false;
}

function debounceRedraw() {
    requestAnimationFrame(redraw);
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach((point, index) => {
        ctx.beginPath();
        if (index > 0) {
            ctx.moveTo(paths[index - 1].x, paths[index - 1].y);
        } else {
            ctx.moveTo(point.x - 1, point.y - 1);
        }
        ctx.lineTo(point.x, point.y);
        ctx.lineWidth = point.size;
        ctx.strokeStyle = point.color;
        ctx.stroke();
    });
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchmove', draw);

document.getElementById('undo').addEventListener('click', () => {
    if (paths.length > 0) {
        undonePaths.push(paths.pop());
        redraw();
    }
});

document.getElementById('redo').addEventListener('click', () => {
    if (undonePaths.length > 0) {
        paths.push(undonePaths.pop());
        redraw();
    }
});

document.getElementById('clear').addEventListener('click', () => {
    paths = [];
    undonePaths = [];
    redraw();
});

document.getElementById('save').addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'signature.png';
    a.click();
});

document.getElementById('pen-size').addEventListener('input', (event) => {
    penSize = event.target.value;
});

document.getElementById('pen-color').addEventListener('input', (event) => {
    penColor = event.target.value;
});
