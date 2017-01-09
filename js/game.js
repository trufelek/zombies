Game = {
    fps: 60,
    width: 0,
    height: 0,
    lastTime: 0,
    lastUpdate: -1,
    controls: [32, 37, 38, 39, 40, 49, 50, 18],
    enemies: 1,
    keys: {},
    pause: false,
    init: function() {
        // init canvas
        Game.canvas = document.getElementById('canvas');
        Game.ctx = Game.canvas.getContext('2d');

        Game.layout();

        Game.hero = new Hero();
        Game.laser = new Laser();

        Obstacle.init();

        for (var i = 0; i < 4; i++) {
            new Wall();
        }

        for (var i = 0; i < Game.enemies; i++) {
            new Enemy();
        }

        window.addEventListener('keydown', Game.onkey, false);
        window.addEventListener('keyup', Game.onkey, false);

        Game.pause = false;

        Game.animationLoop();
    },

    layout: function(event) {
        // game layout
        Game.width = window.innerWidth;
        Game.height = window.innerHeight;

        Game.canvas.width = Game.width;
        Game.canvas.height = Game.height;

        Game.ctx.fillStyle = 'white';
        Game.ctx.strokeStyle = 'white';
        Game.ctx.lineJoin = 'round';
        Game.ctx.lineWidth = 2;
    },

    onkey: function(event) {
        // controls
        if(Game.controls.includes(event.keyCode)) {
            event.preventDefault();

            if(event.type == 'keydown' && !Game.keys[event.keyCode]) {
                Game.keys[event.keyCode] = true;

                if(event.keyCode == 32) {
                    if(Game.hero.weapons['gun'] & Game.hero.ammo > 0) {
                        new Bullet();
                        Game.hero.ammo --;

                        var mag = ((document.getElementById("ammo").offsetWidth - 1) / Game.hero.mag) * Game.hero.ammo
                        document.getElementById("ammo").style.borderLeftWidth = mag > 1 ? mag : 1;
                    }
                }

                if(event.keyCode == 49) {
                    Game.hero.weapons['gun'] = true;
                    Game.hero.weapons['laser'] = false;
                    document.getElementById("ammo").style.opacity = 0.9;
                    document.getElementById("laser").style.opacity = 0;
                }

                if(event.keyCode == 50) {
                    Game.hero.weapons['laser'] = true;
                    Game.hero.weapons['gun'] = false;
                    document.getElementById("ammo").style.opacity = 0;
                    document.getElementById("laser").style.opacity = 0.9;
                }

                if(event.keyCode == 18) {
                    if(Game.hero.weapons['gun'] && Game.hero.ammo != Game.hero.mag) {
                        document.getElementById("ammo").style.borderLeftWidth = document.getElementById("ammo").offsetWidth;
                        Game.hero.ammo = Game.hero.mag;
                    }
                }
            }

            if(event.type == 'keyup') {
                Game.keys[event.keyCode] = false;
            }
        }
    },

    animationLoop: function(time) {
        // main game loop
        if(Game.pause) return;

        requestAnimationFrame(Game.animationLoop);

        if(time - Game.lastTime >= 1000 / Game.fps) {
            Game.lastTime = time;
            Game.ctx.clearRect(0,0, Game.width, Game.height);

            // draw objects
            Game.hero.draw();
            Obstacle.draw();
            Wall.draw();
            Enemy.draw();
            Bullet.draw();
            Game.laser.draw();

            // update enemy
            Enemy.update();
        }
    },

    rand: function(min, max) {
        // rng
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    sphereCollisionDetection: function(x1, y1, r1, x2, y2, r2) {
        // simple spheres collision
        var sum = r1 + r2;
        var distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        return sum >= distance;
    },

    lineIntersect: function(x1,y1,x2,y2, x3,y3,x4,y4) {
        var x =((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
        var y =((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

        if(isNaN(x)||isNaN(y)) {
            return false;
        } else {
            if(x1 >= x2) {
                if(!(x2 <= x && x <= x1)) {return false;}
            } else {
                if(!(x1 <= x && x <= x2)) {return false;}
            }
            if(y1 >= y2) {
                if(!(y2 <= y && y <= y1)) {return false;}
            } else {
                if(!(y1 <= y && y <= y2)) {return false;}
            }
            if(x3 >= x4) {
                if(!(x4 <= x && x <= x3)) {return false;}
            } else {
                if(!(x3 <= x && x <= x4)) {return false;}
            }
            if(y3 >= y4) {
                if(!(y4 <= y && y <= y3)) {return false;}
            } else {
                if(!(y3 <= y && y <= y4)) {return false;}
            }
        }
        return true;
    },

    lineIntersection2D : function(A, B, C, D) {
        var data = {dist: 0, point: new Vector2(), istrue: false};

        var rTop = (A.y-C.y)*(D.x-C.x)-(A.x-C.x)*(D.y-C.y);
        var rBot = (B.x-A.x)*(D.y-C.y)-(B.y-A.y)*(D.x-C.x);

        var sTop = (A.y-C.y)*(B.x-A.x)-(A.x-C.x)*(B.y-A.y);
        var sBot = (B.x-A.x)*(D.y-C.y)-(B.y-A.y)*(D.x-C.x);

        if ( (rBot == 0) || (sBot == 0)) {
            return false;
        }

        var r = rTop/rBot;
        var s = sTop/sBot;

        if( (r > 0) && (r < 1) && (s > 0) && (s < 1) ) {
            data = {
                dist: Game.vec2DDistance(A,B) * r,
                point: A.plusNew(B.minusNew(A).multiplyNew(r)),
                istrue: true
            };

            return data;
        } else {
            return data;
        }
    },

    vec2DDistance: function(v1, v2) {
        var ySeparation = v2.y - v1.y;
        var xSeparation = v2.x - v1.x;

        return Math.sqrt(ySeparation * ySeparation + xSeparation * xSeparation);
    },

    localPosition: function(position, heading, side, point) {
        var vector = new Vector2(-position.dot(heading), - position.dot(side));
        return new Vector2(heading.x * point.x + heading.y * point.y + vector.x, side.x * point.x + side.y * point.y + vector.y)
    },

    pointToGlobalSpace: function(point, heading, position) {
        // make a copy of the point
        var transformation_point = point;

        // create a transformation matrix
        var transformation_matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

        // operations on matrix
        transformation_matrix = Game.rotate(transformation_matrix, heading);
        transformation_matrix = Game.translate(transformation_matrix, position);
        transformation_matrix = Game.transformVector2D(transformation_matrix, transformation_point);

        return transformation_matrix;
    },

    rotate: function(matrix, heading) {
        var rotation_matrix = [[heading.x, heading.y, 0], [-heading.y, heading.x, 0], [0, 0, 1]];
        return Game.multiply(matrix, rotation_matrix);
    },

    translate: function(matrix, position) {
        var translation_matrix = [[1, 0, 0], [0, 1, 0], [position.x, position.y, 1]];
        return Game.multiply(matrix, translation_matrix);
    },

    transformVector2D: function(matrix, point) {
        var x = matrix[0][0] * point.x + matrix[1][0] * point.y + matrix[2][0];
        var y = matrix[0][1] * point.x + matrix[1][1] * point.y + matrix[2][1];

        return new Vector2(x, y);
    },

    vectorToWorldSpace: function(vector, heading) {
        var transformation_matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        transformation_matrix = Game.rotate(transformation_matrix, heading);

        return Game.transformVector2D(transformation_matrix, vector);
    },

    interceptCircleLine: function(circle, line) {
        var b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
        v1 = {};
        v2 = {};

        v1.x = line.endX - line.startX;
        v1.y = line.endY - line.startY;
        v2.x = line.startX - circle.position.x;
        v2.y = line.startY - circle.position.y;

        b = (v1.x * v2.x + v1.y * v2.y);
        c = 2 * (v1.x * v1.x + v1.y * v1.y);
        b *= -2;
        d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.r * circle.r));

        // no intercept
        if(isNaN(d)){
            return [];
        }

        // these represent the unit distance of point one and two on the line
        u1 = (b - d) / c;
        u2 = (b + d) / c;

        // return points
        retP1 = {};
        retP2 = {}

        // return array
        ret = [];

        // add point if on the line segment
        if(u1 <= 1 && u1 >= 0){
            retP1.x = line.startX + v1.x * u1;
            retP1.y = line.startY + v1.y * u1;
            ret[0] = retP1;
        }

        // second add point if on the line segment
        if(u2 <= 1 && u2 >= 0){
            retP2.x = line.startX + v1.x * u2;
            retP2.y = line.startY + v1.y * u2;
            ret[ret.length] = retP2;
        }

        return ret;
    },

    multiply: function(a, b) {
    var aNumRows = a.length, aNumCols = a[0].length,
        bNumRows = b.length, bNumCols = b[0].length,
        m = new Array(aNumRows);  // initialize array of rows
    for (var r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols); // initialize the current row
        for (var c = 0; c < bNumCols; ++c) {
            m[r][c] = 0;             // initialize the current cell
            for (var i = 0; i < aNumCols; ++i) {
                m[r][c] += a[r][i] * b[i][c];
            }
        }
    }
    return m;
},

    over: function(status) {
        Game.pause = true;
        document.getElementById("over").className = status;
        document.getElementById("over").style.display = 'flex';
    }
};

window.onload  = function() {
    Game.init();
};

window.onresize = function() {
  Game.layout();
};
