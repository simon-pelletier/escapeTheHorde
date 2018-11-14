// VARIABLES DE CONFIG
var speed = 1;
var jumpForce = 9;
var worldLength = 3000;
var gravityG = 1;
var zombiesPop = 20;

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
  this.load.image('ground01', 'assets/ground01.png');
  this.load.image('ground300', 'assets/ground300.png');
  this.load.image('underground01', 'assets/underground01.png');
  this.load.image('platform01', 'assets/platform01.png');
  this.load.image('platform02', 'assets/platform02.png');
  this.load.image('tree01', 'assets/tree01.png');
  this.load.image('bullet', 'assets/bullet.png');
  this.load.image('rain', 'assets/rain.png');
  this.load.image('fog', 'assets/fog.png');
  this.load.image('bg01', 'assets/bg01.jpg');


  this.load.audio('pistolshot', [
        'assets/audio/pistolshot.wav'
    ]);
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
    quantity: 10,
    blendMode: 'ADD'
  });



  var fog = this.add.particles('fog');
  fog.createEmitter({
    x: { min: 0, max: worldLength },
    y: { min: 900, max: 900 },
    lifespan: 9000,
    speedX: { min: 5, max: 10 },
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

  background.setDepth(-5);
  fog.setDepth(-4);
  fog2.setDepth(1);
  rainning.setDepth(-3);
  bottomMask.setDepth(-2);

  // Déclaration de groupes
  this.otherPlayers = this.add.group();

  // Configuration Caméra
  this.cameras.main.setBounds(0, 0, worldLength, 750);
  this.matter.world.setBounds(0, 0, worldLength, 1000);

  // SONS
  var pistolShot = this.sound.add('pistolshot');

  // GENERATION
  // ARBRE GENERATION
  var treeNumbers = randomNumber(10, 20);
  for (var i = 0; i < treeNumbers; i++){
    var treePositionX = randomNumber(0, 5000);
    //trees.create(treePositionX, 580, 'tree01');
    var tree = this.matter.add.image(treePositionX, 530, 'tree01', null, { isStatic: true });
    //tree.setScale(1,1);
    tree.setCollisionCategory(catGround);
  }
  var catZ = this.matter.world.nextCategory();
  var catGround = this.matter.world.nextCategory();
  var catBullet = this.matter.world.nextCategory();

  //GROUND GENERATION
  for (var i = 0; i < baseGroundLength; i++){
    //platforms.create(i * blocWidth, 700, 'ground01');
    //this.matter.add.image(i * blocWidth, 700, 'ground01');
    /*var Bodies = Phaser.Physics.Matter.Matter.Bodies;
    var rect = Bodies.rectangle(0, 0, 300, 80, { label: "groundBosdy" });
    var compoundBodyGround = Phaser.Physics.Matter.Matter.Body.create({
      parts: [ rect ]
    });*/

    var ground = this.matter.add.image(i * 300, 700, 'ground300', null, { isStatic: true });
    ground.setFriction(0);
    ground.setOrigin(0.75);
    //ground.setExistingBody(compoundBodyGround);
    //ground.setDepth(2);
    ground.setCollisionCategory(catGround);
  }



  //PLATFORM GENERATION
  for (var i = 20; i < 30; i++){
    //platforms.create(i * blocWidth, 300, 'ground01');
    var platform = this.matter.add.image(i * blocWidth, 300, 'platform02', null, { isStatic: true });
    platform.setFriction(0);
    platform.setOrigin(0.5, 0.75);
    platform.setCollisionCategory(catGround);
  }
  for (var i = 10; i < 20; i++){
    //platforms.create(i * blocWidth, 500, 'ground01');
    var platform = this.matter.add.image(i * blocWidth, 500, 'platform02', null, { isStatic: true });
    platform.setFriction(0);
    platform.setOrigin(0.5, 0.75);
    platform.setCollisionCategory(catGround);
  }

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
  var i = 0;
  function myLoop () {
     setTimeout(function () {
       var Bodies = Phaser.Physics.Matter.Matter.Bodies;
       //Matter.Bodies.rectangle(x, y, width, height, [options])
       var rect = Bodies.rectangle(0, 75, 15, 60, { label: "zombieBody" });
       var circleA = Bodies.circle(0, 40, 8, { label: "zombieHead" });//, { isSensor: true, label: 'head' });
       var circleB = Bodies.circle(0, 10, 1, { label: "zombiePoint" });
       var compoundBody = Phaser.Physics.Matter.Matter.Body.create({
         parts: [ rect, circleA, circleB ]//,
         /*inertia: Infinity*/
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
           myLoop();
        }
     }, randomNumber(200,200))
  }
  myLoop();


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
        self.character.setPosition(600, 200);
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
        pistolShot.volume = 0.5;
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

  if (this.character) {
    //var zombieToDestroy;

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
          if (Math.abs(verticalRange < 80)) {

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
