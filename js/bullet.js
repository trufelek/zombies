Bullet.all = {};
Bullet.speed = 5;
Bullet.count = 0;
Bullet.active = 0;
Bullet.life = 100;

function Bullet() {
    this.id = Bullet.count.toString();
    this.life = 0;
    this.angle = Game.hero.angle;
    this.x = Game.hero.points[0].x;
    this.y = Game.hero.points[0].y;
    this.color = 'rgb(255, 165, 0)';

    Bullet.count ++;
    Bullet.active ++;
    Bullet.all[this.id] = this;
};

Bullet.draw = function() {
    for (var bullet in Bullet.all) {
        if(Bullet.all[bullet].life < Bullet.life) {
            Bullet.all[bullet].life ++;

            Bullet.all[bullet].x += Math.sin(Math.PI / 180 * Bullet.all[bullet].angle) * Bullet.speed;
            Bullet.all[bullet].y += -Math.cos(Math.PI / 180 * Bullet.all[bullet].angle) * Bullet.speed;

            Game.ctx.beginPath();
            Game.ctx.arc(Bullet.all[bullet].x, Bullet.all[bullet].y, 2, 0, Math.PI / 180 * 360);
            Game.ctx.fillStyle = Bullet.all[bullet].color;
            Game.ctx.closePath();
            Game.ctx.fill();
        } else {
            Bullet.active --;
            delete Bullet.all[bullet];
        }
    }
};