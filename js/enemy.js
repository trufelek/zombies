Enemy.all = {};
Enemy.count = 0;

function Enemy() {
    this.id = Enemy.count.toString();
    this.color = 'rgb(173, 255, 47)';

    // random enemy position
    this.r = 10;
    this.x = Game.rand(0,1) ? (Game.rand(0,1) / 10) * Game.width + this.r : (Game.rand(9, 10) / 10) * Game.width - this.r;
    this.y = Game.rand(0,1) ? (Game.rand(0,1) / 10) * Game.height + this.r  : (Game.rand(9, 10) / 10) * Game.height - this.r;

    // moving
    this.position = new Vector2(this.x, this.y);
    this.velocity = new Vector2(0,0);
    this.heading = new Vector2(0,0);
    this.side = new Vector2(0,0);
    this.mass = 1;

    // wander
    this.wander_target = new Vector2();
    this.wander_radius = 3;
    this.wander_distance = 2;
    this.wander_jitter = 1;

    // obstacles avoidance
    this.detection_box = 50;

    // wall avoidance
    this.feelers = [];
    this.feeler_length = 2;

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

        Enemy.drawDetectionBox();
    }
};

Enemy.update = function() {
    for(e in Enemy.all) {
        var steering_force = new Vector2();
        var wander = Enemy.all[e].wander();
        var obstacle_avoidance = Enemy.all[e].obstacleAvoidance();
        var wall_avoidance = Enemy.all[e].wallAvoidance();
       
        // multiply forces by their weights
        wander.multiplyEq(0.7);
        obstacle_avoidance.multiplyEq(0.5);
        wall_avoidance.multiplyEq(1);

        // add forces to each other
        steering_force = steering_force.plusNew(wander);
        steering_force = steering_force.plusNew(obstacle_avoidance);
        steering_force = steering_force.plusNew(wall_avoidance);

        // steering
        var acceleration = steering_force.divideNew(Enemy.all[e].mass);
        Enemy.all[e].velocity = Enemy.all[e].velocity.plusNew(acceleration);
        Enemy.all[e].position = Enemy.all[e].position.plusNew(Enemy.all[e].velocity);

        var velocity = Enemy.all[e].velocity;
        Enemy.all[e].heading = velocity.normalise();
        Enemy.all[e].side = Enemy.all[e].heading.perpendicular();
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

    // TODO: sprawdzić dlaczego nie działa global position
    //var global_position = Game.pointToGlobalSpace(local_position, this.heading, this.position);
    //return (global_position.minusNew(this.position));

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
    var distance_to_this_ip = 0;
    var distance_to_closest_ip = null;
    var closest_wall = null;
    var closest_index = -1;

    var point = new Vector2();
    var steering_force = new Vector2();
    var closest_point = new Vector2();

    this.createFeelers();

    // examine each feeler in turn
    for(var f = 0; f < this.feelers.length; f++) {
        // run through each wall checking for any intersection points
        for(var w = 0; w < Wall.count; w++) {
            // current wall
            var wall = Wall.all[w];
            var intersection = Game.lineIntersection2D(this.position, this.feelers[f], wall.from, wall.to);

            if(intersection.istrue) {
                // is this the closest found so far? if so keep a record
                if(distance_to_this_ip < distance_to_closest_ip || distance_to_closest_ip == null) {
                    distance_to_closest_ip = intersection.distance;
                    closest_index = w;
                    closest_wall = Wall.all[w];
                    closest_point = intersection.point;
                }
            }
        }
        // if an intersection point has been detected, calculate a force that will direct the agent away
        if(closest_index >= 0) {
            var overshoot = this.feelers[f].minusNew(closest_point);
            var wall_vector = new Vector2(closest_wall.to.x - closest_wall.from.x, closest_wall.to.y - closest_wall.from.y);

            // create a force in the direction of the wall normal, with a magnitude of the overshoot
            steering_force = wall_vector.normalise().multiplyNew(overshoot.length());
        }
    }

    return steering_force;
};

Enemy.drawDetectionBox = function() {
    for(e in Enemy.all) {
        Game.ctx.beginPath();

        // set new center
        Game.ctx.translate(Enemy.all[e].position.x, Enemy.all[e].position.y);

        // rotate
        Game.ctx.rotate(Enemy.all[e].wander_target.angle(true));

        // draw box
        Game.ctx.strokeStyle = 'white';
        Game.ctx.rect(0, 0 - Enemy.all[e].r, Enemy.all[e].detection_box, Enemy.all[e].r * 2);
        Game.ctx.stroke();

        // reset
        Game.ctx.rotate(Enemy.all[e].wander_target.angle(true) * (-1));
        Game.ctx.translate((Enemy.all[e].position.x) * (-1), (Enemy.all[e].position.y) * (-1));

        Game.ctx.closePath();
    }
};

Enemy.prototype.createFeelers = function() {
    // feeler pointing straight in front
    this.feelers[0] = this.position.plusNew(this.heading.multiplyNew(this.feeler_length));

    // feeler to left
    var temp = this.heading;
    var rotated = temp.rotate((Math.PI / 2) * 3.5, true);
    this.feelers[1] = this.position.plusNew(rotated.multiplyNew(this.feeler_length / 0.2));

    // feeler to right
    temp = this.heading;
    var rotated = temp.rotate((Math.PI / 2) * 0.5, true);
    this.feelers[2] = this.position.plusNew(rotated.multiplyNew(this.feeler_length / 0.2));
};
