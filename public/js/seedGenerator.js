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
  //console.log(seedObj);


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
