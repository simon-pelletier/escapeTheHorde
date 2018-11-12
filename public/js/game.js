// VARIABLES DE CONFIG
var speed = 1;
var jumpForce = 1000;
var worldLength = 5000;
var gravityG = 2000;
var zombiesPop = 5;

// CONFIGURATION PHASER
var config = {
  type: Phaser.AUTO, width: 1200, height: 600,
  //physics: { default: 'arcade', arcade: { gravity: { y: gravityG }, debug: false } },
  scene: { preload: preload, create: create, update: update, physics: {
      arcade: {
          debug: true,
          gravity: { y: gravityG }
      },
      matter: {
          debug: true,
          gravity: { y: 0.5 }
      }/*,
      impact: {
          gravity: 100,
          //debug: true,
          setBounds: {
              x: 10,
              y: 10,
              width: 1200,
              height: 600,
              thickness: 32
          },
          maxVelocity: 500
      }*/
  }
 }
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
var isAttacking = false;
var timeText;

var goToTheRight = true;
var lookToTheRight = true;
var zombiesSpeed = [];
//var zombiesLife = [];
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
  this.load.image('tree01', 'assets/tree01.png');
  this.load.image('sight', 'assets/sight.png');
  this.load.image('bullet', 'assets/bullet.png');

  this.load.audio('pistolshot', [
        'assets/audio/pistolshot.wav'
    ]);
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

  this.input.setDefaultCursor('url(assets/sight.cur), pointer');

  //this.input.setDefaultCursor('url(assets/point.cur), pointer');

  timeText = this.add.text(100, 200);



  var Bodies = Phaser.Physics.Matter.Matter.Bodies;

    var rect = Bodies.rectangle(0, 0, 98, 98);
    var circleA = Bodies.circle(-70, 0, 24, { isSensor: true, label: 'left' });
    var circleB = Bodies.circle(70, 0, 24, { isSensor: true, label: 'right' });
    var circleC = Bodies.circle(0, -70, 24, { isSensor: true, label: 'top' });
    var circleD = Bodies.circle(0, 70, 24, { isSensor: true, label: 'bottom' });

    var compoundBody = Phaser.Physics.Matter.Matter.Body.create({
        parts: [ rect, circleA, circleB, circleC, circleD ]
    });



  // Déclaration de groupes
  this.otherPlayers = this.physics.add.group();
  platforms = this.physics.add.staticGroup();
  trees = this.physics.add.staticGroup();

  //zombies = this.add.group();
  zombies = this.physics.add.group();


  // Configuration Caméra
  this.cameras.main.setBounds(0, 0, worldLength, 1000);
  this.physics.world.setBounds(0, 0, worldLength, 1000);

  var pistolShot = this.sound.add('pistolshot');

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
      frames: this.anims.generateFrameNumbers('zombie01', { start: 0, end: 24}),
      frameRate: 13,
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
/*
  25-29 hit
  30-47 attack
  47-69 die
*/
  this.physics.add.collider(zombies, platforms);
  //this.physics.add.overlap(zombies, this.character);


















  // Generation de Z
  var i = 0;
  function myLoop () {
     setTimeout(function () {
       var speedOfThisZ = randomNumber(10, 60);
       var oneZ = zombies.create(800, 200, 'zombie01').setCollideWorldBounds(true).play('zwalking');
       //oneZ.setExistingBody(compoundBody);
//var block = this.matter.add.image(150, 0, 'block');


       oneZ.setSize(40, 80).setOffset(24, 18);
       oneZ.setData({
         life: 100,
         level: 1,
         speed: speedOfThisZ,
         strength: randomNumber(5, 20),
         armor: randomNumber(10, 20)
       });
       zombiesSpeed.push(speedOfThisZ);
       //oneZ.setExistingBody(compoundBody);
       //zombiesLife.push(100);
        i++;
        if (i < zombiesPop) {
           myLoop();
        }
     }, randomNumber(200,1000))
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
        clientPlayer = players[id];
        clientPlayerLife = players[id].playerLife;
        clientPlayerName = players[id].playerName;
        self.character = self.physics.add.sprite(players[id].x, players[id].y, 'character').setOrigin(0, 0);//.setDisplaySize(53, 40);
        self.character.setSize(40, 80).setOffset(24, 18);
        self.character.setDrag(300);
        self.character.setCollideWorldBounds(true);
        self.physics.add.collider(self.character, platforms);
        self.physics.add.overlap(self.character, zombies, zombiHitPlayer);
        /*self.physics.add.overlap(self.character, zombies, function(){
          console.log('hhh');
        });*/
        self.cameras.main.startFollow(self.character, true, 0.05, 0.05, 0, 100);




        //self.physics.add.collider(zombies, self.character, null, function(player, zombie){
          //console.log('touché :p');
          //zombie.disableBody(true, false);
          //zombie.anims.play('zattack');
          //console.log(target.life);
          /*if (target.data.values.life > 0) {
            target.data.values.life += -20;
            if (target.data.values.life > 0) {
              target.anims.play('zhited');
              setTimeout(function() {
                target.anims.play('zwalking');
              }, 300);
            }

          }*/

          //bullet.disableBody(true, true);
          //console.log(target.data.values.life);
          /*target.on('animationcomplete', function(){
            target.anims.play('zwalking');
          });*/



            //target.anims.play('zwalking');
        //});












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


  // Viseur
  var BetweenPoints = Phaser.Math.Angle.BetweenPoints;
  var SetToAngle = Phaser.Geom.Line.SetToAngle;
  var velocityFromRotation = this.physics.velocityFromRotation;
  //var gfx = this.add.graphics().setDefaultStyles({ lineStyle: { width: 1, color: 0x26b5ff, alpha: 0.5 } });
  var velocity = new Phaser.Math.Vector2();
  //var line = new Phaser.Geom.Line();

  var sight = this.add.image(0, 0, 'sight');

  var bullet = this.physics.add.image(0, 0, 'bullet');
  bullet.disableBody(true, true);
  bullet.setBounce(1, 1);
  //this.physics.add.collider(bullet, zombies);


  /*if (isAttacking == true) {
    target.anims.play('zattack');
  } else {
    target.anims.play('zwalking');
  }*/


  this.physics.add.collider(bullet, platforms, function(bullet, target){
    bullet.disableBody(true, true);
  });
  this.physics.add.collider(bullet, zombies, null, function(bullet, target){
    //console.log(target.life);
    if (target.data.values.life > 0) {
      target.data.values.life += -20;
      console.log(bullet);
      if (target.data.values.life > 0) {
        target.anims.play('zhited');
        setTimeout(function() {
          target.anims.play('zwalking');
        }, 300);
      }

    }

    bullet.disableBody(true, true);
    //console.log(target.data.values.life);
    /*target.on('animationcomplete', function(){
      target.anims.play('zwalking');
    });*/

    if (target.data.values.life <= 0) {
      /*target.on('animationcomplete', function(e, n, target){
        //target.anims.play('zwalking');
        //this.destroy();
        console.log('ha');
      });*/
      //target.setVelocityX(0);
      target.anims.play('zdie');
      target.disableBody(false, false);
      setTimeout(function() {
        target.destroy();
        //console.log('destroyed');
      }, 1300);

      //target.anims.play('zwalking');
    }

  });
















  if (self.character) {
    //this.physics.add.overlap(self.character, zombies);

    /*this.physics.overlap(self.character, zombies, function(){
      console.log('jjj');
    });*/
    //var bullet = this.physics.add.image(self.character.x, self.character.y, 'tree01');
    bullet.x = self.character.x + 45;
    bullet.y = self.character.y + 40;
  }

  // POINTER MOVEMENT
  this.input.on('pointermove', function (pointer) {
    if (self.character) {

      var slide = self.input.mousePointer.worldX - pointer.x;
      var slideY = self.input.mousePointer.worldY - pointer.y;

      //sight.x = pointer.x + slide;
      //sight.y = pointer.y + slideY;

      if (self.character.x > (pointer.x - 45 + slide)){
        self.character.flipX = true;
        self.lookToTheRight = false;
      } else {
        self.character.flipX = false;
        self.lookToTheRight = true;
      }
      //console.log(pointer);
      //var angle = BetweenPoints(self.character, pointer);
      var characterPoint = new Phaser.Geom.Point(self.character.x - slide + 45, self.character.y - slideY +40);
      //console.log(characterPoint);
      //characterPoint.x = self.character.x;
      //characterPoint.y = self.character.y;
      var angle = BetweenPoints(characterPoint, pointer);
      //console.log(angle);

      //SetToAngle(line, self.character.x + 45, self.character.y + 40, angle, 150);
      velocityFromRotation(angle, 2000, velocity);
      //gfx.clear().strokeLineShape(line);
    }
  });

  // TIR POINTER
  this.input.on('pointerup', function () {
        // Enable physics body and reset (at position), activate game object, show game object
        bullet.enableBody(true, self.character.x + 45, self.character.y + 40, true, true).setVelocity(velocity.x, velocity.y);
        //bullet.disableBody(true, true);
        /*setTimeout(function() {
          bullet.disableBody(true, true);
        }, 1000);*/
        pistolShot.play();
    }, this);



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

function zombiHitPlayer(p, z){
  console.log(p);
  clientPlayer.playerLife--;
  console.log(clientPlayer.playerLife);
  if (clientPlayer.playerLife < 0) {
    console.log('DEAD');
  }
}

// UPDATER
function update(time, delta) {
  var slideCamera = this.cameras.main._scrollX;
  var zombiesNumber = zombies.getChildren().length;



  if (this.character) {

    for (var z = 0; z < zombiesNumber; z++){

      var horizontalRange = (zombies.getChildren()[z].x - 45 ) - this.character.x;
      var verticalRange = (zombies.getChildren()[z].y - 45 ) - this.character.y;

      // Si ils sont au même étage
      if (Math.abs(verticalRange) < 80) {

        if (horizontalRange > 45) {
          //zombies.getChildren()[z].anims.play('zwalking');
          zombies.getChildren()[z].setVelocityX( - self.zombiesSpeed[z] * speed);
          zombies.getChildren()[z].flipX = true;
        } else if (horizontalRange < -45){
          //zombies.getChildren()[z].anims.play('zwalking');
          zombies.getChildren()[z].setVelocityX( self.zombiesSpeed[z] * speed);
          zombies.getChildren()[z].flipX = false;
        }

        /*if (Math.abs(horizontalRange ) < 45) {
          //zombies.getChildren()[z].setVelocityX(0);
          //isAttacking = true;
          //zombies.getChildren()[z].anims.play('zattack');
        } else {
          //isAttacking = false;
          if (horizontalRange > 45) {
            //zombies.getChildren()[z].anims.play('zwalking');
            zombies.getChildren()[z].setVelocityX( - self.zombiesSpeed[z] * speed);
            zombies.getChildren()[z].flipX = true;
          } else if (horizontalRange < -45){
            //zombies.getChildren()[z].anims.play('zwalking');
            zombies.getChildren()[z].setVelocityX( self.zombiesSpeed[z] * speed);
            zombies.getChildren()[z].flipX = false;
          }
        }*/
















      } else {
        isAttacking = false;
        //zombies.getChildren()[z].anims.play('zwalking');
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
