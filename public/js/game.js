// VARIABLES DE CONFIG
var speed = 1;
var jumpForce = 6;
var worldLength = 3000;
var gravityG = 1;
var zombiesPop = 20;

var catZ;
var catGround;
var catBullet;
// CONFIGURATION PHASER
var config = {
  type: Phaser.AUTO, width: 1200, height: 600,
  //physics: { default: 'arcade', arcade: { gravity: { y: gravityG }, debug: false } },
  scene: { preload: preload, create: create, update: update, physics: {
      matter: {
          debug: false,
          gravity: { y: gravityG }
      },
      arcade: { gravity: { y: gravityG }, debug: false }
  },
  extend: {
            zGeneration: zGeneration,
        }
 }
};

// VARIABLES ELEMENTS
var game = new Phaser.Game(config);
var zArray = [];
var player;

// VARIABLES KEY BIND
var keyLeft;
var keyRight;
var keyUp;
var keyUpSpace;
var keyDown;
var keyDash;

// VARIABLES GRAPHIQUES
var background;
var blocWidth = 50;
var baseGroundLength = worldLength / blocWidth + 1;
var isNotJumping = true;
var isNotRunning = true;
var isAttacking = false;
var timeText;

var gameStarted = false;


var goToTheRight = true;
var lookToTheRight = true;

var playersNumber = 0;
var clientPlayer;
var clientPlayerLife;
var clientPlayerName;
var clientIsMaster = false;

// PRELOADER
function preload() {
  //this.load.json('jsonData', 'assets/data/map.json');
  this.load.spritesheet('character', 'assets/player.png', { frameWidth: 90, frameHeight: 100 });
  this.load.spritesheet('zombie01', 'assets/Z.png', { frameWidth: 90, frameHeight: 100 });
  this.load.image('ground300', 'assets/ground300.png');
  this.load.image('platform01', 'assets/platform01.png');
  this.load.image('tree01', 'assets/tree01.png');
  this.load.image('tree02', 'assets/tree02.png');
  this.load.image('tree03', 'assets/tree03.png');
  this.load.image('tree04', 'assets/tree04.png');
  this.load.image('tree05', 'assets/tree05.png');
  this.load.image('tree06', 'assets/tree06.png');
  this.load.image('bush01', 'assets/bush01.png');
  this.load.image('bullet', 'assets/bullet.png');
  this.load.image('rain', 'assets/rain.png');
  this.load.image('fog', 'assets/fog.png');
  this.load.image('bg01', 'assets/bg01.png');

  this.load.image('megaphone01', 'assets/megaphone01.png');
  this.load.image('grass01', 'assets/grass01.png');
  this.load.image('grass02', 'assets/grass02.png');
  this.load.image('grass03', 'assets/grass03.png');
  this.load.image('grass04', 'assets/grass04.png');
  this.load.image('bush01', 'assets/bush01.png');
  this.load.image('bush02', 'assets/bush02.png');
  this.load.image('bush03', 'assets/bush03.png');
  this.load.image('camp01', 'assets/camp01.png');
  this.load.image('firebase01', 'assets/firebase01.png');
  this.load.image('fence01', 'assets/fence01.png');
  this.load.image('fence02', 'assets/fence02.png');



  this.load.audio('pistolshot', ['assets/audio/pistolshot.wav']);
  this.load.audio('alarm', ['assets/audio/alarm.wav']);
  this.load.audio('rain', ['assets/audio/rain.wav']);
  this.load.audio('coucou', ['assets/audio/coucou.wav']);
  this.load.audio('crickets', ['assets/audio/crickets.wav']);
  this.load.audio('z01', ['assets/audio/z01.wav']);
  this.load.audio('z02', ['assets/audio/z02.wav']);
  this.load.audio('z03', ['assets/audio/z03.wav']);
}

// LAUNCHER
function create() {
  //console.log(this.cache.json.get('jsonData'));
  var self = this;
  this.socket = io();

  background = this.add.image(0, 0, 'bg01');

  background.setOrigin(0,0);
  background.setDisplaySize(1200,600);
  background.setScale(1.2,1.2);

  this.matter.world.setBounds();
  this.input.setDefaultCursor('url(assets/sight.cur), pointer');
  timeText = this.add.text(100, 200);

  var bottomMask = this.add.graphics();

  bottomMask.fillStyle(0x331e01, 1);
  bottomMask.fillRect(0, 700, worldLength, 300);


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
    //collideBottom: true,
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
    //quantity: 1,
    alpha: { start: 0.2, end: 0, ease: 'Quad.easeIn' },
    //gravityY: -10,
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
    //quantity: 1,
    alpha: { start: 0.2, end: 0, ease: 'Quad.easeIn' },
    //gravityY: -10,
    frequency: 100,
    maxParticles: 100,
    blendMode: 'ADD'
  });

  var megaPhoneElt = this.add.image(0, 0, 'megaphone01');
  megaPhoneElt.setPosition(600,520);
  var fenceStart = this.add.image(0, 0, 'fence01');
  fenceStart.setPosition(60,580);
  var fenceStart2 = this.add.image(0, 0, 'fence01');
  fenceStart2.setPosition(400,580);

  background.setDepth(-10);
  fog.setDepth(-9);
  rainning.setDepth(-8);
  bottomMask.setDepth(-7);
  fenceStart.setDepth(-7);
  fenceStart2.setDepth(-7);
  megaPhoneElt.setDepth(-6);
  //0
  fog2.setDepth(1);


  // Déclaration de groupes
  this.otherPlayers = this.add.group();

  // Configuration Caméra
  this.cameras.main.setBounds(0, 0, worldLength, 750);
  this.matter.world.setBounds(0, 0, worldLength, 1000);



  // SONS
  var pistolShot = this.sound.add('pistolshot');
  pistolShot.volume = 0.2;

  var rainSound = this.sound.add('rain');
  rainSound.volume = 0.2;
  rainSound.play();
  rainSound.loop = true;

  var coucouSound = this.sound.add('coucou');
  coucouSound.volume = 0.5;
  coucouSound.play();
  coucouSound.loop = true;

  var cricketsSound = this.sound.add('crickets');
  cricketsSound.volume = 0.2;
  cricketsSound.play();
  cricketsSound.loop = true;

  // Z SOUNDS

  var zSound01 = this.sound.add('z01');
  var zSound02 = this.sound.add('z02');
  var zSound03 = this.sound.add('z03');
  zSound01.volume = 0.5;
  zSound02.volume = 0.5;
  zSound03.volume = 0.5;

  var frequencyZSound = 200;
  var myFunction = function() {
    //console.log(frequencyZSound);
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




  // GENERATION D'ITEMS !!!
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
  generateItem('tree0', 6, randomNumber(15, 30), 450, true, -9, catGround);
  generateItem('bush0', 3, randomNumber(8, 16), 620, true, -6, catGround);
  generateItem('grass0', 4, randomNumber(10, 30), 648, true, 3, catGround);
  generateItem('camp0', 1, 1, 628, false, -1, catGround);
  generateItem('firebase0', 1, 1, 645, false, -1, catGround);






  catZ = this.matter.world.nextCategory();
  catGround = this.matter.world.nextCategory();
  catBullet = this.matter.world.nextCategory();
  //console.log(catGround);

  //GROUND GENERATION
  for (var i = 0; i < baseGroundLength; i++){
    var ground = this.matter.add.image(i * 300, 700, 'ground300', null, { isStatic: true });
    ground.setFriction(0);
    ground.setOrigin(0.75);
    ground.setDepth( -2 );
    //ground.setExistingBody(compoundBodyGround);
    //ground.setDepth(2);
    ground.setCollisionCategory(catGround);
  }



  //PLATFORM GENERATION
  /*for (var i = 20; i < 30; i++){
    //platforms.create(i * blocWidth, 300, 'ground01');
    var platform = this.matter.add.image(i * blocWidth, 300, 'platform01', null, { isStatic: true });
    platform.setFriction(0);
    platform.setOrigin(0.5, 0.75);
    platform.setCollisionCategory(catGround);
  }
  for (var i = 10; i < 20; i++){
    //platforms.create(i * blocWidth, 500, 'ground01');
    var platform = this.matter.add.image(i * blocWidth, 500, 'platform01', null, { isStatic: true });
    platform.setFriction(0);
    platform.setOrigin(0.5, 0.75);
    platform.setCollisionCategory(catGround);
  }*/

  // ANIMATIONS
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
  var zWalking = this.anims.create({
      key: 'zwalking',
      frames: this.anims.generateFrameNumbers('zombie01', { start: 0, end: 24}),
      frameRate: 18,
      repeat: -1
  });
  var zHited = this.anims.create({
      key: 'zhited',
      frames: this.anims.generateFrameNumbers('zombie01', { start: 25, end: 29}),
      frameRate: 13,
      repeat: 0
  });
  var zAttack = this.anims.create({
      key: 'zattack',
      frames: this.anims.generateFrameNumbers('zombie01', { start: 30, end: 47}),
      frameRate: 13,
      repeat: -1
  });
  var zDie = this.anims.create({
      key: 'zdie',
      frames: this.anims.generateFrameNumbers('zombie01', { start: 48, end: 69}),
      frameRate: 13,
      repeat: 0
  });



  // Generation de Z
  /*var i = 0;
  function generateZ () {

     setTimeout(function () {
       var Bodies = Phaser.Physics.Matter.Matter.Bodies;
       //Matter.Bodies.rectangle(x, y, width, height, [options])
       var rect = Bodies.rectangle(0, 75, 15, 60, { label: "zombieBody" });
       var circleA = Bodies.circle(0, 40, 8, { label: "zombieHead" });//, { isSensor: true, label: 'head' });
       var circleB = Bodies.circle(0, 10, 1, { label: "zombiePoint" });
       var compoundBody = Phaser.Physics.Matter.Matter.Body.create({
         parts: [ rect, circleA, circleB ]//,

       });
       var oneZ = self.matter.add.sprite(0, 0, 'zombie01', null);

       oneZ.play('zwalking');//.setOrigin(0, 0);
       oneZ.setExistingBody(compoundBody);
       oneZ.setCollisionCategory(catZ);
       oneZ.setPosition(100, 600);

       oneZ.setFixedRotation();
       oneZ.setMass(10);
       oneZ.setCollidesWith([ catGround, catBullet ]);
       oneZ.setData({
         id: i,
         life: 100,
         level: 1,
         speed: randomNumber(2, 5) * 0.3,
         strength: randomNumber(5, 20),
         armor: randomNumber(10, 20),
         team: randomNumber(1, 2),
         isAlive: true,
         toDestroy: false
       });

       this.zArray.push(oneZ);
        i++;
        if (i < zombiesPop) {
           generateZ();
        }
     }, randomNumber(200,200))
  }*/
  //generateZ();
  //self.zGeneration();



  // Création d'un nouveau joueur
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        playersNumber++;
        if (playersNumber == 1) {
          clientIsMaster = true;
        }
        var Bodies = Phaser.Physics.Matter.Matter.Bodies;
        var rect = Bodies.rectangle(0, 0, 40, 100);
        var compoundBodyPlayer = Phaser.Physics.Matter.Matter.Body.create({
          parts: [ rect ],
          inertia: Infinity
        });
        clientPlayer = players[id];
        clientPlayerLife = players[id].playerLife;
        clientPlayerName = players[id].playerName;
        self.character = self.matter.add.sprite(players[id].x, players[id].y, 'character');
        self.character.setExistingBody(compoundBodyPlayer);
        self.character.setPosition(300, 500);
        self.cameras.main.startFollow(self.character, true, 0.05, 0.05, 0, 20);

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
    //console.log(self.character.body);
    //if (self.character.body.touching.down) {
      self.character.setVelocityY( - jumpForce);
      isNotJumping = false;
      self.character.anims.play('jumping', true);
      self.character.on('animationcomplete', animComplete, this);
    //}
  });

  // POINTER MOVEMENT
  this.input.on('pointermove', function (pointer) {
    if (self.character) {
      var slide = self.input.mousePointer.worldX - pointer.x;
      var slideY = self.input.mousePointer.worldY - pointer.y;
      if (self.character.x > (pointer.x + slide)){
        self.character.flipX = true;
        self.lookToTheRight = false;
      } else {
        self.character.flipX = false;
        self.lookToTheRight = true;
      }
    }
  });




  // TIR POINTER
  this.input.on('pointerup', function (pointer) {
    if (self.character) {
      var BetweenPoints = Phaser.Math.Angle.BetweenPoints;
      var velocity = new Phaser.Math.Vector2();
      var velocityFromRotation = this.physics.velocityFromRotation;
      var slide = self.input.mousePointer.worldX - pointer.x;
      var slideY = self.input.mousePointer.worldY - pointer.y;
      var characterPoint = new Phaser.Geom.Point(self.character.x - slide, self.character.y - slideY);
      var angle = BetweenPoints(characterPoint, pointer);
      velocityFromRotation(angle, 30, velocity);
      var Bodies = Phaser.Physics.Matter.Matter.Bodies;
      var rect = Bodies.rectangle(0, 0, 2, 2, { label: "bulletBody" });
      var compoundBodyBullet = Phaser.Physics.Matter.Matter.Body.create({
        parts: [ rect ]
      });
      var bullet = self.matter.add.sprite(0, 0, 'bullet', null);
      bullet.setExistingBody(compoundBodyBullet);
      bullet.setPosition(self.character.x, self.character.y);
      bullet.setVelocity(velocity.x, velocity.y);
      //bullet.setMass(10);
      bullet.setCollisionCategory(catBullet);
      bullet.setCollidesWith([ catZ ]);
      /*bullet.setData({
        life: 100,
        level: 1,
        speed: randomNumber(2, 5) * 0.3,
        strength: randomNumber(5, 20),
        armor: randomNumber(10, 20),
        team: randomNumber(1, 2)
      });*/
    }
        setTimeout(function() {
          bullet.destroy();
        }, 1000);

        pistolShot.play();
    }, this);

    this.matter.world.on('collisionstart', function (event) {
      //console.log(event.pairs);
      var pairs = event.pairs;
      for (var i = 0; i < pairs.length; i++){
        //console.log(pairs[i]);
        var bodyA = pairs[i].bodyA;
        var bodyB = pairs[i].bodyB;

        // Si on a à faire au collider zombie
        if (bodyA.label === 'zombieBody' || bodyA.label === 'zombieHead') {

          // Détruit la bullet
          bodyB.gameObject.destroy();
          // Si la vie est au dessus de zero
          if (bodyA.gameObject.data.values.life > 0) {
            // Si c'est dans la tête
            if (bodyA.label === 'zombieHead') {
              bodyA.gameObject.data.values.life = 0;
              bodyA.gameObject.data.values.toDestroy = true;
            // Si c'est dans le corps
          } else if ((bodyA.label === 'zombieBody')){
              bodyA.gameObject.data.values.life += -20;
              if (bodyA.gameObject.data.values.life > 0) {
                bodyA.gameObject.anims.play('zhited');
                setTimeout(function() {
                  bodyA.gameObject.anims.play('zwalking');
                }, 300);
              } else {
                bodyA.gameObject.data.values.toDestroy = true;
              }

            }
          } else if (bodyA.gameObject.data.values.toDestroy === false){

          }
          //console.log(bodyA.gameObject.data.values.life);
        }
      }
    });

  // Position du canvas (html)
  resizeWindow();
}

function animComplete(animation, frame){
  if(animation.key === 'jumping'){
    isNotJumping = true;
  }
}

var iZ = 0;
function zGeneration(self){



   setTimeout(function () {
     var Bodies = Phaser.Physics.Matter.Matter.Bodies;
     //Matter.Bodies.rectangle(x, y, width, height, [options])
     var rect = Bodies.rectangle(0, 75, 15, 60, { label: "zombieBody" });
     var circleA = Bodies.circle(0, 40, 8, { label: "zombieHead" });//, { isSensor: true, label: 'head' });
     var circleB = Bodies.circle(0, 10, 1, { label: "zombiePoint" });
     var compoundBody = Phaser.Physics.Matter.Matter.Body.create({
       parts: [ rect, circleA, circleB ]//,

     });
     //console.log('ok');
     var oneZ = self.matter.add.sprite(0, 0, 'zombie01', null);

     oneZ.play('zwalking');//.setOrigin(0, 0);
     oneZ.setExistingBody(compoundBody);
     oneZ.setCollisionCategory(catZ);
     oneZ.setPosition(0, 600);

     oneZ.setFixedRotation();
     oneZ.setMass(10);
     oneZ.setCollidesWith([ catGround, catBullet ]);
     console.log(catGround);
     oneZ.setData({
       id: iZ,
       life: 100,
       level: 1,
       speed: randomNumber(2, 5) * 0.3,
       strength: randomNumber(5, 20),
       armor: randomNumber(10, 20),
       team: randomNumber(1, 2),
       isAlive: true,
       toDestroy: false
     });

     this.zArray.push(oneZ);
      iZ++;
      //console.log(iZ);
      if (iZ < zombiesPop) {
         this.zGeneration(self);
      }
   }, randomNumber(200,200))

}
/*function generateZ () {
  var i = 0;
   setTimeout(function () {
     var Bodies = Phaser.Physics.Matter.Matter.Bodies;
     //Matter.Bodies.rectangle(x, y, width, height, [options])
     var rect = Bodies.rectangle(0, 75, 15, 60, { label: "zombieBody" });
     var circleA = Bodies.circle(0, 40, 8, { label: "zombieHead" });//, { isSensor: true, label: 'head' });
     var circleB = Bodies.circle(0, 10, 1, { label: "zombiePoint" });
     var compoundBody = Phaser.Physics.Matter.Matter.Body.create({
       parts: [ rect, circleA, circleB ]//,

     });
     var oneZ = Phaser.matter.add.sprite(0, 0, 'zombie01', null);

     oneZ.play('zwalking');//.setOrigin(0, 0);
     oneZ.setExistingBody(compoundBody);
     oneZ.setCollisionCategory(catZ);
     oneZ.setPosition(100, 600);

     oneZ.setFixedRotation();
     oneZ.setMass(10);
     oneZ.setCollidesWith([ catGround, catBullet ]);
     oneZ.setData({
       id: i,
       life: 100,
       level: 1,
       speed: randomNumber(2, 5) * 0.3,
       strength: randomNumber(5, 20),
       armor: randomNumber(10, 20),
       team: randomNumber(1, 2),
       isAlive: true,
       toDestroy: false
     });

     this.zArray.push(oneZ);
      i++;
      if (i < zombiesPop) {
         generateZ();
      }
   }, randomNumber(200,200))
}*/

// Ajout d'autres nouveaux joueurs
function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'character').setOrigin(0, 0);//.setDisplaySize(53, 40);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

function zombiHitPlayer(p, z){
  //console.log(p);
  clientPlayer.playerLife--;
  //console.log(clientPlayer.playerLife);
  if (clientPlayer.playerLife < 0) {
    //console.log('DEAD');
  }
}

function destroyZombie(a){
  setTimeout(function() {
    zArray[a].destroy();
    zArray.splice(a, 1);
  }, 1300);

  //a--;
}

// UPDATER
function update(time, delta) {
  var slideCamera = this.cameras.main._scrollX;
  //var zombiesNumber = zombies.getChildren().length;
  var zombiesNumber = zArray.length;

  background.setPosition(slideCamera, 0);

  //gameStarted
  //playersNumber
  if (this.character) {
    if (!gameStarted) {
      if (this.character.x > 600) {
        console.log('Game Started');
        var alarmSound = this.sound.add('alarm');
        alarmSound.volume = 0.5;
        alarmSound.play();
        //generateZ();
        this.zGeneration(this);
        gameStarted = true;
      }
    }
  }

  if (this.character) {

    for (var a = 0; a < zArray.length; a++){
      if (zArray[a].data.values.life <= 0 && zArray[a].data.values.isAlive == true) {
        zArray[a].anims.play('zdie', true);
        zArray[a].setVelocityX(0);
        zArray[a].data.values.isAlive = false;

        destroyZombie(a);
      }

    }

    zombiesNumber = zArray.length;

    for (var z = 0; z < zArray.length; z++){

        //console.log(zArray[z].x);
        var horizontalRange = (zArray[z].x ) - this.character.x;
        var verticalRange = (zArray[z].y ) - this.character.y;
        //console.log(zArray[z].data.values.speed);
        // Si ils sont au même étage
        if (zArray[z].data.values.isAlive == true) {
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
            isAttacking = false;
            //si  il n'est pas au même étage
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

  if (clientPlayer) {
    timeText.setText(
      'Time: ' + time.toFixed(0) +
      '\nDelta: ' + delta.toFixed(2) +
      '\nLevel: --' +
      '\nPlayers Number: ' + playersNumber +
      '\nZombies Number: ' + zombiesNumber +
      '\nMaster: ' + clientIsMaster +
      '\nPlayer Name: ' + clientPlayerName +
      '\nPlayer Life: ' + clientPlayer.playerLife);
  }

  timeText.x = slideCamera +100;
  var self_player = this.character;

  // Déplacement du player (self)
  if (this.character) {

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
