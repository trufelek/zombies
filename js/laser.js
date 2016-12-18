Laser.heating = 150;
Laser.overheated = false;

function Laser() {
    this.angle = Game.hero.angle;
    this.x = Game.hero.points[0].x;
    this.y = Game.hero.points[0].y;
    this.color = 'rgb(0, 255, 255)';
    this.length = Math.sqrt(Math.pow(Game.width, 2) + Math.pow(Game.height, 2));
    this.lineWidth = 1;
};


Laser.prototype.draw = function() {
    if(Game.hero.weapons['laser'] && Laser.heating > 0 && !Laser.overheated) {
        Laser.heating--;
        document.getElementById("laser").style.borderLeftWidth = Laser.heating > 0 ? Laser.heating : 1;

        Game.ctx.beginPath();
        Game.ctx.strokeStyle = this.color;
        Game.ctx.lineWidth = this.lineWidth;

        this.x = Game.hero.points[0].x;
        this.y = Game.hero.points[0].y;
        this.angle = Game.hero.angle;

        var x = this.x + Math.sin(Math.PI / 180 * this.angle) * this.length;
        var y = this.y + -Math.cos(Math.PI / 180 * this.angle) * this.length;

        Game.ctx.moveTo(x, y);
        Game.ctx.lineTo(this.x, this.y);
        Game.ctx.closePath();
        Game.ctx.stroke();
    } else {
        Laser.overheated = true;
        this.cooling();
    }

};

Laser.prototype.cooling = function() {
    if(Laser.heating < 150) {
        Laser.heating ++;
        document.getElementById("laser").style.borderLeftWidth = Laser.heating;
    } else {
        Laser.overheated = false;
    }
};