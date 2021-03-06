

class Opponent {
    constructor(startx, starty, id, color) {
        this.startX = startx;
        this.startY = starty;
        this.x = startx;
        this.y = starty;
        this.storeX = startx;
        this.storeY = starty;
        this.color = color;
        this.oppId = id;
        this.radius = 50;
        this.dir = 0;
    }

    set direction(str) {
        this.dir = str;
    }

    get id() {
        return this.oppId;
    }

    get startXY() {
        return {
            'x': this.startX,
            'y': this.startY,
            'nx': 25 + this.startX,
            'ny': 25 + this.startY,
            'id': this.id
        }
    }

    display(getX, getY, getTheta) {
        //displays opponent players depending on their x, y, angle of their aimer
        if(getX !== this.storeX && getY !== this.storeY) {
            //if the x don't match, update direction
            this.x = getX;
            this.y = getY;
            this.storeX = getX;
            this.storeY = getY;

        } else {
            //keep moving in same direction
            switch(this.dir) {
                case 'right':
                    this.x += 3;
                    break;
                case 'left':
                    this.x -= 3;
                    break;
                case 'down':
                    this.y += 3;
                    break;
                case 'up':
                    this.y -= 3;
                    break;
            }
        }

            //actually display player
            fill(this.color);
            noStroke();
            circle(this.x, this.y, this.radius);

            let nx = (Math.cos(getTheta)*25) + this.x;
            let ny = (-Math.sin(getTheta)*25) + this.y;
            stroke(255);
            strokeWeight(3);
            line(this.x, this.y, nx, ny);
    }


}