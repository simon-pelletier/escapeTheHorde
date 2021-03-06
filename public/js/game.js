// VARIABLES DE CONFIG
var speed = 1;
var jumpForce = 6;
var worldLength = 3000;
var gravityG = 1;
var zombiesPop = 10;

var devMod = true;

// CONFIG PHASER
var config = {
  type: Phaser.AUTO, //width: 1200, height: 600,
  scale: {
        width: 1200,
        height: 600,
        scale: 'SHOW_ALL',
        orientation: 'LANDSCAPE'
    },
  //physics: { default: 'arcade', arcade: { gravity: { y: gravityG }, debug: false } },
  scene: { preload: preload, create: create, update: update, physics: {
      matter: {
          debug: devMod,
          gravity: { y: gravityG }
      },
      arcade: { gravity: { y: gravityG }, debug: false }
  },
  extend: {
            zGeneration: zGeneration,
        }
 },
 title: 'Escape the Horde',
 version: '1.0'
};

// VARIABLES ELEMENTS
var game = new Phaser.Game(config);
var zArray = [];
var gameStarted = false;
var textInfo;
var iZ = 0;
var bulletId = 0;
var bulletParticlesArray = [];

// VARIABLES KEY BIND
var keyLeft;
var keyRight;
var keyUp;
var keyUpSpace;
var keyDown;
var keyDash;

//VARIABLES CATEGORIES
var catZ;
var catPlayer;
var catGround;
var catBullet;

// VARIABLES GRAPHIQUES
var background;
var blocWidth = 50;
var baseGroundLength = worldLength / blocWidth + 1;
var timeText;

// VARIABLES PLAYER
var player;
var isNotJumping = true;
var isNotRunning = true;
var isAttacking = false;
var goToTheRight = true;
var lookToTheRight = true;
var playersNumber = 0;
var clientPlayer;
var weaponCurrentPlayer;
var clientIsMaster = false;

// PRELOAD /////////////////////////////////////////////////////////////////////
function preload() {
  // RESIZE PRELOAD
  resizeWindow();

  // Text info chargement
  textInfo = this.add.text(600, 300, 'Loading...', { font: '25px Courier', fill: '#85bb13' });

  // SPRITE
  this.load.spritesheet('character', 'assets/player.png', { frameWidth: 90, frameHeight: 100 });
  this.load.spritesheet('zombie01', 'assets/Z.png', { frameWidth: 90, frameHeight: 100 });

  // IMAGE
  this.load.image('ground300', 'assets/ground300.png');
  this.load.image('platform01', 'assets/platform01.png');
  this.load.image('tree01', 'assets/tree01.png');
  this.load.image('tree02', 'assets/tree02.png');
  this.load.image('tree03', 'assets/tree03.png');
  this.load.image('tree04', 'assets/tree04.png');
  this.load.image('tree05', 'assets/tree05.png');
  this.load.image('tree06', 'assets/tree06.png');
  this.load.image('grass01', 'assets/grass01.png');
  this.load.image('grass02', 'assets/grass02.png');
  this.load.image('grass03', 'assets/grass03.png');
  this.load.image('grass04', 'assets/grass04.png');
  this.load.image('bush01', 'assets/bush01.png');
  this.load.image('bush02', 'assets/bush02.png');
  this.load.image('bush03', 'assets/bush03.png');
  this.load.image('fence01', 'assets/fence01.png');
  this.load.image('fence02', 'assets/fence02.png');
  this.load.image('camp01', 'assets/camp01.png');
  this.load.image('bush01', 'assets/bush01.png');
  this.load.image('bullet', 'assets/bullet.png');
  this.load.image('rain', 'assets/rain.png');
  this.load.image('fog', 'assets/fog.png');
  this.load.image('bg01', 'assets/bg01.png');
  this.load.image('megaphone01', 'assets/megaphone01.png');
  this.load.image('firebase01', 'assets/firebase01.png');
  this.load.image('weapon01', 'assets/weapon01.png');

  // AUDIO
  this.load.audio('theme', ['assets/audio/theme.mp3']);
  this.load.audio('walk', ['assets/audio/walk.wav']);
  this.load.audio('run', ['assets/audio/run.wav']);
  this.load.audio('pistolshot', ['assets/audio/pistolshot.wav']);
  this.load.audio('alarm', ['assets/audio/alarm.wav']);
  this.load.audio('rain', ['assets/audio/rain.wav']);
  this.load.audio('coucou', ['assets/audio/coucou.wav']);
  this.load.audio('crickets', ['assets/audio/crickets.wav']);
  this.load.audio('z01', ['assets/audio/z01.wav']);
  this.load.audio('z02', ['assets/audio/z02.wav']);
  this.load.audio('z03', ['assets/audio/z03.wav']);
}

// CREATE //////////////////////////////////////////////////////////////////////
function create() {
  // Infos & Config
  var self = this;
  this.socket = io();
  textInfo.setText('');
  this.matter.world.setBounds();
  this.input.setDefaultCursor('url(assets/cur2.cur), pointer');
  timeText = this.add.text(100, 200);

  // Background
  background = this.add.image(0, 0, 'bg01');
  background.setOrigin(0,0);
  background.setDisplaySize(1200,600);
  background.setScale(1.2,1.2);

  // Graphisme Global Fixe
  var bottomMask = this.add.graphics();
  bottomMask.fillStyle(0x331e01, 1);
  bottomMask.fillRect(0, 700, worldLength, 300);

  // PARTICLES RAIN & FOG
  if (!devMod) {
    var rainning = this.add.particles('rain');
    rainning.createEmitter({
      x: { min: 0, max: worldLength },
      y: { min: 0, max: 1000 },
      lifespan: 5000,
      speedX: { min: -20, max: 20 },
      speedY: { min: 500, max: 900 },
      scale: { start: 0.5, end: 0.1 },
      quantity: 5,
      frequency: 30,
      blendMode: 'ADD'
    });
    var fog = this.add.particles('fog');
    fog.createEmitter({
      x: { min: 0, max: worldLength },
      y: { min: 900, max: 900 },
      lifespan: 9000,
      speedX: { min: 5, max: 100 },
      speedY: { min: -1, max: -3 },
      scale: { start: 1, end: 2 },
      rotate: { min: -40, max: 40 },
      alpha: { start: 0.2, end: 0, ease: 'Quad.easeIn' },
      frequency: 150,
      maxParticles: 100,
      blendMode: 'ADD'
    });
    var fog2 = this.add.particles('fog');
    fog2.createEmitter({
      x: { min: 0, max: worldLength },
      y: { min: 900, max: 900 },
      lifespan: 9000,
      speedX: { min: 5, max: 10 },
      speedY: { min: -1, max: -3 },
      scale: { start: 0.5, end: 2 },
      rotate: { min: -40, max: 40 },
      alpha: { start: 0.2, end: 0, ease: 'Quad.easeIn' },
      frequency: 100,
      maxParticles: 100,
      blendMode: 'ADD'
    });
  }



  // GRAPHISME START ZONE
  var megaPhoneElt = this.add.image(0, 0, 'megaphone01');
  megaPhoneElt.setPosition(600,520);
  var fenceStart = this.add.image(0, 0, 'fence01');
  fenceStart.setPosition(60,580);
  var fenceStart2 = this.add.image(0, 0, 'fence01');
  fenceStart2.setPosition(400,580);

  // PROFONDEURS (z-index)
  background.setDepth(-10);
  if (!devMod) {
    fog.setDepth(-9);
    rainning.setDepth(-8);
    fog2.setDepth(1);
  }
  bottomMask.setDepth(-7);
  fenceStart.setDepth(-7);
  fenceStart2.setDepth(-7);
  megaPhoneElt.setDepth(-6);


  // D??claration de groupes ???
  this.otherPlayers = this.add.group();

  // SETUP CAMERA
  this.cameras.main.setBounds(0, 0, worldLength, 750);
  this.matter.world.setBounds(0, 0, worldLength, 1000);

  // SONS
  var themeSound = this.sound.add('theme');
  themeSound.volume = 0.1;
  themeSound.loop = true;

  var walkingSound = this.sound.add('walk');
  walkingSound.volume = 0.1;
  walkingSound.loop = true;
  var runningSound = this.sound.add('run');
  runningSound.volume = 0.1;
  runningSound.loop = true;
  var pistolShot = this.sound.add('pistolshot');
  pistolShot.volume = 0.2;
  var rainSound = this.sound.add('rain');
  rainSound.volume = 0.2;
  rainSound.loop = true;
  var coucouSound = this.sound.add('coucou');
  coucouSound.volume = 0.4;
  coucouSound.loop = true;
  var cricketsSound = this.sound.add('crickets');
  cricketsSound.volume = 0.3;
  cricketsSound.loop = true;

  if (!devMod) {
    themeSound.play();
    rainSound.play();
    coucouSound.play();
    cricketsSound.play();
  }

  // Z SOUNDS (random)

  var zSound01 = this.sound.add('z01');
  var zSound02 = this.sound.add('z02');
  var zSound03 = this.sound.add('z03');
  zSound01.volume = 0.5;
  zSound02.volume = 0.5;
  zSound03.volume = 0.5;
  var frequencyZSound = 200;
  var myFunction = function() {
    if (zArray.length > 1) {
      var selectionOfZSound = randomNumber(1, 3);
      var mySound;
      if (selectionOfZSound == 1) {
        mySound = zSound01;
      } else if(selectionOfZSound == 2){
        mySound = zSound02;
      } else {
        mySound = zSound03;
      }
      mySound.play();
    }
    frequencyZSound = randomNumber(500, 10000);
    setTimeout(myFunction, frequencyZSound);
  }
  setTimeout(myFunction, frequencyZSound);

  // GENERATION D'ITEMS FUNCTION
  function generateItem(itemName, range, itemsNumber, yPosition, flip, depth, collision){
    for (var i = 0; i < itemsNumber; i++){
      var xPosition = randomNumber(0, worldLength);
      var selectionBush = randomNumber(1, range);
      var item = self.matter.add.image(0, 0, itemName + selectionBush, null, { isStatic: true });
      if (flip) {
        var flipRandom = randomNumber(0, 1);
        if (flipRandom == 0) {
          item.flipX= true;
        }
      }
      item.setPosition( xPosition, yPosition );
      item.setCollisionCategory( collision );
      item.setDepth( depth );
    }
  }

  // GENERATION D'ITEMS
  if (!devMod) {
    generateItem('tree0', 6, randomNumber(15, 30), 450, true, -9, catGround);
    generateItem('bush0', 3, randomNumber(8, 16), 620, true, -6, catGround);
    generateItem('grass0', 4, randomNumber(10, 30), 648, true, 3, catGround);
    generateItem('camp0', 1, 1, 628, false, -1, catGround);
    generateItem('firebase0', 1, 1, 645, false, -1, catGround);
  }

  // DEFINITION CATEGORIES COLLIDERS
  catZ = this.matter.world.nextCategory();
  catPlayer = this.matter.world.nextCategory();
  catGround = this.matter.world.nextCategory();
  catBullet = this.matter.world.nextCategory();

  //GROUND GENERATION
  for (var i = 0; i < baseGroundLength; i++){
    var ground = this.matter.add.image(i * 300, 700, 'ground300', null, { isStatic: true });
    ground.setFriction(0);
    ground.setOrigin(0.75);
    ground.setDepth( -2 );
    ground.setCollisionCategory(catGround);
  }

  // ANIMATIONS
  this.anims.create({ key: 'walking', frames: this.anims.generateFrameNumbers('character', { start: 0, end: 10 }),
      frameRate: 12, repeat: -1 });
  this.anims.create({ key: 'running', frames: this.anims.generateFrameNumbers('character', { start: 44, end: 51 }),
      frameRate: 12, repeat: -1 });
  this.anims.create({ key: 'idle', frames: this.anims.generateFrameNumbers('character', { start: 11, end: 26 }),
      frameRate: 12, repeat: -1 });
  this.anims.create({ key: 'jumping', frames: this.anims.generateFrameNumbers('character', { start: 27, end: 43 }),
      frameRate: 15, repeat: 0 });
  var zWalking = this.anims.create({ key: 'zwalking', frames: this.anims.generateFrameNumbers('zombie01', { start: 0, end: 24}),
      frameRate: 18, repeat: -1 });
  var zHited = this.anims.create({ key: 'zhited', frames: this.anims.generateFrameNumbers('zombie01', { start: 25, end: 29}),
      frameRate: 13, repeat: 0 });
  var zAttack = this.anims.create({ key: 'zattack', frames: this.anims.generateFrameNumbers('zombie01', { start: 30, end: 47}),
      frameRate: 13, repeat: -1 });
  var zDie = this.anims.create({ key: 'zdie', frames: this.anims.generateFrameNumbers('zombie01', { start: 48, end: 69}),
      frameRate: 13, repeat: 0 });

  // NOUVEAU JOUEUR - Cr??ation
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        playersNumber++;
        if (playersNumber == 1) {
          clientIsMaster = true;
        }
        var Bodies = Phaser.Physics.Matter.Matter.Bodies;
        var rect = Bodies.rectangle(0, 0, 40, 100, { label: "playerBody" });
        weaponCurrentPlayer = self.add.image(200, 600, 'weapon01', null, { isStatic: true });
        weaponCurrentPlayer.setDepth(1);
        weaponCurrentPlayer.setOrigin(0.3, 0.5);
        var compoundBodyPlayer = Phaser.Physics.Matter.Matter.Body.create({
          parts: [ rect ]
        });

        self.character = self.matter.add.sprite(players[id].x, players[id].y, 'character');
        self.character.setExistingBody(compoundBodyPlayer);
        self.character.setPosition(300, 500);
        self.character.setFixedRotation();

        self.character.setCollisionCategory(catPlayer);
        self.character.setData({
          id: id,
          name: players[id].playerName,
          score: 0,
          life: 100,
          level: 1,
          strength: 1,
          armor: 1
        });
        clientPlayer = self.character;
        self.cameras.main.startFollow(self.character, true, 0.05, 0.05, 0, 20);
      } else {
        playersNumber++;
        addOtherPlayers(self, players[id]);
      }
    });
  });

  // NOUVEAU JOUEUR - Autre joueur (SOCKET)
  this.socket.on('newPlayer', function (playerInfo) {
    playersNumber++;
    addOtherPlayers(self, playerInfo);
  });

  // Deconnexion d'un joueur (SOCKET)
  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        playersNumber--;
        otherPlayer.destroy();
      }
    });
  });

  // Mouvement d'un autre joueur (SOCKET)
  this.socket.on('playerMoved', function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });

  // Configuration des touches
  this.input.mouse.disableContextMenu();
  this.cursors = this.input.keyboard.createCursorKeys();
  keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
  keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
  keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyUpSpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  this.input.keyboard.on('keydown', function (event) {
    if (event.key == 'q' || event.key == 'd') {
      weaponCurrentPlayer.setOrigin(-0.1, 0.5);
      runningSound.stop();
      walkingSound.play();
    } else if (event.key == 'Shift') {
      walkingSound.stop();
      runningSound.play();
    }
  });

  this.input.keyboard.on('keyup', function (event) {
    if (event.key == 'q' || event.key == 'd') {
      weaponCurrentPlayer.setOrigin(0.3, 0.5);
      walkingSound.stop();
    }
    if (event.key == 'Shift') {
      runningSound.stop();
    }
  });

  // JUMP (space)
  this.input.keyboard.on('keydown_SPACE', function (event) {
    if (isNotJumping == true) {
      self.character.setVelocityY( - jumpForce);
      isNotJumping = false;
      self.character.anims.play('jumping', true);
      self.character.on('animationcomplete', animComplete, this);
    }
  });

  // POINTER MOVE
  this.input.on('pointermove', function (pointer) {
    if (self.character) {
      var BetweenPoints = Phaser.Math.Angle.BetweenPoints;
      var velocity = new Phaser.Math.Vector2();
      var slide = self.input.mousePointer.worldX - pointer.x;
      var slideY = self.input.mousePointer.worldY - pointer.y;
      var characterPoint = new Phaser.Geom.Point(self.character.x - slide, self.character.y - slideY);
      var angle = BetweenPoints(characterPoint, pointer);
      if (angle > -0.5 || angle < -2.5) {
        weaponCurrentPlayer.rotation = angle;
      }
      var slide = self.input.mousePointer.worldX - pointer.x;
      var slideY = self.input.mousePointer.worldY - pointer.y;
      if (self.character.x > (pointer.x + slide)){
        self.character.flipX = true;
        weaponCurrentPlayer.flipY = true;
        self.lookToTheRight = false;
      } else {
        weaponCurrentPlayer.flipY = false;
        self.character.flipX = false;
        self.lookToTheRight = true;
      }
    }
  });

  // POINTER CLIC
  this.input.on('pointerup', function (pointer) {
    if (self.character) {
      var particles = self.add.particles('fog');

      var BetweenPoints = Phaser.Math.Angle.BetweenPoints;
      var velocity = new Phaser.Math.Vector2();
      var velocityFromRotation = this.physics.velocityFromRotation;
      var slide = self.input.mousePointer.worldX - pointer.x;
      var slideY = self.input.mousePointer.worldY - pointer.y;
      var characterPoint = new Phaser.Geom.Point(self.character.x - slide, self.character.y - slideY);
      var angle = BetweenPoints(characterPoint, pointer);
      if (angle > -0.5 || angle < -2.5) {
        weaponCurrentPlayer.rotation = angle;
      } else {
        if (angle > -1.55) {
          angle = -0.5;
        } else {
          angle = -2.5;
        }

      }
      velocityFromRotation(angle, 30, velocity);
      var Bodies = Phaser.Physics.Matter.Matter.Bodies;
      var rect = Bodies.rectangle(0, 0, 2, 2, { label: "bulletBody" });
      var compoundBodyBullet = Phaser.Physics.Matter.Matter.Body.create({ parts: [ rect ] });
      var bullet = self.matter.add.sprite(0, 0, 'bullet', null);
      bullet.setExistingBody(compoundBodyBullet);
      bullet.setPosition(self.character.x, self.character.y - 10);
      bullet.setVelocity(velocity.x, velocity.y);
      bullet.setData({
        id: bulletId,
        shooter: self.character.data.values.id
      });
      bullet.setCollisionCategory(catBullet);
      bullet.setCollidesWith([ catZ ]);
      particles.createEmitter({
        speed: 20,
        quantity: 1,
        lifespan: 300,
        gravity: { x: 0, y: 200 },
        scale: { start: 0.005, end: 0.001 },
        follow: bullet,
        frequency: 0,
        label: "bulletParticles"
      });
      particles.setData({
        id: bulletId
      });
      bulletParticlesArray.push(particles);
      bulletId++;
    }

    setTimeout(function() {
      particles.destroy();
      bullet.destroy();
    }, 1000);
    pistolShot.play();
  }, this);

  var intervalAttacking;

  // COLLISIONS !!!
  this.matter.world.on('collisionstart', function (event) {
    var pairs = event.pairs;
    for (var i = 0; i < pairs.length; i++){
      var bodyA = pairs[i].bodyA;
      var bodyB = pairs[i].bodyB;

      if ((bodyA.label === 'zombieBody' || bodyA.label === 'zombieHead') && bodyB.label === "bulletBody"){
        if (bodyA.label === 'zombieBody'){
          self.character.data.values.score += 1;
          bodyA.gameObject.data.values.life += -20;
        } else if (bodyA.label === 'zombieHead'){
          self.character.data.values.score += 10;
          bodyA.gameObject.data.values.life += -100;
        }
        if (bodyA.gameObject.data.values.life <= 0) {
          bodyA.gameObject.data.values.toDestroy = true;
          bodyA.gameObject.body.destroy();
        } else {
          bodyA.gameObject.anims.play('zhited');
          bodyA.gameObject.on('animationcomplete', animComplete, self);
        }
      } else if ((bodyB.label === 'zombieBody' || bodyB.label === 'zombieHead') && bodyA.label === "bulletBody"){
        if (bodyB.label === 'zombieBody'){
          self.character.data.values.score += 1;
          bodyB.gameObject.data.values.life += -20;
        } else if (bodyB.label === 'zombieHead'){
          self.character.data.values.score += 10;
          bodyB.gameObject.data.values.life += -100;
        }
        if (bodyB.gameObject.data.values.life <= 0) {
          bodyB.gameObject.data.values.toDestroy = true;
          bodyB.gameObject.body.destroy();
        } else {
          bodyB.gameObject.anims.play('zhited');
          bodyB.gameObject.on('animationcomplete', animComplete, self);
        }
      }
      if (bodyB.label === 'bulletBody') {
        var idBulllet = bodyB.gameObject.data.values.id;
        for (var i = 0; i < bulletParticlesArray.length; i++){
          bulletParticlesArray[i].destroy();
        }

        bodyB.gameObject.destroy();
      } else if (bodyA.label === 'bulletBody'){
        bodyA.gameObject.destroy();
      }

      if (((bodyA.label === 'right' || bodyA.label === 'left') && bodyB.label === 'playerBody') || ((bodyB.label === 'right' || bodyB.label === 'left') && bodyA.label === 'playerBody')){
        var zombieHiter;
        var playerBody;
        if (bodyB.isSensor){
          zombieHiter = bodyB;
          playerBody = bodyA;
        }
        else if (bodyA.isSensor){
          zombieHiter = bodyA;
          playerBody = bodyB;
        }
        if (zombieHiter.label === 'right' || zombieHiter.label === 'left' && zombieHiter.gameObject.data.values.isAttacking == false){
          zombieHiter.gameObject.data.values.isAttacking = true;
          zombieHiter.gameObject.anims.play('zattack');
        }
      }

    }
  });

  this.matter.world.on('collisionactive', function (event) {
    var pairs = event.pairs;
    for (var i = 0; i < pairs.length; i++){
      var bodyA = pairs[i].bodyA;
      var bodyB = pairs[i].bodyB;
      if (((bodyA.label === 'right' || bodyA.label === 'left') && bodyB.label === 'playerBody') || ((bodyB.label === 'right' || bodyB.label === 'left') && bodyA.label === 'playerBody')){
        var zombieHiter;
        var playerBody;
        if (bodyB.isSensor){
          zombieHiter = bodyB;
          playerBody = bodyA;
        }
        else if (bodyA.isSensor){
          zombieHiter = bodyA;
          playerBody = bodyB;
        }
        if (zombieHiter.label === 'right' || zombieHiter.label === 'left' && zombieHiter.gameObject.data.values.isAttacking == false){
          playerBody.gameObject.data.values.life += -0.5;
        }
      }
    }
  });

  // Fin des collisions
  this.matter.world.on('collisionend', function (event) {
    var pairs = event.pairs;
    for (var i = 0; i < pairs.length; i++){
      var bodyA = pairs[i].bodyA;
      var bodyB = pairs[i].bodyB;
      if (((bodyA.label === 'right' || bodyA.label === 'left') && bodyB.label === 'playerBody') || ((bodyB.label === 'right' || bodyB.label === 'left') && bodyA.label === 'playerBody')){
        var zombieHiter;
        var playerBody;
        if (bodyB.isSensor){
          zombieHiter = bodyB;
          playerBody = bodyA;
        }
        else if (bodyA.isSensor){
          zombieHiter = bodyA;
          playerBody = bodyB;
        }
        if (zombieHiter.label === 'right' || zombieHiter.label === 'left' && zombieHiter.gameObject.data.values.isAttacking == true){
          zombieHiter.gameObject.data.values.isAttacking = false;
          zombieHiter.gameObject.anims.play('zwalking');
        }
      }
    }

  });

  // RESIZE
  resizeWindow();
}

// UPDATE //////////////////////////////////////////////////////////////////////
function update(time, delta) {
  var self = this;
  var slideCamera = this.cameras.main._scrollX;
  var zombiesNumber = zArray.length;
  background.setPosition(slideCamera, 0);



  // START LAUNCHER
  if (this.character) {

    if (this.character.data.values.life <= 0) {
      console.log('GAME OVER');
    }
    if (!gameStarted) {
      if (this.character.x > 600) {
        //console.log('Game Started');
        if (!devMod) {
          var alarmSound = this.sound.add('alarm');
          alarmSound.volume = 0.5;
          alarmSound.play();
        }
        this.zGeneration(this);
        gameStarted = true;
      }
    }
  }

  // DEPLACEMENTS ZOMBIES
  if (this.character) {


    // Z - AI
    zombiesNumber = zArray.length;
    for (var z = 0; z < zArray.length; z++){

      // Z - KILLER
      if (zArray[z].data.values.life <= 0 && zArray[z].data.values.isAlive == true) {
        zArray[z].data.values.isAlive = false;
        zArray[z].anims.play('zdie', false);
        zArray[z].on('animationcomplete', animComplete, self);
        zArray[z].setVelocityX(0);
      }


        var horizontalRange = (zArray[z].x ) - this.character.x;
        var verticalRange = (zArray[z].y ) - this.character.y;
        if (zArray[z].data.values.isAlive == true && zArray[z].data.values.isAttacking == false) {
          if (verticalRange > 80) {
            if (horizontalRange > 45 || verticalRange < 80) {
              zArray[z].setVelocityX( - zArray[z].data.values.speed * speed);
              zArray[z].flipX = true;
            } else if (horizontalRange < -45){
              zArray[z].setVelocityX( zArray[z].data.values.speed * speed);
              zArray[z].flipX = false;
            }
          } else if (verticalRange < 80){
            if (horizontalRange > 45) {
              zArray[z].setVelocityX( - zArray[z].data.values.speed * speed);
              zArray[z].flipX = true;
            } else if (horizontalRange < -45){
              zArray[z].setVelocityX( zArray[z].data.values.speed * speed);
              zArray[z].flipX = false;
            }
          } else {
            if ( zArray[z].data.values.team % 2 == 0 ) {
              zArray[z].setVelocityX( 1 * speed);
              zArray[z].flipX = false;
            } else {
              zArray[z].setVelocityX( - 1 * speed);
              zArray[z].flipX = true;
            }
          }
      }
    }
  }

  // DEPLACEMENTS JOUEUR (self)
  var self_player = this.character;
  if (this.character) {
    weaponCurrentPlayer.x = this.character.x;
    weaponCurrentPlayer.y = this.character.y - 10;
    // LEFT
    if (this.cursors.left.isDown || keyLeft.isDown) {
      this.character.setVelocityX( - 2 * speed);
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
      this.character.setVelocityX( 2 * speed);
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
        this.character.setVelocityX(- 5 * speed);
      }
      if (this.cursors.right.isDown || keyRight.isDown) {
        this.character.setVelocityX( 5 * speed);
      }
    } else {
      isNotRunning = true;
    }

    // Envoi des mouvements joueur (self) (SOCKET)
    this.socket.emit('playerMovement', { x: this.character.x, y: this.character.y - 170, rotation: this.character.rotation });

    // INFOS DEV
    if (clientPlayer) {
      timeText.setText(
        'Time: ' + time.toFixed(0) +
        '\nLevel: dev' +
        '\nPlayers Number: ' + playersNumber +
        '\nZombies Number: ' + zombiesNumber +
        '\nMaster: ' + clientIsMaster +
        '\nPlayer Name: ' + clientPlayer.data.values.name +
        '\nPlayer Score: ' + clientPlayer.data.values.score +
        '\nPlayer lvl: ' + clientPlayer.data.values.level +
        '\nPlayer Life: ' + Math.round(clientPlayer.data.values.life) +
        '\nWorld Length: ' + worldLength
      );
        timeText.x = slideCamera +100;
    }

  }
}

// QUAND L'ANIMATION EST COMPLETE //////////////////////////////////////////////
function animComplete(animation, frame, e){
  if(animation.key === 'jumping'){
    isNotJumping = true;
  }
  if(animation.key === 'zdie'){

    if (e.data) {
      if (e.data.values.destroyed === false) {
        e.data.values.destroyed = true;
        destroyZombie(e.data.values.id);
      }
    }

  }

  if(animation.key === 'zattack'){
    e.data.values.isAttacking = false;
    e.anims.play('zwalking');
    this.character.data.values.life += - e.data.values.strength;
  }
  if(animation.key === 'zhited'){
    e.anims.play('zwalking', true);
  }
}

// GENERATION DE Z /////////////////////////////////////////////////////////////
function zGeneration(self){
   setTimeout(function () {
     var Bodies = Phaser.Physics.Matter.Matter.Bodies;
     var rect = Bodies.rectangle(0, 75, 15, 60, { isSensor: true, label: "zombieBody" });
     var circleA = Bodies.circle(0, 40, 8, { isSensor: true, label: "zombieHead" });//, { isSensor: true, label: 'head' });
     var circleB = Bodies.circle(0, 10, 1, { isSensor: true, label: "zombiePoint" });
     var circleC = Bodies.circle(15, 50, 5, { isSensor: true, label: 'right' });
     var circleD = Bodies.circle(-15, 50, 5, { isSensor: true, label: 'left' });
     var compoundBody = Phaser.Physics.Matter.Matter.Body.create({
       parts: [ rect, circleA, circleB, circleC, circleD ],
       label: 'zBodyCompound'
     });
     var oneZ = self.matter.add.sprite(0, 0, 'zombie01', null);
     oneZ.play('zwalking');
     oneZ.setExistingBody(compoundBody);
     oneZ.setCollisionCategory(catZ);
     oneZ.setIgnoreGravity(true);
     oneZ.setFriction(1);

     if (!devMod) {
       var distribution = randomNumber(0,3);
     } else {
       var distribution = 1;
     }
     if (distribution == 0) {
       oneZ.setPosition(worldLength, 620);
     } else {
       oneZ.setPosition(0, 620);
     }
     oneZ.setFixedRotation();

     oneZ.setCollidesWith([ catGround, catBullet, catPlayer ]);
     oneZ.setData({
       id: iZ,
       life: 100,
       level: 1,
       speed: randomNumber(2, 5) * 0.3,
       strength: randomNumber(5, 20),
       armor: randomNumber(10, 20),
       team: randomNumber(1, 2),
       isAlive: true,
       isAttacking: false,
       toDestroy: false,
       destroyed: false
     });

     this.zArray.push(oneZ);
      iZ++;
      if (iZ < zombiesPop) { this.zGeneration(self); }
   }, randomNumber(200,1000));
}

// Ajout d'autres nouveaux joueurs /////////////////////////////////////////////
function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'character').setOrigin(0, 0);//.setDisplaySize(53, 40);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

// Zombie Destructor ///////////////////////////////////////////////////////////
function destroyZombie(id){
  var index;
  for (var i = 0; i < zArray.length; i++){
    if (id == zArray[i].data.values.id) {
      index = i;
    }
  }
  //console.log('destroy Z : ' + index);
  zArray[index].destroy();
  zArray.splice(index, 1);
}
