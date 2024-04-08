const mazeContainer = document.getElementById('maze');
const randomButton = document.getElementById('randomButton');
const solveButton = document.getElementById('solveButton');
const controlButton = document.getElementById('controlButton');

randomButton.style.display = 'block';
solveButton.style.display = 'none';
controlButton.style.display = 'none';

const rows = 10;
const cols = 50;
let entryPosition;
let exitPosition;
let maze;
let isSolving = false;
let animationIndex = 0;
let animationTimer;

function generateMaze(rows, cols) {
    const maze = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            row.push(Math.random() < 0.3 ? 1 : 0);
        }
        maze.push(row);
    }
    for (let i = 0; i < rows; i++) {
        maze[i][0] = 1;
        maze[i][cols-1] = 1;
    }
    for (let j = 0; j < cols; j++) {
        maze[0][j] = 1;
        maze[rows-1][j] = 1;
    }
    return maze;
}

function findPath(start, end) {
    const queue = [[start]]; 
    const visited = new Set();

    while (queue.length > 0) {
        const path = queue.shift();
        const [x, y] = path[path.length - 1]; 

        if (x === end[0] && y === end[1]) {
            return path;
        }

        const neighbors = [
            [x - 1, y],
            [x + 1, y],
            [x, y - 1],
            [x, y + 1]
        ];

        for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && maze[nx][ny] === 0 && !visited.has(`${nx},${ny}`)) {
                visited.add(`${nx},${ny}`);
                queue.push([...path, [nx, ny]]);
            }
        }
    }

    return [];
}

function initializeMaze() {
    mazeContainer.innerHTML = '';

    let path = [];
    let attempts = 0;

    while (path.length === 0 && attempts < 100) {
        maze = generateMaze(rows, cols);
        entryPosition = [Math.floor(Math.random() * rows), 0];
        exitPosition = [Math.floor(Math.random() * rows), cols - 1];
        maze[entryPosition[0]][entryPosition[1]] = 0;
        maze[exitPosition[0]][exitPosition[1]] = 0;

        path = findPath(entryPosition, exitPosition);
        attempts++;
    }

    if (path.length > 0) {
        displayMaze(maze);
    } else {
        initializeMaze(); 
    }
}

function displayMaze(maze) {
    maze.forEach((row, i) => {
        row.forEach((cell, j) => {
            const div = document.createElement('div');
            div.className = 'cell';
            if (cell === 1) {
                div.classList.add('wall');
            } else if (i === entryPosition[0] && j === entryPosition[1]) {
                div.classList.add('entry');
            } else if (i === exitPosition[0] && j === exitPosition[1]) {
                div.classList.add('exit');
            }
            mazeContainer.appendChild(div);
        });
    });
    //mazeContainer.style.gridTemplateColumns = `repeat(${cols}, 20px)`;
}

function solveMaze(path) {
    isSolving = true;

    animationTimer = setInterval(() => {
        if (animationIndex >= path.length || !isSolving) {
            clearInterval(animationTimer);
            randomButton.disabled = false;
            controlButton.style.display = 'none';
            isSolving = false;
            return;
        }
        const [x, y] = path[animationIndex];
        const cellIndex = x * cols + y;
        const cell = mazeContainer.getElementsByClassName('cell')[cellIndex];
        cell.classList.add('path');
        animationIndex++;
    }, 100); 
}

randomButton.addEventListener('click', () => {
    if (!isSolving) {
        initializeMaze();
        solveButton.style.display = 'block';
        solveButton.disabled = false;
        controlButton.style.display = 'none';
    }
});

controlButton.addEventListener('click', () => {
    if (!isSolving) {
        const path = findPath(entryPosition, exitPosition);
        controlButton.textContent = 'Stop';
        randomButton.disabled = true;
        //animationIndex = 0;
        solveMaze(path);
    } else {
        clearInterval(animationTimer);
        controlButton.textContent = 'Continue';
        randomButton.disabled = false;
        isSolving = false;
    }
});

solveButton.addEventListener('click', () => {
    controlButton.textContent = 'Stop';
    controlButton.style.display = 'block';
    randomButton.disabled = true;
    solveButton.disabled = true;
    const path = findPath(entryPosition, exitPosition);
    animationIndex = 0;
    solveMaze(path);
});