var board = new ChessBoard('board', 'start');

$('#startPositionBtn').on('click', board.start);

$('#clearBoardBtn').on('click', board.clear);

$('#clearBoardInstantBtn').on('click', function() {
  board.clear(false);
});