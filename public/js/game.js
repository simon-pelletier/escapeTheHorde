var speed = 3;
var jumpForce = 1000;
var worldLength = 5000;
var gravityG = 2000;

var config = {
  type: Phaser.AUTO, width: 800, height: 600,
  physics: { default: 'arcade', arcade: { gravity: { y: gravityG }, debug: false } },
  scene: { preload: preload, create: create, update: update }
};

var game = new Phaser.Game(config);
var platforms;

var blocWidth = 50;
var baseGroundLength = worldLength / blocWidth + 1;

function preload() {
  this.load.image('ship', 'assets/spaceShips_001.png');
  this.load.image('otherPlayer', 'assets/enemyBlack5.png');
  this.load.image('star', 'assets/star_gold.png');
  this.load.image('ground01', 'assets/ground01.png');
  this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
  var self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();

  this.cameras.main.setBounds(0, 0, worldLength, 1000);
  this.physics.world.setBounds(0, 0, worldLength, 1000);

  /*this.add.image(0, 0, 'star').setOrigin(0);
  this.add.image(1920, 0, 'star').setOrigin(0).setFlipX(true);
  this.add.image(0, 1080, 'star').setOrigin(0).setFlipY(true);
  this.add.image(1920, 1080, 'star').setOrigin(0).setFlipX(true).setFlipY(true);*/

  platforms = this.physics.add.staticGroup();

  //GROUND GENERATION
  for (var i = 0; i < baseGroundLength; i++){
    platforms.create(i * blocWidth, 700, 'ground01');
  }

  //PLATFORM GENERATION
  for (var i = 10; i < 20; i++){
    platforms.create(i * blocWidth, 500, 'ground01');
  }


  // PLAYER CREATION
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        self.ship = self.physics.add.image(players[id].x, players[id].y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
        self.ship.setDrag(300);
        self.ship.setCollideWorldBounds(true);
        self.physics.add.collider(self.ship, platforms);
        self.cameras.main.startFollow(self.ship, true, 0.05, 0.05, 0, 200);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });

  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  this.socket.on('playerMoved', function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });

  this.cursors = this.input.keyboard.createCursorKeys();

  //  this.cameras.main.startFollow(player, true, 0.05, 0.05);

  //this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
  //this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });

  /*this.socket.on('scoreUpdate', function (scores) {
    self.blueScoreText.setText('Blue: ' + scores.blue);
    self.redScoreText.setText('Red: ' + scores.red);
  });

  this.socket.on('starLocation', function (starLocation) {
    if (self.star) self.star.destroy();
    self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
    self.physics.add.overlap(self.ship, self.star, function () {
      this.socket.emit('starCollected');
    }, null, self);
  });*/

  //this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  //this.cameras.main.startFollow(player);


}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

function update() {
  if (this.ship) {
    // LEFT
    if (this.cursors.left.isDown ) {
      this.ship.setVelocityX( - 160 * speed);
    // RIGHT
    } else if (this.cursors.right.isDown ) {
      this.ship.setVelocityX( 160 * speed);
    } else {
      this.ship.setVelocityX(0);
      //this.ship.setAngularVelocity(0);
    }
    // UP
    if (this.cursors.up.isDown && this.ship.body.touching.down) {
      this.ship.setVelocityY( - jumpForce);
    }

    //this.physics.world.wrap(this.ship, 5);

    // emit player movement
    /*var x = this.ship.x;
    var y = this.ship.y;
    var r = this.ship.rotation;
    if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
      this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation });
    }
    // save old position data
    this.ship.oldPosition = {
      x: this.ship.x,
      y: this.ship.y,
      rotation: this.ship.rotation
    };*/
    this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y - 170, rotation: this.ship.rotation });
  }

  //this.socket.emit('playerMovement', { x: this.otherPlayers.x, y: this.otherPlayers.y, rotation: this.otherPlayers.rotation });
}
