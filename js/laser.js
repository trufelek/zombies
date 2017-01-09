Laser.heating = 150;
Laser.overheated = false;

function Laser() {
    this.angle = Game.hero.angle;
    this.startX = Game.hero.points[0].x;
    this.startY = Game.hero.points[0].y;
    this.length = Math.sqrt(Math.pow(Game.width, 2) + Math.pow(Game.height, 2));
    this.endX = this.startX + Math.sin(Math.PI / 180 * this.angle) * this.length;
    this.endY = this.startY + -Math.cos(Math.PI / 180 * this.angle) * this.length;
    this.color = 'rgb(0, 255, 255)';
    this.red_value = 0;
    this.blue_value = 255;
    this.lineWidth = 1;
};


Laser.prototype.draw = function() {
    if(Game.hero.weapons['laser'] && Laser.heating > 0 && !Laser.overheated) {
        // laser heating
        Laser.heating--;
        document.getElementById("laser").style.borderLeftWidth = Laser.heating > 0 ? Laser.heating : 1;

        Enemy.state = 'hide';

        // change laser bar color
        this.red_value += 2;
        this.blue_value -= 2;
        document.getElementById("laser").style.borderColor = "rgb(" + this.red_value + ", 255, " + this.blue_value + ")";

        this.obstacleCollisionDetection();
        this.enemyCollisionDetection();

        Game.ctx.beginPath();
        Game.ctx.strokeStyle = this.color;
        Game.ctx.lineWidth = this.lineWidth;

        this.startX = Game.hero.points[0].x;
        this.startY = Game.hero.points[0].y;
        this.angle = Game.hero.angle;

        this.endX = this.startX + Math.sin(Math.PI / 180 * this.angle) * this.length;
        this.endY = this.startY + -Math.cos(Math.PI / 180 * this.angle) * this.length;

        Game.ctx.moveTo(this.endX, this.endY);
        Game.ctx.lineTo(this.startX, this.startY);

        Game.ctx.closePath();
        Game.ctx.stroke();
    } else {
        Enemy.state = 'wander';

        if(Laser.heating == 0) {
            Laser.overheated = true;
        }

        this.cooling();
    }

};

Laser.prototype.obstacleCollisionDetection = function() {
    for(o in Obstacle.all) {
        var intersection_points = Game.interceptCircleLine(Obstacle.all[o], this);

        if(intersection_points.length) {
            this.length = Math.sqrt(Math.pow(this.startX - intersection_points[0].x , 2) + Math.pow(this.startY - intersection_points[0].y, 2));
        } else {
            this.length += 1;
        }
    }
};

Laser.prototype.enemyCollisionDetection = function() {
    for(e in Enemy.all) {
        var intersection_points = Game.interceptCircleLine(Enemy.all[e], this);

        if(intersection_points.length) {
            this.length = Math.sqrt(Math.pow(this.startX - intersection_points[0].x , 2) + Math.pow(this.startY - intersection_points[0].y, 2));

            Game.hero.score ++;
            document.getElementById("score").textContent = "zabite zombie: " + Game.hero.score;

            Enemy.count --;
            delete Enemy.all[e];

            if(!Enemy.count) {
                setTimeout(function() {
                    Game.over('success');
                }, 500);
            }
        } else {
            this.length += 5;
        }
    }
};

Laser.prototype.cooling = function() {
    if(Laser.heating < 150) {
        // cooling laser
        Laser.heating ++;
        document.getElementById("laser").style.borderLeftWidth = Laser.heating;

        // change laser bar color
        this.red_value -= 2;
        this.blue_value += 2;
        document.getElementById("laser").style.borderColor = "rgb(" + this.red_value + ", 255, " + this.blue_value + ")";
    } else {
        Laser.overheated = false;
    }
};
