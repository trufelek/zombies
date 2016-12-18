Wall.all = {};
Wall.count = 0;

function Wall() {
    this.id = Wall.count.toString();
    this.color = 'rgb(215, 255, 44)';
    this.from;
    this.to;
    this.size;
    this.walls = [
        {
            from: {x: 0, y: 0},
            to: {x: Game.width, y: 0},
            size: Game.width
        },
        {
            from: {x: Game.width, y: 0},
            to: {x: Game.width, y: Game.height},
            size: Game.height
        },
        {
            from: {x: Game.width, y: Game.height},
            to: {x: 0, y: Game.height},
            size: Game.width
        },
        {
            from: {x: 0, y: Game.height},
            to: {x: 0, y: 0},
            size: Game.height
        }
    ];

    Wall.count ++;
    Wall.all[this.id] = this;
};

Wall.draw = function() {
    var index = 0;

    for(w in Wall.all) {
        Wall.all[w].from = Wall.all[w].walls[index].from;
        Wall.all[w].to = Wall.all[w].walls[index].to;
        Wall.all[w].size = Wall.all[w].walls[index].size;

        Game.ctx.beginPath();
        Game.ctx.moveTo(Wall.all[w].from.x, Wall.all[w].from.y);
        Game.ctx.lineTo(Wall.all[w].to.x, Wall.all[w].to.y);
        Game.ctx.strokeStyle = Wall.all[w].color;
        Game.ctx.stroke();
        Game.ctx.closePath();

        index ++;
    }
};