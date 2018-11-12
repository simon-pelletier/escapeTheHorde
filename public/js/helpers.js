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
