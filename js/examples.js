/*
var config = {
  offBoard: 'trash' or 'snapback' or 'constrain'
  staticPieces: true // or false
};

board1.move('e2-e4');
board1.move(['e2-e4', 'd2-d4']);

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
board.config({
  'draggable': false,
  'orientation': 'black'
});

// need to add events to hook into the drag and drop system
// should be able to prevent illegal moves, highlight legal squares, etc
onDragStart
onDragOverSquare
onDrop

// need to handle container resize

*/