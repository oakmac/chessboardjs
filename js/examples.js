/*
var config = {
  offBoard: 'trash' or 'snapback' or 'constrain'
  staticPieces: true // or false
};

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

// need to be able to programmatically highlight squares
// flash or permanent highlight
board.highlight(); // returns an array of currently highlighted squares
board.highlight('e2', 'e3', 'e4');
board.highlight('clear');

// only allow legal moves is a project for a different repo

// need to be able to change config parameters on the fly
board.config(); // return current config
board.config('onChange', fn);
board.config('draggable', true);

// need to add events to hook into the drag and drop system
// should be able to prevent illegal moves, highlight legal squares, etc
onDragStart
onDragOverSquare
onDrop

// need to handle container resize

*/