function Hero() {
    this.r = 15;
    this.shape = 50;
    this.angle = 0;
    this.color = 'rgb(255, 92, 92)';
    this.lineWidth = 2;
    this.x = Game.width / 2;
    this.y = Game.height / 2;
    this.points = [{}, {}, {}];
    this.acceleration = 3;
    this.life = 150;
    this.mag = 25;
    this.ammo = 25;
    this.weapons = {
        gun: true,
        laser: false
    };
};

Hero.prototype.draw = function() {
    var x = this.x;
    var y = this.y;
    var collision = false;
    var healing = true;

    if(Game.keys[37]) {
        // obrót w lewo
        this.angle += 5 * -1;
    }

    if(Game.keys[39]) {
        // obrót w prawo
        this.angle +=  5 * 1;
    }

    if(Game.keys[38]) {
        // ruch do przodu
        x = this.x + Math.sin(Math.PI / 180 * this.angle) * this.acceleration;
        y = this.y - Math.cos(Math.PI / 180 * this.angle) * this.acceleration;
    }

    if(Game.keys[40]) {
        // ruch do tyłu
        x = this.x - Math.sin(Math.PI / 180 * this.angle) * this.acceleration;
        y = this.y + Math.cos(Math.PI / 180 * this.angle) * this.acceleration;
    }

    for(o in Obstacle.all) {
        if(Game.sphereCollisionDetection(Obstacle.all[o].x, Obstacle.all[o].y, Obstacle.all[o].r, x, y, this.r)) {
            collision = true;
            break;
        }
    }

    for(e in Enemy.all) {
        if(Game.sphereCollisionDetection(Enemy.all[e].x, Enemy.all[e].y, Enemy.all[e].r, x, y, this.r)) {
            if(this.life > 0) {
                this.life --;
                healing = false;
                document.getElementById("life").style.borderLeftWidth = this.life;
            } else {
                Game.reset();
            }
            break;
        } else {
            healing = true;
        }
    }


    if(healing && this.life < 100) {
        this.life += 0.2;
        document.getElementById("life").style.borderLeftWidth = this.life;
    }

    if (x - this.r > 0 && x + this.r <= Game.width && !collision) {
        this.x = x;
    }

    if (y - this.r > 0 && y + this.r <= Game.height && !collision) {
        this.y = y;
    }

    Game.ctx.beginPath();
    Game.ctx.strokeStyle = this.color;
    Game.ctx.lineWidth = this.lineWidth;

    for(var i = 0; i < 3; i++) {
        this.a = i == 0 ? this.angle : (this.angle + 180 + (i == 1 ? this.shape : - this.shape));
        this.points[i].x = Math.sin(Math.PI / 180 * this.a) * this.r + this.x;
        this.points[i].y = -Math.cos(Math.PI / 180 * this.a) * this.r + this.y;

        if(i == 0) {
            Game.ctx.moveTo(this.points[i].x, this.points[i].y);
        } else {
            Game.ctx.lineTo(this.points[i].x, this.points[i].y);
        }
    }
    Game.ctx.closePath();
    Game.ctx.stroke();
};