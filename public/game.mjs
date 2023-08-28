const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');
canvas.focus();

const canvasWidth = 640;
const canvasHeight = 480;
const upperCanvasHeight = 90;
const borderThickness = 5;

const COLORS = {
  BACKGROUND: '#272727',
  UI_BACKGROUND: 'black',
  UI_TEXT: 'white',
};

const borderGradient = context.createLinearGradient(0, upperCanvasHeight - borderThickness, 0, canvasHeight + upperCanvasHeight);
borderGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');  
borderGradient.addColorStop(0.5, '#272727');           
borderGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');    

const PLAYER_SIZE = 30;
const COLLECTIBLE_SIZE = 30;
const PLAYER_SPEED = 350;

const playerImage = new Image();
playerImage.src = './public/assets/kisspng-professor-pac-man-arcade-game-single-player-video-png-pacman-background-transparent-hd-5ab14379345313.4286873215215665852143.png';

const collectibleImage = new Image();
collectibleImage.src = './public/assets/ms-pac-man-pac-man-256-ghosts-video-game-pacman-pixel-5fb2fc6c150cd31c86b0a886b1c43513.png';

let points = 0;
canvas.width = canvasWidth;
canvas.height = canvasHeight + upperCanvasHeight;

const player = {
  rank: 'Rank: 1',
  x: canvasWidth / 2,
  y: canvasHeight - 30,
  width: PLAYER_SIZE,
  height: PLAYER_SIZE,
  speed: PLAYER_SPEED,
};

const collectibles = [];
const desiredCollectibleCount = 1;

const keys = {};

const socket = io();
const players = {};
const playerId = socket.id;

window.addEventListener('keydown', (event) => {
  keys[event.key] = true;
});

window.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

socket.on('playerMoved', (movementData) => {
  if (players[movementData.playerId]) {
    players[movementData.playerId].x = movementData.x;
    players[movementData.playerId].y = movementData.y;
  } else {
    players[movementData.playerId] = movementData;
  }
});

socket.on('playerDisconnected', (disconnectedPlayerId) => {
  delete players[disconnectedPlayerId];
});
function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastFrameTime) / 1000;
  lastFrameTime = timestamp;

  updatePlayerPosition(deltaTime);
    const collectiblesToRemove = [];

  collectibles.forEach((collectible, index) => {
    if (
      player.x < collectible.x + collectible.width &&
      player.x + player.width > collectible.x &&
      player.y < collectible.y + collectible.height &&
      player.y + player.height > collectible.y
    ) {
      collectiblesToRemove.push(index);
    }
  });

  if (collectiblesToRemove.length > 0) {
    player.rank = `Rank ${collectibles.length - collectiblesToRemove.length + 1}`;

    collectiblesToRemove.forEach((index) => {
      points++;
      collectibles.splice(index, 1);
    });
  }

  while (collectibles.length < desiredCollectibleCount) {
    const newCollectiblePos = generateRandomCollectiblePosition();
    collectibles.push({ x: newCollectiblePos.x, y: newCollectiblePos.y, width: 30, height: 30 });
  }
  drawGame();

  requestAnimationFrame(gameLoop);
}

function drawGame() {
  clearCanvas();
  drawArena();
  drawUI();
  drawBorder();
  drawPlayer();
  drawOtherPlayers();
  drawCollectibles();
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawArena() {
  context.fillStyle = COLORS.BACKGROUND;
  context.fillRect(0, upperCanvasHeight, canvas.width, canvasHeight);
}

function drawUI() {
  context.fillStyle = COLORS.UI_BACKGROUND;
  context.fillRect(0, 0, canvas.width, upperCanvasHeight);

  context.fillStyle = COLORS.UI_TEXT;
  context.font = '10px "Press Start 2P", cursive';
  context.fillText(`${player.rank}/${player.rank.length}`, 515, 70);
  context.fillText(`Points:${points}`, 515, 35);
  context.fillText('Controls:WASD /', 10, 45);
  context.fillText('Arrow', 100, 70);
  context.font = '22px "Press Start 2P", cursive';
  context.fillText('Pac-SnakeMan', 210, 60);
}

function drawPlayer() {
  context.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function drawCollectibles() {
  collectibles.forEach(collectible => {
    context.drawImage(collectibleImage, collectible.x, collectible.y, collectible.width, collectible.height);
  });
}
function drawBorder() {
  context.fillStyle = 'black';
  context.fillRect(0, upperCanvasHeight - borderThickness, canvas.width, borderThickness);

  context.fillRect(0, upperCanvasHeight, borderThickness, canvasHeight);

  context.fillRect(canvasWidth - borderThickness, upperCanvasHeight, borderThickness, canvasHeight);

  context.fillRect(0, canvasHeight + upperCanvasHeight - borderThickness, canvas.width, borderThickness);
}

function updatePlayerPosition(deltaTime) {
  if (keys['ArrowLeft'] || keys['a']) {
    if (player.x - player.speed * deltaTime > borderThickness) {
      player.x -= player.speed * deltaTime;
    }
  }
  if (keys['ArrowRight'] || keys['d']) {
    if (player.x + player.width + player.speed * deltaTime < canvasWidth - borderThickness) {
      player.x += player.speed * deltaTime;
    }
  }
  if (keys['ArrowUp'] || keys['w']) {
    if (player.y - player.speed * deltaTime > upperCanvasHeight + borderThickness) {
      player.y -= player.speed * deltaTime;
    }
  }
  if (keys['ArrowDown'] || keys['s']) {
    if (player.y + player.height + player.speed * deltaTime < canvasHeight + upperCanvasHeight - borderThickness) {
      player.y += player.speed * deltaTime;
    }
  }
   socket.emit('playerMoved', { x: player.x, y: player.y });
}

function drawOtherPlayers() {
  for (const playerId in players) {
    if (playerId !== socket.id) {
      const otherPlayer = players[playerId];
      context.fillStyle = 'blue';
      context.fillRect(otherPlayer.x, otherPlayer.y, PLAYER_SIZE, PLAYER_SIZE);
    }
  }
}

function generateRandomCollectiblePosition() {
  const minX = borderThickness;
  const maxX = canvasWidth - borderThickness - COLLECTIBLE_SIZE;
  const minY = upperCanvasHeight + borderThickness;
  const maxY = canvasHeight + upperCanvasHeight - borderThickness - COLLECTIBLE_SIZE;
  const randomX = Math.random() * (maxX - minX) + minX;
  const randomY = Math.random() * (maxY - minY) + minY;

  return { x: randomX, y: randomY };
}

let lastFrameTime = 0;
requestAnimationFrame(gameLoop);