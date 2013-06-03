var ruyLopez = '2bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R/w';
var board = new ChessBoard('board', ruyLopez);

$('#showOrientationBtn').on('click', function() {
  console.log("Board orientation is: " + board.orientation());
});

$('#whiteOrientationBtn').on('click', function() {
  board.orientation('white');
});

$('#blackOrientationBtn').on('click', function() {
  board.orientation('black');
});

$('#flipOrientationBtn').on('click', board.flip);