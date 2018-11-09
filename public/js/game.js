// VARIABLES DE CONFIG
var speed = 1;
var jumpForce = 1000;
var worldLength = 5000;
var gravityG = 2000;

// CONFIGURATION PHASER
var config = {
  type: Phaser.AUTO, width: 1200, height: 600,
  physics: { default: 'arcade', arcade: { gravity: { y: gravityG }, debug: false } },
  scene: { preload: preload, create: create, update: update }
};

// VARIABLES ELEMENTS
var game = new Phaser.Game(config);
var platforms;
var trees;
var zombies;
var player;

// VARIABLES KEY BIND
var keyLeft;
var keyRight;
var keyUp;
var keyUpSpace;
var keyDown;
var keyDash;

// VARIABLES GRAPHIQUES
var blocWidth = 50;
var baseGroundLength = worldLength / blocWidth + 1;
var isNotJumping = true;
var isNotRunning = true;
var timeText;

var goToTheRight = true;
var lookToTheRight = true;
var zombiesSpeed = [];
var playersNumber = 0;
var clientPlayerName;
var clientIsMaster = false;

// PRELOADER
function preload() {
  //this.load.json('jsonData', 'assets/data/map.json');
  this.load.spritesheet('character', 'assets/player.png', { frameWidth: 90, frameHeight: 100 });
  this.load.spritesheet('zombie01', 'assets/Z.png', { frameWidth: 90, frameHeight: 100 });
  this.load.image('ground01', 'assets/ground01.png');
  this.load.image('tree01', 'assets/tree01.png');
}


function seedCreation(){

  var seed = [];
  var level = []
  var mapLevel = 1;
  level.push(mapLevel);
  seed.push(level);

  var mapLevel = [];
  for (var i = 0; i < 20; i++){
    var treePositionX = randomNumber(0, 5000);
    var tree = ['trees', treePositionX, 580, 'tree01'];
    mapLevel.push(tree);
  }

  for (var i = 0; i < baseGroundLength; i++){
    var platform = ['platforms', i * blocWidth, 700, 'ground01'];
    mapLevel.push(platform);
  }

  seed.push(mapLevel);

  var seedObj = Object.assign({}, seed);
  console.log(seedObj);


//LVL
  //MAPLEVEL
  //
//MAP
  //GROUP (trees - platform)
  //POSITIONX
  //POSITIONY
  //NAME (tree01 - ground01)



  // TREES GENERATION
  /*var treeNumbers = randomNumber(10, 50);
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
  }*/
}
seedCreation();


function worldCreation(){
  var map;
}

// LAUNCHER
function create() {
  //console.log(this.cache.json.get('jsonData'));
  var self = this;
  this.socket = io();

  // Viseur
  var BetweenPoints = Phaser.Math.Angle.BetweenPoints;
  var SetToAngle = Phaser.Geom.Line.SetToAngle;
  var velocityFromRotation = this.physics.velocityFromRotation;
  var gfx = this.add.graphics().setDefaultStyles({ lineStyle: { width: 2, color: 0xffdd00, alpha: 0.2 } });
  var velocity = new Phaser.Math.Vector2();
  var line = new Phaser.Geom.Line();
  /*console.log(pointer);
  var angle = BetweenPoints(self.character, pointer);
  SetToAngle(line, self.character.x + 45, self.character.y + 40, angle, 308);
  velocityFromRotation(angle, 600, velocity);
  gfx.clear().strokeLineShape(line);*/


  timeText = this.add.text(100, 200);

  // Déclaration de groupes
  this.otherPlayers = this.physics.add.group();
  platforms = this.physics.add.staticGroup();
  trees = this.physics.add.staticGroup();

  //zombies = this.add.group();
  zombies = this.physics.add.group();

  // Configuration Caméra
  this.cameras.main.setBounds(0, 0, worldLength, 1000);
  this.physics.world.setBounds(0, 0, worldLength, 1000);

  // Génération du monde
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

  var zWalking = this.anims.create({
      key: 'zwalking',
      frames: this.anims.generateFrameNumbers('zombie01', { start: 21, end: 43}),
      frameRate: 13,
      repeat: -1
  });

  this.physics.add.collider(zombies, platforms);

  // Generation de Z
  var i = 0;
  function myLoop () {
     setTimeout(function () {
       var speedOfThisZ = randomNumber(10, 60);
       zombies.create(800, 200, 'zombie01').setCollideWorldBounds(true).play('zwalking');
       zombiesSpeed.push(speedOfThisZ);
        i++;
        if (i < 20) {
           myLoop();
        }
     }, randomNumber(200,1000))
  }
  myLoop();



  // Création d'un nouveau joueur (self)
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        playersNumber++;
        if (playersNumber == 1) {
          clientIsMaster = true;
        }
        clientPlayerName = players[id].playerName;
        self.character = self.physics.add.sprite(players[id].x, players[id].y, 'character').setOrigin(0, 0);//.setDisplaySize(53, 40);
        self.character.setDrag(300);
        self.character.setCollideWorldBounds(true);
        self.physics.add.collider(self.character, platforms);
        self.cameras.main.startFollow(self.character, true, 0.05, 0.05, 0, 100);
      } else {
        playersNumber++;
        addOtherPlayers(self, players[id]);
      }
    });
  });
  // Affichage d'un autre nouveau joueur
  this.socket.on('newPlayer', function (playerInfo) {
    playersNumber++;
    addOtherPlayers(self, playerInfo);
  });
  // Deconnexion d'un joueur
  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        playersNumber--;
        otherPlayer.destroy();
      }
    });
  });
  // Mouvement d'un autre joueur
  this.socket.on('playerMoved', function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });

  // ANIMATIONS
  // Player animation
  this.anims.create({
      key: 'walking',
      frames: this.anims.generateFrameNumbers('character', { start: 0, end: 10 }),
      frameRate: 12,
      repeat: -1
  });
  this.anims.create({
      key: 'running',
      frames: this.anims.generateFrameNumbers('character', { start: 44, end: 51 }),
      frameRate: 12,
      repeat: -1
  });
  this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('character', { start: 11, end: 26 }), //22 36
      frameRate: 12,
      repeat: -1
  });
  this.anims.create({
      key: 'jumping',
      frames: this.anims.generateFrameNumbers('character', { start: 27, end: 43 }),
      frameRate: 15,
      repeat: 0
  });

  // Configuration des touches
  this.input.mouse.disableContextMenu();
  this.cursors = this.input.keyboard.createCursorKeys();
  keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
  keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
  keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyUpSpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // JUMP SPACE config
  this.input.keyboard.on('keydown_SPACE', function (event) {
    if (self.character.body.touching.down) {
      self.character.setVelocityY( - jumpForce);
      isNotJumping = false;
      self.character.anims.play('jumping', true);
      self.character.on('animationcomplete', animComplete, this);
    }
  });

  // POINTER MOVEMENT
  this.input.on('pointermove', function (pointer) {
    if (self.character) {
      var slide = self.input.mousePointer.worldX - pointer.x;
      if (self.character.x > (pointer.x - 45 + slide)){
        self.character.flipX = true;
        self.lookToTheRight = false;
      } else {
        self.character.flipX = false;
        self.lookToTheRight = true;
      }
    }
  });

  // Position du canvas (html)
  resizeWindow();
}

function animComplete(animation, frame){


  if(animation.key === 'jumping'){
    isNotJumping = true;
    //this.animKeyStack.pop();
    //this.currentAnim = this.animKeyStack[this.animKeyStack.length - 1];
    //this.anims.play(this.currentAnim, true);
  }
  /*if(animation.key === 'running'){
    isNotRunning = true;
    //this.animKeyStack.pop();
    //this.currentAnim = this.animKeyStack[this.animKeyStack.length - 1];
    //this.anims.play(this.currentAnim, true);
  }*/

}

// Ajout d'autres nouveaux joueurs
function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'character').setOrigin(0, 0);//.setDisplaySize(53, 40);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

// UPDATER
function update(time, delta) {
  var slideCamera = this.cameras.main._scrollX;
  var zombiesNumber = zombies.getChildren().length;


  if (this.character) {
    for (var z = 0; z < zombiesNumber; z++){

      var range = (zombies.getChildren()[z].x - 45 ) - this.character.x;
      var verticalRange = (zombies.getChildren()[z].y - 45 ) - this.character.y;
      if (range > 0 && Math.abs(verticalRange) < 80) {
        zombies.getChildren()[z].setVelocityX( - self.zombiesSpeed[z] * speed);

        zombies.getChildren()[z].flipX = true;
      } else if (range < 0 && Math.abs(verticalRange) < 80){
        zombies.getChildren()[z].setVelocityX( self.zombiesSpeed[z] * speed);
        zombies.getChildren()[z].flipX = false;
      } else {
        //si  il n'est pas au même étage
        if ( self.zombiesSpeed[z] % 2 == 0 ) {
          zombies.getChildren()[z].setVelocityX( self.zombiesSpeed[z] * speed);
          zombies.getChildren()[z].flipX = false;
        } else {
          zombies.getChildren()[z].setVelocityX( - self.zombiesSpeed[z] * speed);
          zombies.getChildren()[z].flipX = true;
        }

      }
    }
  }

  timeText.setText(
    'Time: ' + time.toFixed(0) +
    '\nDelta: ' + delta.toFixed(2) +
    '\nLevel: --' +
    '\nPlayers Number: ' + playersNumber +
    '\nZombies Number: ' + zombiesNumber +
    '\nMaster: ' + clientIsMaster +
    '\nPlayer Name: ' + clientPlayerName);

  timeText.x = slideCamera +100;
  var self_player = this.character;

  // Déplacement du player (self)
  if (this.character) {

    // LEFT
    if (this.cursors.left.isDown || keyLeft.isDown) {
      this.character.setVelocityX( - 160 * speed);
      if (isNotJumping) {
        if (isNotRunning) {
          if (this.lookToTheRight) {
            this.character.anims.playReverse('walking', true);
          } else {
            this.character.anims.play('walking', true);
          }
        } else {
          if (this.lookToTheRight) {
            this.character.anims.playReverse('running', true);
          } else {
            this.character.anims.play('running', true);
          }
        }

      }

    // RIGHT
  } else if (this.cursors.right.isDown || keyRight.isDown) {
      this.character.setVelocityX( 160 * speed);
      if (isNotJumping) {
        if (isNotRunning) {

          if (this.lookToTheRight) {
            this.character.anims.play('walking', true);
          } else {
            this.character.anims.playReverse('walking', true);
          }

        } else {

          if (this.lookToTheRight) {
            this.character.anims.play('running', true);
          } else {
            this.character.anims.playReverse('running', true);
          }

        }


      }


    // IDLE
    } else {
      this.character.setVelocityX(0);

      if (isNotJumping) {
        this.character.anims.play('idle', true);
      }
    }

    // RUNNING
    if (this.cursors.shift.isDown) {
      isNotRunning = false;
      if (this.cursors.left.isDown || keyLeft.isDown) {
        this.character.setVelocityX(-400);
      }
      if (this.cursors.right.isDown || keyRight.isDown) {
        this.character.setVelocityX(400);
      }
    } else {
      isNotRunning = true;
    }

    // Envoi des mouvements joueur (self)
    this.socket.emit('playerMovement', { x: this.character.x, y: this.character.y - 170, rotation: this.character.rotation });


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

  }
}

// Random Number
function randomNumber(min,max){
      return Math.floor(Math.random()*(max-min+1)+min);
}

// Resize window
function resizeWindow(){
  var canvasElt = document.getElementsByTagName('canvas')[0];
  heightG = window.innerHeight;
  widthG = window.innerWidth;
  canvasElt.style.left = (widthG / 2) - (1200/2) + 'px';
  canvasElt.style.top = (heightG / 2) - (600/2) + 'px';
}
window.onresize = resizeWindow;
