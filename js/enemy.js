Enemy.all = {};
Enemy.count = 0;
Enemy.states = ['explore','attack'];

function Enemy() {
    this.id = Enemy.count.toString();
    this.r = 10;
    this.x = Game.rand(0,1) ? (Game.rand(0,1) / 10) * Game.width + this.r : (Game.rand(9, 10) / 10) * Game.width - this.r;
    this.y = Game.rand(0,1) ? (Game.rand(0,1) / 10) * Game.height + this.r  : (Game.rand(9, 10) / 10) * Game.height - this.r;

    this.color = 'rgb(173, 255, 47)';
    this.state = 'explore';
    this.acceleration = 1;

    // wander
    this.wander_radius = 3;
    this.wander_distance = 1;
    this.wander_jitter = 1;
    this.wander_target = new Vector2(0,0);

    // position
    this.position = new Vector2(this.x, this.y);

    Enemy.count ++;
    Enemy.all[this.id] = this;
};

Enemy.draw = function() {
    for(e in Enemy.all) {
        Game.ctx.beginPath();
        Game.ctx.arc(Enemy.all[e].x, Enemy.all[e].y, Enemy.all[e].r, 0, Math.PI / 180 * 360);
        Game.ctx.fillStyle = Enemy.all[e].color;
        Game.ctx.closePath();
        Game.ctx.fill();
    }
};

Enemy.wander = function() {
    for(e in Enemy.all) {
        var v = new Vector2(Game.rand(-1, 1) * Enemy.all[e].wander_jitter, Game.rand(-1, 1) * Enemy.all[e].wander_jitter);
        Enemy.all[e].wander_target = Enemy.all[e].wander_target.plusNew(v);
        Enemy.all[e].wander_target.normalise();
        Enemy.all[e].wander_target = Enemy.all[e].wander_target.multiplyNew(Enemy.all[e].wander_radius);

        var position = Enemy.all[e].wander_target.plusNew(new Vector2(Enemy.all[e].wander_distance, 0));
        Enemy.all[e].position = Enemy.all[e].position.plusNew(position);


        if(Enemy.all[e].position.x - Enemy.all[e].r > 0 && Enemy.all[e].position.x + Enemy.all[e].r <= Game.width) {
            Enemy.all[e].x = Enemy.all[e].position.x;
        }

        if (Enemy.all[e].position.y - Enemy.all[e].r > 0 && Enemy.all[e].position.y + Enemy.all[e].r <= Game.height) {
            Enemy.all[e].y = Enemy.all[e].position.y;
        }
    }
};
