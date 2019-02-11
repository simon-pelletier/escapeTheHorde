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

}
