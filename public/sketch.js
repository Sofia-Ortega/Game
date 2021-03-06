var hit = false;
var coord;
var opp, tempXY, tempTheta;
var p1, border, shot, bulletShot;
var newRect; // For future teleportation feature
var oppArray = []
var bullets = [];
let rgb = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
var oppXY = {};
var oppAim = {};


var socket = io();
function setup() {
    //...............................................Receiving..........................................
    socket.on('startPacket', playerId => {
        //When player first connects, gets dict of all currently connected players and info to add to opp class
        //FIXME: on localhost, people are not receiving the startPacket
            //--> new players can't see old players
            // not issue in heroku
        print('startPacket:');
        for (let id in playerId) {
            oppArray.push(new Opponent(playerId[id].x, playerId[id].y, id, playerId[id].color));
        }

        //startXY begins at ea player's starting point
        oppArray.forEach(opp => {
            oppXY[opp.id] = opp.startXY;
        })
    })
    socket.on('oppConnect', (connectId) => {
        //once a new opp connects, already connected players get opp's info
        print('oppConnect:', connectId);
        var tempOpp = new Opponent(connectId.x, connectId.y, connectId.id, connectId.color)
        oppArray.push(tempOpp);
        oppXY[tempOpp.id] = tempOpp.startXY;
    })
    socket.on('oppDisconnect', disconnectId => {
        //once opp disconnects, get their id and we delete from oppArray, oppXY, and oppAim
        let i;
        for(i = oppArray.length; i >= 0; i -= 1) {
            if(oppArray[i]){
                if(oppArray[i].id === disconnectId){
                    oppArray.splice(i, 1);
                    break;
                }
            }
        }
        delete oppXY[disconnectId]
        delete oppAim[disconnectId]

    })
    socket.on('oppXY', (data) => {
        //Gets everyone's (including client himself) coordinates (x, y, nx, ny). Store in oppXY var and delete own info
        oppXY[data.id] = data;

    });
    socket.on('oppTheta', data => {
        //receives theta from opp and applies it to oppAim according id
        oppAim[data.id] = data;
    })
    socket.on('bulletShot', data => {
        //Starts new Bullet class with bullet data of x, y, change in x (dirx), and change in y (diry)
        bullets.push(new Bullet(data.x, data.y, data.dirx, data.diry))
    })

    //...............................Canvas Setup.....................................
    createCanvas(600, 600);

    //initialize player in player class in random location w random color
    p1 = new Player(rgb, Math.floor(Math.random()*(width-100)+50), Math.floor(Math.random()*(height-100)+50));

    //send starter info to server
    socket.emit('startInfo', p1.startInfo)

    //newRect = new Boundaries(500, 50, 60, 100);
    border = new Boundaries(0, 0, width, height);

}

//.............................................Draw.....................................................................
function draw() {
    background(50);

    //displaying shapes
    p1.display();
    //newRect.display(); //test for future teleport implementation (with line 123)
    bullets.forEach(bullets => {
        bullets.display();
    })


    //........................Opponent.................................................
    oppArray.forEach(opp => {
        if(oppXY[opp.id]) {
            opp.direction = oppXY[opp.id].dir;
            tempXY = oppXY[opp.id];
            tempTheta = oppAim[opp.id]
            opp.display(tempXY.x, tempXY.y,tempTheta ? tempTheta.theta : 0);
        }
    })

    //..................................Updating player...............................

    //updating coordinates
    p1.controls();
    bullets.forEach(bullets => {
        bullets.update();
    })

    //shoots bullets
    shot = p1.shoot();
    if (shot) {
        bulletShot = new Bullet(shot.x, shot.y, shot.dirx, shot.diry)
        socket.emit('newBullet', bulletShot.sendInfo)
        bullets.push(bulletShot);

    }

    //checking if hit
    coord = p1.coordinates;
    //for future teleporter implementation
    hit = /*newRect.checkHit(coord[0], coord[1]) || */!(border.checkHit(coord[0], coord[1]));


    //if hit, teleport player to starting position and clear bullets
    if (hit) {
        p1.teleport(true);
        socket.emit('xyPlayer', p1.sendMove);
        bullets = [];
    }

    //clear off-screen bullets
    bullets = clearBullet(bullets);

    //emits xy location of player
    if(p1.changeCoord) {
        //print('changed direction')
        socket.emit('xyPlayer', p1.sendMove);
    }
    //emits theta of player aimer
    if(p1.changeAim) {
        socket.emit('thetaPlayer', p1.sendAim);
    }

}

//alerting what key is pressed
function keyPressed() {
    if(keyCode === 87) {
        p1.direction = 'up';
    } else if(keyCode === 83) {
        p1.direction = 'down';
    } else if(keyCode === 65) {
        p1.direction = 'left';
    } else if(keyCode === 68) {
        p1.direction = 'right';
    }
}


