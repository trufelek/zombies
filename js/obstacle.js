Obstacle.all = {};
Obstacle.count = 0;
Obstacle.positions = [[200, 150], [350, 425], [150, 350], [780, 150], [780, 400]];

function Obstacle() {
    this.id = Obstacle.count.toString();
    this.minR = 50;
    this.maxR = 70;
    this.r = Game.rand(this.minR, this.maxR);
    this.x = 0;
    this.y = 0;
    this.position = new Vector2(this.x, this.y);
    this.color = 'lightcoral';

    Obstacle.count ++;
    Obstacle.all[this.id] = this;
};

Obstacle.init = function() {
    for (var i = 0; i < Obstacle.positions.length; i++) {
        var obstacle = new Obstacle();
        obstacle.x = Obstacle.positions[i][0];
        obstacle.y = Obstacle.positions[i][1];
        obstacle.position = new Vector2(obstacle.x, obstacle.y);
    }
};

Obstacle.draw = function() {
    for(o in Obstacle.all) {
        Game.ctx.beginPath();
        Game.ctx.arc(Obstacle.positions[o][0], Obstacle.positions[o][1], Obstacle.all[o].r, 0, Math.PI / 180 * 360);
        Game.ctx.fillStyle = Obstacle.all[o].color;
        Game.ctx.fill();
        Game.ctx.closePath();
    }
};