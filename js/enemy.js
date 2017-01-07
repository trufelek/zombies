Enemy.all = {};
Enemy.count = 0;

function Enemy() {
    this.id = Enemy.count.toString();
    this.color = 'greenyellow';

    // random enemy position
    this.r = 10;
    this.x = Game.rand(0,1) ? (Game.rand(0,1) / 10) * Game.width + this.r : (Game.rand(9, 10) / 10) * Game.width - this.r;
    this.y = Game.rand(0,1) ? (Game.rand(0,1) / 10) * Game.height + this.r  : (Game.rand(9, 10) / 10) * Game.height - this.r;
    this.size = this.r * 2;

    // moving
    this.position = new Vector2(this.x, this.y);
    this.velocity = new Vector2();
    this.heading = new Vector2();
    this.side = new Vector2();
    this.mass = 1;
    this.max_force = 3;

    // wander
    this.wander_target = new Vector2();
    this.wander_radius = 3;
    this.wander_distance = 2;
    this.wander_jitter = 1;

    // obstacles avoidance
    this.detection_box = 50;

    // wall avoidance
    this.feeler_length = 50;
    this.feeler = new Vector2();

    Enemy.count ++;
    Enemy.all[this.id] = this;
};

Enemy.draw = function() {
    for(e in Enemy.all) {
        Game.ctx.beginPath();
        Game.ctx.arc(Enemy.all[e].position.x, Enemy.all[e].position.y, Enemy.all[e].r, 0, Math.PI / 180 * 360);
        Game.ctx.fillStyle = Enemy.all[e].color;
        Game.ctx.closePath();
        Game.ctx.fill();

        Enemy.drawHelpers();
    }
};

Enemy.update = function() {
    for(e in Enemy.all) {
        var steering_force = new Vector2();
        var wander = Enemy.all[e].wander();
        var obstacle_avoidance = Enemy.all[e].obstacleAvoidance();
        var wall_avoidance = Enemy.all[e].wallAvoidance();
       
        // multiply forces by their weights
        wander.multiplyEq(0.2);
        obstacle_avoidance.multiplyEq(1);
        wall_avoidance.multiplyEq(0.5);

        // add forces to each other
        steering_force = steering_force.plusNew(wander);
        steering_force = steering_force.plusNew(obstacle_avoidance);
        steering_force = steering_force.plusNew(wall_avoidance);

        // if steering force is bigger than max force, scale it
        if(steering_force.magnitude() > Enemy.all[e].max_force) {
            var ratio = Enemy.all[e].max_force / steering_force.magnitude();
            steering_force.x *= ratio;
            steering_force.y *= ratio;
        }

        // steering
        var acceleration = steering_force.divideNew(Enemy.all[e].mass);
        Enemy.all[e].velocity = Enemy.all[e].velocity.plusNew(acceleration);
        Enemy.all[e].position = Enemy.all[e].position.plusNew(Enemy.all[e].velocity);

        var velocity = Enemy.all[e].velocity;
        Enemy.all[e].heading = velocity.normalise();
        Enemy.all[e].side = Enemy.all[e].heading.perpendicular();

        Enemy.all[e].x = Enemy.all[e].position.x;
        Enemy.all[e].y = Enemy.all[e].position.y;
    }
};

Enemy.prototype.wander = function() {
    // add small random vector to target position
    var v = new Vector2(Game.rand(-1, 1) * this.wander_jitter, Game.rand(-1, 1) * this.wander_jitter);
    this.wander_target = this.wander_target.plusNew(v);

    // reproject this new vector back onto a unit circle
    this.wander_target.normalise();

    // increase the length of the vector to the same as the radius of the wander circle
    this.wander_target = this.wander_target.multiplyNew(this.wander_radius);

    // move the target into a position WanderDist in front of the agent
    var local_position = this.wander_target.plusNew(new Vector2(this.wander_distance, 0));

    return local_position;
};

Enemy.prototype.obstacleAvoidance = function() {
    var steering_force = new Vector2();
    var closest_ip = null;
    var closest_obstacle;
    var closest_obstacle_pos;

    for(o in Obstacle.all) {
        // current obstacle
        var obstacle = Obstacle.all[o];

        // check which obstacles are in range of detection box
        if(Game.sphereCollisionDetection(this.position.x, this.position.y, this.detection_box, obstacle.x, obstacle.y, obstacle.r)) {
            // calculate obstacle local position
            var localPos = Game.localPosition(this.position, this.heading, this.side, obstacle);

           // check if obstacle is ahead
            if(localPos.x >= 0) {
                // check if it collides with detection box
                var extended_radius = obstacle.r + this.r;

                if(Math.abs(localPos.y) < extended_radius) {
                    // calculate intersection points x = cX +/-sqrt(r^2-cY^2) for y=0
                    var cX = localPos.x;
                    var cY = localPos.y;
                    var sqrt = Math.sqrt(Math.pow(extended_radius, 2) - Math.pow(cY, 2));

                    var ip = cX - sqrt;

                    if(ip <= 0) {
                        ip = cX + sqrt;
                    }

                    if(ip < closest_ip || closest_ip == null) {
                        closest_ip = ip;
                        closest_obstacle = obstacle;
                        closest_obstacle_pos = localPos;
                    }
                }
            }
        }
    }

    if(closest_obstacle) {
        var breaking_weight = 0.2;
        var multiplier = 1 + (this.detection_box - closest_obstacle_pos.x) / this.detection_box;

        // highlight closest obstacle
        Game.ctx.beginPath();
        Game.ctx.arc(closest_obstacle.x, closest_obstacle.y, closest_obstacle.r, 0, Math.PI / 180 * 360);
        Game.ctx.fillStyle = 'red';
        Game.ctx.closePath();
        Game.ctx.fill();

        steering_force.y = (closest_obstacle.r - closest_obstacle_pos.y) * multiplier;
        steering_force.x = (closest_obstacle.r - closest_obstacle_pos.x) * breaking_weight;
    }

    return Game.vectorToWorldSpace(steering_force, this.heading);
};

Enemy.prototype.wallAvoidance = function() {
    // create enemy feeler
    this.feeler = this.position.plusNew(this.heading.multiplyNew(this.feeler_length));
    var steering_force = new Vector2();

    // left side
    if(this.feeler.x < this.size) {
        var delta = Math.abs(0 - this.feeler.x);
        steering_force.x = steering_force.x + delta;
    // right side
    } else if(this.feeler.x > Game.width - this.size) {
        var delta = Math.abs(Game.width - this.feeler.x);
        steering_force.x = steering_force.x - delta;
    }

    // top
    if(this.feeler.y < this.size) {
        var delta = Math.abs(0 - this.feeler.y);
        steering_force.y = steering_force.y + delta;
    // bottom
    } else if(this.feeler.y > Game.height - this.size) {
        var delta = Math.abs(Game.height - this.feeler.y);
        steering_force.y = steering_force.y - delta;
    }

    return steering_force;
};

Enemy.drawHelpers = function() {
    for(e in Enemy.all) {
        // set new center
        Game.ctx.translate(Enemy.all[e].position.x, Enemy.all[e].position.y);

        // rotate
        Game.ctx.rotate(Enemy.all[e].wander_target.angle(true));

        // draw box
        Game.ctx.beginPath();
        Game.ctx.strokeStyle = 'white';
        Game.ctx.rect(0, 0 - Enemy.all[e].r, Enemy.all[e].detection_box, Enemy.all[e].r * 2);
        Game.ctx.stroke();
        Game.ctx.closePath();

        // draw feeler
        Game.ctx.beginPath();
        Game.ctx.strokeStyle = 'pink';
        Game.ctx.rect(0, 0, Enemy.all[e].feeler_length, 1);
        Game.ctx.stroke();
        Game.ctx.closePath();

        // reset
        Game.ctx.rotate(Enemy.all[e].wander_target.angle(true) * (-1));
        Game.ctx.translate((Enemy.all[e].position.x) * (-1), (Enemy.all[e].position.y) * (-1));
    }
};
