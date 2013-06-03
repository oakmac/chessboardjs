var cfg = {
  draggable: true,
  position: 'start'
};
var board = new ChessBoard('board', cfg);

$('#getPositionBtn').on('click', function() {
  console.log("Current FEN of the board:");
  console.log(board.position('FEN'));
});