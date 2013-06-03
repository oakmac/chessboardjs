var board = new ChessBoard('board', 'start');

$('#startPositionBtn').on('click', board.start);

$('#move1Btn').on('click', function() {
  board.move('e2', 'e4');
});

$('#move2Btn').on('click', function() {
  board.move({
    e2: 'e4',
    e7: 'e5'
  });
});