Obstacle.all = {};
Obstacle.count = 0;

function Obstacle() {
    this.id = Obstacle.count.toString();
    this.minR = 50;
    this.maxR = 75;
    this.r = Game.rand(this.minR, this.maxR);
    this.x = (Game.rand(0,1) ? Game.rand(2,3) / 10 : Game.rand(7,8) / 10) * Game.width;
    this.y = (Game.rand(0,1) ? Game.rand(2,3) / 10 : Game.rand(7,8) / 10) * Game.height;
    this.color = 'rgb(255, 102, 102)';

    Obstacle.count ++;
    Obstacle.all[this.id] = this;
};

Obstacle.draw = function() {
    for(o in Obstacle.all) {
        Game.ctx.beginPath();
        Game.ctx.arc(Obstacle.all[o].x, Obstacle.all[o].y, Obstacle.all[o].r, 0, Math.PI / 180 * 360);
        Game.ctx.strokeStyle = Obstacle.all[o].color;
        Game.ctx.fillStyle = Obstacle.all[o].color;
        Game.ctx.fill();
        Game.ctx.closePath();
    }
};