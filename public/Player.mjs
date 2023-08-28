class Player {
  constructor({x, y, score, id}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;

  }
  
   movePlayer(dir, speed) {
    console.log('Move player:', dir, speed);
    if (dir === 'up') {
      this.y -= speed;
    } else if (dir === 'down') {
      this.y += speed
    } else if (dir === 'left') {
      this.x -= speed
    } else if (dir === 'right') {
      this.x += speed
    }

  }

  collision(item) {
   const distance = Math.sqrt(
      Math.pow(this.x - item.x, 2) + Math.pow(this.y - item.y, 2)
    );
   const collision = 15
    if(distance < collision) {
      return true
    } else {
      return false
    }
  }

  calculateRank(arr) {
   const sortPlayers = [...arr].sort((a, b) => b.score - a.score);
   const playerIndex = sortPlayers.findIndex(player => player.id === this.id);

   const rank = `Rank: ${playerIndex + 1} / ${arr.length}`;
   return rank;

  }
}

export default Player;