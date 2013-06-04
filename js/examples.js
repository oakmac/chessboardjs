/*
var config = {
  piecesDraggable: true,
  onChange: changeFunction,
  offBoard: 'trash', // or 'snapback'
  staticPieces: true // or false
};
var board1 = new ChessBoard(config);

board1.move(start, end); // moves a piece from start to end
board1.move({ // move multiple pieces at the same time
  'a1': 'b2',
  'c5': 'c6',
  'wP': 'b5'  // moves a new "white pawn" to "b5"
});

board1.destroy(); // remove the board and elements from the DOM

// convenience methods:
ChessBoard.validFEN('FEN string'); // true or false
ChessBoard.objToFEN({});
ChessBoard.FENToObj('FEN string');

// programmatically highlight squares?
// flash highlight?
// only allow legal moves? how hard will this be to implement? --> project for a different repo
*/