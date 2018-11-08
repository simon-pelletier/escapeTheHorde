var speed = 3;
var jumpForce = 1000;
var worldLength = 5000;
var gravityG = 2000;

var config = {
  type: Phaser.AUTO, width: 1200, height: 600,
  physics: { default: 'arcade', arcade: { gravity: { y: gravityG }, debug: false } },
  scene: { preload: preload, create: create, update: update }
};

var game = new Phaser.Game(config);
var platforms;
var trees;
var player;

var isMaster = false;

var keyLeft;
var keyRight;
var keyUp;
var keyUpSpace;
var keyDown;
var keyDash;

var blocWidth = 50;
var baseGroundLength = worldLength / blocWidth + 1;

function preload() {
  this.load.spritesheet('character', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
  this.load.image('ship', 'assets/spaceShips_001.png');
  this.load.image('otherPlayer', 'assets/enemyBlack5.png');
  this.load.image('star', 'assets/star_gold.png');
  this.load.image('ground01', 'assets/ground01.png');
  this.load.image('tree01', 'assets/tree01.png');

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
  trees = this.physics.add.staticGroup();

  // ARBRE GENERATION
  var treeNumbers = randomNumber(10, 50);

  for (var i = 0; i < 50; i++){
    var treePositionX = randomNumber(0, 5000);
    trees.create(treePositionX, 580, 'tree01');
  }

  //GROUND GENERATION
  for (var i = 0; i < baseGroundLength; i++){
    platforms.create(i * blocWidth, 700, 'ground01');
  }

  //PLATFORM GENERATION
  for (var i = 20; i < 30; i++){
    platforms.create(i * blocWidth, 300, 'ground01');
  }
  for (var i = 10; i < 20; i++){
    platforms.create(i * blocWidth, 500, 'ground01');
  }

  //isMaster = true;
  //PLAYER PRINCIPAL
  this.socket.on('currentPlayers', function (players) {
    isMaster = true;
    Object.keys(players).forEach(function (id) {

      console.log(players);
      if (players[1]){

      } else {

      }
    });
    console.log(isMaster);

  });




  // PLAYER CREATION
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        self.character = self.physics.add.sprite(players[id].x, players[id].y, 'character').setOrigin(0, 0);//.setDisplaySize(53, 40);
        self.character.setDrag(300);
        self.character.setCollideWorldBounds(true);
        self.physics.add.collider(self.character, platforms);
        self.cameras.main.startFollow(self.character, true, 0.05, 0.05, 0, 200);


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

  this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
  });

  this.anims.create({
      key: 'turn',
      frames: [ { key: 'character', frame: 4 } ],
      frameRate: 20
  });

  this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('character', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
  });

  this.cursors = this.input.keyboard.createCursorKeys();

  keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
  keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
  keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyUpSpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  /*this.keyRight = this.input.keyboard.addKey(Phaser.KeyCode.D);
  this.keyUp = this.input.keyboard.addKey(Phaser.KeyCode.W);
  this.keyDown = this.input.keyboard.addKey(Phaser.KeyCode.S);*/

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

  resizeWindow();
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'character').setOrigin(0.5, 0.5);//.setDisplaySize(53, 40);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

function update() {
  if (this.character) {

    // LEFT
    if (this.cursors.left.isDown || keyLeft.isDown) {
      this.character.setVelocityX( - 160 * speed);
      this.character.anims.play('left', true);
      //this.character.play('left', true);
    // RIGHT
  } else if (this.cursors.right.isDown || keyRight.isDown) {
      this.character.setVelocityX( 160 * speed);
      this.character.anims.play('right', true);
    } else {
      this.character.setVelocityX(0);
      this.character.anims.play('turn');
      //this.ship.setAngularVelocity(0);
    }
    // UP
    if ((this.cursors.up.isDown || keyUp.isDown || keyUpSpace.isDown) && this.character.body.touching.down) {
      this.character.setVelocityY( - jumpForce);
    }

    // DASH
    if (this.cursors.shift.isDown && this.character.body.touching.down) {
      //this.character.setVelocityY( - jumpForce);
      if (this.cursors.left.isDown) {
        this.character.setVelocityX( - 400);
      }
      if (this.cursors.right.isDown) {
        this.character.setVelocityX( 400);
      }
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
    this.socket.emit('playerMovement', { x: this.character.x, y: this.character.y - 170, rotation: this.character.rotation });
    //resizeWindow();
  }

  //this.socket.emit('playerMovement', { x: this.otherPlayers.x, y: this.otherPlayers.y, rotation: this.otherPlayers.rotation });
}

function randomNumber(min,max) // min and max included
  {
      return Math.floor(Math.random()*(max-min+1)+min);
  }

function resizeWindow(){
  var canvasElt = document.getElementsByTagName('canvas')[0];
  heightG = window.innerHeight;
  widthG = window.innerWidth;
  canvasElt.style.left = (widthG / 2) - (1200/2) + 'px';
  canvasElt.style.top = (heightG / 2) - (600/2) + 'px';
}
window.onresize = resizeWindow;
