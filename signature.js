const canvas = document.getElementById('signature-pad');
const ctx = canvas.getContext('2d');
let drawing = false;
let paths = [];
let undonePaths = [];
let penSize = document.getElementById('pen-size').value;
let penColor = document.getElementById('pen-color').value;
let drawingTimeout;

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
    paths.push([]);
    undonePaths = []; // Clear the redo history
    draw(event); // Start drawing immediately
}

function stopDrawing() {
    drawing = false;
    clearTimeout(drawingTimeout);
}

function draw(event) {
    if (!drawing) return;

    const point = getPointerPosition(event);
    point.size = penSize;
    point.color = penColor;
    paths[paths.length - 1].push(point);

    debounceRedraw();
}

function debounceRedraw() {
    if (drawingTimeout) {
        cancelAnimationFrame(drawingTimeout);
    }
    drawingTimeout = requestAnimationFrame(redraw);
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach(path => {
        if (path.length < 3) {
            ctx.beginPath();
            const point = path[0];
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(point.x + 2, point.y + 2);
            ctx.stroke();
            return;
        }

        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);

        for (let i = 1; i < path.length - 2; i++) {
            const c = (path[i].x + path[i + 1].x) / 2;
            const d = (path[i].y + path[i + 1].y) / 2;
            ctx.quadraticCurveTo(path[i].x, path[i].y, c, d);
        }

        ctx.quadraticCurveTo(
            path[path.length - 2].x,
            path[path.length - 2].y,
            path[path.length - 1].x,
            path[path.length - 1].y
        );

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
