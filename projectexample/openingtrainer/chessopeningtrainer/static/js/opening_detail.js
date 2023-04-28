// used from making only legal moves example in chessboard.js examples, https://chessboardjs.com/examples#5000
var board = null
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')

function onDragStart (source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.isGameOver()) return false
  
    // only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false
    }
  }
  
  function onDrop(source, target) {
    try {
      var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
      });
  
      if (move === null) {
        throw new Error('Invalid move');
      } else {
        moves.push(move.san);
        i++;
      }
    } catch (error) {
      return 'snapback'
    }

    updateStatus()
  }
  
  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  function onSnapEnd () {
    board.position(game.fen())
  }
  // resets the board to a move-by-move chessboard until the PGN till the relevant openings
  // hence the use of original moves
  function reset() {
    game = new Chess();
    board.position('start');
    i = 0;
    playNextMove(original_moves);
    moves = [...original_moves]
    updateStatus();
  }
  
  // undoes the last move and removes it from the shallow copy moves 
  function takeBack() {
    if (moves.length > 0) {
      game.undo()
      moves.pop()
      i--;
      console.log(i)
      board.position(game.fen())
      updateStatus()
    }
  }

  function updateStatus () {
    var status = ''
  
    var moveColor = 'White'
    if (game.turn() === 'b') {
      moveColor = 'Black'
    }
  
    // checkmate?
    if (game.isCheckmate()) {
      status = 'Game over, ' + moveColor + ' is in checkmate.'
    }
  
    // draw?
    else if (game.isDraw()) {
      status = 'Game over, drawn position'
    }
  
    // game still on
    else {
      status = moveColor + ' to move'
  
      // check?
      if (game.inCheck()) {
        status += ', ' + moveColor + ' is in check'
      }
    }
  
    $status.html(status)
    $fen.html(game.fen())
    $pgn.html(game.pgn())
  };

var game = new Chess()
var config= {
    draggable: true,
    dropOffBoard: 'snapback',
    sparePieces: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: "/static/img/chesspieces/wikipedia/{piece}.png" 
};

board = Chessboard('board', config)
var gamePgn = pgndata
var pgnDataString = pgndata.toString()
var original_moves = gamePgn.split(/\d+\.|\s+/).filter(Boolean) //using regional expressions and then a filter to get the necessary format to carry out a for loop
game.loadPgn(gamePgn);
var original_fen = game.fen() //making original copy to not interfere with game.fen() used in later functions
game.reset()
var moves = [...original_moves] //shallow copy to not interfere with use of original_moves
var i=0
function playNextMove(moves) {
  if (i >= moves.length) {
    return;
  }
  
  var move = moves[i];
  var moveObj = game.move(move);

  if (moveObj === null) {
    alert('Invalid move: ' + move);
    return;
  }
  
  i++;
  board.position(game.fen());
  setTimeout(function() {
    playNextMove(moves);
  }, 500);
}

playNextMove(moves);

