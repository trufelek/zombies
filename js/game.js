Game = {
    fps: 60,
    width: 0,
    height: 0,
    lastTime: 0,
    lastUpdate: -1,
    controls: [32, 37, 38, 39, 40, 49, 50, 18],
    obstacles: 6,
    enemies: 1,
    keys: {},
    pause: false,
    init: function() {
        // inicjacja canvas
        Game.canvas = document.getElementById('canvas');
        Game.ctx = Game.canvas.getContext('2d');

        Game.layout();

        Game.hero = new Hero();

        for (var i = 0; i < Game.obstacles; i++) {
            new Obstacle();
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
        // layout gry
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
        //kontrolki
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
                    Game.laser = new Laser();
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
        // główna pętla gry
        if(Game.pause) return;
        requestAnimationFrame(Game.animationLoop);

        if(time - Game.lastTime >= 1000 / Game.fps) {
            Game.lastTime = time;
            Game.ctx.clearRect(0,0, Game.width, Game.height);

            Game.hero.draw();
            Obstacle.draw();
            Enemy.draw();
            Bullet.draw();

            Enemy.wander();

            if(Game.hero.weapons['laser']) {
                Game.laser.draw();
                Game.laser.cooling();
            }
        }

    },
    rand: function(min, max) {
        // rng
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    random: function(min, max) {
        // rng
        return Math.random() * max + min;
    },
    sphereCollisionDetection: function(x1, y1, r1, x2, y2, r2) {
        // prosta detekcja kolizji dwóch sfer
        var sum = r1 + r2;
        var distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        return sum >= distance;
    },
    reset: function() {
        // restart gry
        Game.pause = true;
        location.reload();
    }
};

window.onload  = function() {
    Game.init();
};

window.onresize = function() {
  Game.layout();
};
