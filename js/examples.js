/*
var config = {
  piecesDraggable: true,
  initialPosition: 'fen string or position object',
  showNotation: false // or 'edges' or 'squares',
  orientation: 'white',
  onChange: changeFunction,
  offBoard: 'trash', // or 'snapback'
  staticPieces: true // or false
};
var board1 = new ChessBoard(config);

board1.orientation(); // 'white' or 'black'
board1.orientation('white'); // set to 'white'
board1.orientation('black'); // set to 'black'
board1.flip(); // flips orientation

board1.position(); // returns a position object
board1.position('fen'); // returns a position FEN string
board1.position('start'); // sets board to the starting position
board1.position('fen string'); // sets the position to the value of the FEN string
board1.position(obj); // sets the position to the value of the position object

board1.move(start, end); // moves a piece from start to end
board1.move({ // move multiple pieces at the same time
  'a1': 'b2',
  'c5': 'c6',
  'wP': 'b5'  // moves a new "white pawn" to "b5"
});

board1.clear(); // alias of board1.position({})
board1.clear(false); // no animation
board1.start(); // alias of board1.position('start')
board1.start(false); // no animation

board1.destroy(); // remove the board and elements from the DOM

// convenience methods:
ChessBoard.validFEN('FEN string'); // true or false
ChessBoard.objToFEN({});
ChessBoard.FENToObj('FEN string');


// highlight squares when dragging?
// programmatically highlight squares?
// flash highlight?
// only allow legal moves? how hard will this be to implement? --> project for a different repo
*/

(function() {

var init = function() {

  var RUY_LOPEZ = '2bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R/w';

  var config = {
    showNotation: 'asdf'
  };
  var board1 = new ChessBoard('board1', config);


  //var board2 = new ChessBoard('board2', {});
  //board2.orientation('black');

  $('#btn1-clear').on('click', board1.clear);
  $('#btn1-start').on('click', board1.start);
  $('#btn1-flip').on('click', board1.flip);
  $('#btn1-ruy').on('click', function() {
    board1.position(RUY_LOPEZ);
  });
  $('#btn1-move').on('click', function() {
    //board1.move('b1', 'c2');
    /*
    board1.move({
      a2: 'a3',
      a1: 'a2'
    });
    */
    board1.destroy();
  });

  //$('#btn2').on('click', board2.flip);
};
$(document).ready(init);

})();