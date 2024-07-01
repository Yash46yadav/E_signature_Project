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
        clearTimeout(drawingTimeout);
    }
    drawingTimeout = setTimeout(redraw, 10); // Redraw every 10ms (adjust as needed)
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach(path => {
        ctx.beginPath();
        path.forEach((point, index) => {
            ctx.lineWidth = point.size;
            ctx.strokeStyle = point.color;
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
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
