var board = new ChessBoard('board');

$('#setStartBtn').on('click', board.start);

$('#setRookCheckmateBtn').on('click', function() {
  board.position({
    a4: 'bK',
    c4: 'wK',
    a7: 'wR'
  });
});

$('#setRuyLopezBtn').on('click', function() {
  board.position('2bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R/w');
});