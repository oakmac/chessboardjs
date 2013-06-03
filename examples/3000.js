var cfg = {
  draggable: true,
  position: 'start'
};
var board = new ChessBoard('board', cfg);

$('#getPositionBtn').on('click', function() {
  console.log("Current position on the board:");
  console.log(board.position());

  console.log("Current position as a FEN string:");
  console.log(board.position('FEN'));
});