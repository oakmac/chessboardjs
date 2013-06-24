/*!
 * ChessBoardJS JavaScript Widget
 *
 * Copyright 2013 Chris Oakman
 * Released under the MIT license
 * https://github.com/oakmac/chessboardjs/blob/master/LICENSE
 *
 * Date: 31 May 2013
 */

// start anonymous scope
;(function() {

//------------------------------------------------------------------------------
// Chess Util Functions
//------------------------------------------------------------------------------
var COLUMNS = 'abcdefgh'.split('');

var validMove = function(move) {
  // move should be a string
  if (typeof move !== 'string') return false;

  // move should be in the form of "e2-e4", "f6-d5"
  var tmp = move.split('-');
  if (tmp.length !== 2) return false;

  return (validSquare(tmp[0]) === true && validSquare(tmp[1]) === true);
};

var validSquare = function(square) {
  if (typeof square !== 'string') return false;
  return (square.search(/^[a-h][1-8]$/) !== -1);
};

var validPieceCode = function(code) {
  if (typeof code !== 'string') return false;
  return (code.search(/^[bw][KQRNBP]$/) !== -1);
};

var validFEN = function(fen) {
  if (typeof fen !== 'string') return false;

  // FEN should be at least 8 sections separated by slashes
  var chunks = fen.split('/');
  if (chunks.length < 8) return false;

  // check the piece sections
  for (var i = 0; i < 8; i++) {
    if (chunks[i] === '' ||
        chunks[i].length > 8 || 
        chunks[i].search(/[^kqrbnpKQRNBP1-8]/) !== -1) {
      return false;
    }
  }

  return true;
};

var validPositionObject = function(pos) {
  if (typeof pos !== 'object') return false;

  for (var i in pos) {
    if (pos.hasOwnProperty(i) !== true) continue;

    if (validSquare(i) !== true || validPieceCode(pos[i]) !== true) {
      return false;
    }
  }

  return true;
};

// convert FEN piece code to bP, wK, etc
var FENToPieceCode = function(piece) {
  // black piece
  if (piece.toLowerCase() === piece) {
    return 'b' + piece.toUpperCase();
  }

  // white piece
  return 'w' + piece.toUpperCase();
};

// convert bP, wK, etc code to FEN structure
var pieceCodeToFEN = function(piece) {
  var tmp = piece.split('');

  // white piece
  if (tmp[0] === 'w') {
    return tmp[1].toUpperCase();
  }

  // black piece
  return tmp[1].toLowerCase();
};

// convert FEN string to position object
// returns false if the FEN string is invalid
var FENToObj = function(fen) {
  if (validFEN(fen) !== true) {
    return false;
  }

  var rows = fen.split('/');
  var position = {};

  var currentRow = 8;
  for (var i = 0; i < 8; i++) {
    var row = rows[i].split('');
    var colIndex = 0;

    // loop through each character in the FEN section
    for (var j = 0; j < row.length; j++) {
      // number / empty squares
      if (row[j].search(/[1-8]/) !== -1) {
        var emptySquares = parseInt(row[j], 10);
        colIndex += emptySquares;
      }
      // piece
      else {
        var square = COLUMNS[colIndex] + currentRow;
        position[square] = FENToPieceCode(row[j]);
        colIndex++;
      }
    }

    currentRow--;
  }

  return position;
};

// position object to FEN string
// returns false if the obj is not a valid position object
var objToFEN = function(obj) {
  if (validPositionObject(obj) !== true) {
    return false;
  }

  var fen = '';

  var currentRow = 8;
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var square = COLUMNS[j] + currentRow;

      // piece exists
      if (obj.hasOwnProperty(square) === true) {
        fen += pieceCodeToFEN(obj[square]);
      }

      // empty space
      else {
        fen += '1';
      }
    }

    if (i !== 7) {
      fen += '/';
    }

    currentRow--;
  }

  // squeeze the numbers together
  // haha, I love this solution...
  fen = fen.replace(/11111111/g, '8');
  fen = fen.replace(/1111111/g, '7');
  fen = fen.replace(/111111/g, '6');
  fen = fen.replace(/11111/g, '5');
  fen = fen.replace(/1111/g, '4');
  fen = fen.replace(/111/g, '3');
  fen = fen.replace(/11/g, '2');

  return fen;
};

window['ChessBoard'] = window['ChessBoard'] || function(containerElOrId, cfg) {
'use strict';

cfg = cfg || {};

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

var MINIMUM_JQUERY_VERSION = '1.4.2',
  START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  START_POSITION = FENToObj(START_FEN);

// use unique class names to prevent clashing with anything else on the page
// and simplify selectors
var CSS = {
  alpha: 'alpha-d2270',
  black: 'black-3c85d',
  board: 'board-b72b1',
  chessboard: 'chessboard-63f37',
  clearfix: 'clearfix-7da63',
  highlight1: 'highlight1-32417',
  highlight2: 'highlight2-9c5d2',
  notation: 'notation-322f9',
  numeric: 'numeric-fc462',
  piece: 'piece-417db',
  row: 'row-5277c',
  square: 'square-55d63',
  white: 'white-1e1d7'
};

//------------------------------------------------------------------------------
// Module Scope Variables
//------------------------------------------------------------------------------

// DOM elements
var containerEl, boardEl;

// constructor return object
var widget = {};

//------------------------------------------------------------------------------
// Stateful
//------------------------------------------------------------------------------

var ANIMATION_HAPPENING = false,
  CURRENT_ORIENTATION = 'white',
  CURRENT_POSITION = {},
  SQUARE_SIZE,
  DRAGGED_PIECE,
  DRAGGED_PIECE_EL,
  DRAGGED_PIECE_LOCATION,
  DRAGGED_PIECE_SOURCE_SQUARE,
  DRAGGING_A_PIECE = false,
  SQUARE_ELS_IDS = {},
  SQUARE_ELS_OFFSETS;

//------------------------------------------------------------------------------
// JS Util Functions
//------------------------------------------------------------------------------

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
var createId = function() {
  return 'xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function(c) {
    var r = Math.random() * 16 | 0;
    return r.toString(16);
  });
};

var deepCopy = function(thing) {
  return JSON.parse(JSON.stringify(thing));
};

/*
var isArray = Array.isArray || function(vArg) {
  return Object.prototype.toString.call(vArg) === '[object Array]';
};

var isObject = $.isPlainObject;
*/

var parseSemVer = function(version) {
  var tmp = version.split('.');
  return {
    major: parseInt(tmp[0], 10),
    minor: parseInt(tmp[1], 10),
    patch: parseInt(tmp[2], 10)
  };
};

// returns true if version is >= minimum
var compareSemVer = function(version, minimum) {
  version = parseSemVer(version);
  minimum = parseSemVer(minimum);

  var versionNum = (version.major * 10000 * 10000) +
    (version.minor * 10000) + version.patch;
  var minimumNum = (minimum.major * 10000 * 10000) +
    (minimum.minor * 10000) + minimum.patch;

  return (versionNum >= minimumNum);
};

//------------------------------------------------------------------------------
// Validation
//------------------------------------------------------------------------------

var error = function(code, msg, obj) {
  // do nothing if showErrors is not set
  if (cfg.hasOwnProperty('showErrors') !== true ||
      cfg.showErrors === false) {
    return;
  }

  var errorText = 'ChessBoard Error ' + code + ': ' + msg;

  // print to console
  if (cfg.showErrors === 'console' &&
      typeof console === 'object' &&
      typeof console.log === 'function') {
    console.log(errorText);
    if (arguments.length >= 2) {
      console.log(obj);
    }
    return;
  }

  // alert errors
  if (cfg.showErrors === 'alert') {
    if (obj) {
      errorText += '\n\n' + JSON.stringify(obj);
    }
    window.alert(errorText);
    return;
  }

  // custom function
  if (typeof cfg.showErrors === 'function') {
    cfg.showErrors(code, msg, obj);
  }
};

// check dependencies
var checkDeps = function() {
  // if containerId is a string, it must be the ID of a DOM node
  if (typeof containerElOrId === 'string') {
    // cannot be empty
    if (containerElOrId === '') {
      window.alert('ChessBoard Error 1001: ' +
        'The first argument to ChessBoard() cannot be an empty string.' +
        '\n\nExiting...');
      return false;
    }

    // make sure the container element exists in the DOM
    var el = document.getElementById(containerElOrId);
    if (! el) {
      window.alert('ChessBoard Error 1002: Element with id "' +
        containerElOrId + '" does not exist in the DOM.' +
        '\n\nExiting...');
      return false;
    }

    // set the containerEl
    containerEl = $(el);
  }

  // else it must be something that becomes a jQuery collection
  // with size 1
  // ie: a single DOM node or jQuery object
  else {
    containerEl = $(containerElOrId);

    if (containerEl.length !== 1) {
      window.alert('ChessBoard Error 1003: The first argument to ' +
        'ChessBoard() must be an ID or a single DOM node.' +
        '\n\nExiting...');
      return false;
    }
  }

  // JSON must exist
  if (! window.JSON ||
      typeof JSON.stringify !== 'function' ||
      typeof JSON.parse !== 'function') {
    window.alert('ChessBoard Error 1004: JSON does not exist. ' +
      'Please include a JSON polyfill.\n\nExiting...');
    return false;
  }

  // check for a compatible version of jQuery
  if (! (typeof window.$ && $.fn && $.fn.jquery &&
      compareSemVer($.fn.jquery, MINIMUM_JQUERY_VERSION) === true)) {
    window.alert('ChessBoard Error 1005: Unable to find a valid version ' +
      'of jQuery. Please include jQuery ' + MINIMUM_JQUERY_VERSION + ' or ' +
      'higher on the page.\n\nExiting...');
    return false;
  }

  return true;
};

// create random IDs for every square on the board
var createSquareIds = function() {
  for (var i = 0; i < COLUMNS.length; i++) {
    for (var j = 1; j <= 8; j++) {
      var square = COLUMNS[i] + j;
      SQUARE_ELS_IDS[square] = square + '-' + createId();
    }
  }
};

// validate config / set default options
var expandConfig = function() {
  if (typeof cfg === 'string' || validPositionObject(cfg) === true) {
    cfg = {
      position: cfg
    };
  }

  // default for orientation is white
  if (cfg.hasOwnProperty('orientation') !== true ||
      cfg.orientation !== 'black') {
    cfg.orientation = 'white';
  }
  CURRENT_ORIENTATION = cfg.orientation;

  // default for showNotation is true
  if (cfg.showNotation !== false) {
    cfg.showNotation = true;
  }

  // default for draggable is false
  if (cfg.draggable !== true) {
    cfg.draggable = false;
  }

  // default for dropOffBoard is 'snapback'
  if (cfg.dropOffBoard !== 'trash') {
    cfg.dropOffBoard = 'snapback';
  }

  // make onChange a function if they did not provide one
  if (typeof cfg.onChange !== 'function') {
    cfg.onChange = function() {};
  }

  // default for notation is true
  if (cfg.hasOwnProperty('notation') !== true ||
      cfg.notation !== false) {
    cfg.notation = true;
  }

  // default piece theme is wikipedia
  if (cfg.hasOwnProperty('pieceTheme') !== true ||
      (typeof cfg.pieceTheme !== 'string' && 
       typeof cfg.pieceTheme !== 'function')) {
    cfg.pieceTheme = 'img/chesspieces/wikipedia/{piece}.png';
  }

  // make sure position is valid
  if (cfg.hasOwnProperty('position') === true) {
    if (cfg.position === 'start') {
      CURRENT_POSITION = deepCopy(START_POSITION);
    }

    else if (validFEN(cfg.position) === true) {
      CURRENT_POSITION = FENToObj(cfg.position);
    }

    else if (validPositionObject(cfg.position) === true) {
      CURRENT_POSITION = deepCopy(cfg.position);
    }

    else {
      error(7263, 'Invalid value passed to config.position.', cfg.position);
    }
  }

  return true;
};

//------------------------------------------------------------------------------
// DOM-related things
//------------------------------------------------------------------------------

// calculates square size based on the width of the container
// got a little CSS black magic here, so let me explain:
// get the width of the container element (could be anything), reduce by 1 for
// fudge factor, and then keep reducing until we find an exact mod 8 for
// our square size
var calculateSquareSize = function() {
  var containerWidth = parseInt(containerEl.css('width'), 10);

  // defensive, prevent infinite loop
  if (! containerWidth || containerWidth <= 0) {
    return 0;
  }

  // pad one pixel
  var boardWidth = containerWidth - 1;

  while (boardWidth % 8 !== 0 && boardWidth > 0) {
    boardWidth--;
  }

  return (boardWidth / 8);
};

//------------------------------------------------------------------------------
// Markup Building Functions
//------------------------------------------------------------------------------

var buildBoardContainer = function() {
  var html = '<div class="' + CSS.chessboard + '">' +
  '<div class="' + CSS.board + '"></div>' +
  '</div>';

  return html;
};

/*
var buildSquare = function(color, size, id) {
  var html = '<div class="' + CSS.square + ' ' + CSS[color] + '" ' +
  'style="width: ' + size + 'px; height: ' + size + 'px" ' +
  'id="' + id + '">';

  if (cfg.showNotation === true) {

  }

  html += '</div>';

  return html;
};
*/

var buildBoard = function(orientation) {
  if (orientation !== 'black') {
    orientation = 'white';
  }

  var html = '';

  // algebraic notation / orientation
  var alpha = 'abcdefgh'.split('');
  var row = 8;
  if (orientation === 'black') {
    alpha.reverse();
    row = 1;
  }

  var squareColor = 'white';
  for (var i = 0; i < 8; i++) {
    html += '<div class="' + CSS.row + '">';
    for (var j = 0; j < 8; j++) {
      var square = alpha[j] + row;

      html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + '" ' +
        'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' +
        'id="' + SQUARE_ELS_IDS[square] + '" ' +
        'data-square="' + square + '">';

      if (cfg.notation === true) {
        // alpha notation
        if ((orientation === 'white' && row === 1) ||
            (orientation === 'black' && row === 8)) {
          html += '<div class="' + CSS.notation + ' ' + CSS.alpha + '">' +
            alpha[j] + '</div>';
        }

        // numeric notation
        if (j === 0) {
          html += '<div class="' + CSS.notation + ' ' + CSS.numeric + '">' +
            row + '</div>';
        }
      }

      html += '</div>'; // end .square

      squareColor = (squareColor === 'white' ? 'black' : 'white');
    }
    html += '<div class="' + CSS.clearfix + '"></div></div>';

    squareColor = (squareColor === 'white' ? 'black' : 'white');

    if (orientation === 'white') {
      row--;
    }
    else {
      row++;
    }
  }

  return html;
};

var buildPieceImgSrc = function(piece) {
  if (typeof cfg.pieceTheme === 'function') {
    return cfg.pieceTheme(piece);
  }

  if (typeof cfg.pieceTheme === 'string') {
    return cfg.pieceTheme.replace(/{piece}/g, piece);
  }
  
  // NOTE: this should never happen
  // TODO: throw error?
};

var buildPiece = function(piece, hidden, id) {
  var html = '<img src="' + buildPieceImgSrc(piece) + '" ';
  if (id && typeof id === 'string') {
    html += 'id="' + id + '" ';
  }
  html += 'alt="" ' +
  'class="' + CSS.piece + '" ' +
  'data-piece="' + piece + '" ' +
  'style="width: ' + SQUARE_SIZE + 'px; ' +
  'height: ' + SQUARE_SIZE + 'px; ';
  if (hidden === true) {
    html += 'display:none';
  }
  html += '" />';

  return html;
};

//------------------------------------------------------------------------------
// DOM Manipulation
//------------------------------------------------------------------------------

var clearBoardFade = function() {
  boardEl.find('img.' + CSS.piece).fadeOut('fast', function() {
    $(this).remove();
  });
};

var clearBoardInstant = function() {
  boardEl.find('img.' + CSS.piece).remove();
};

var drawPositionInstant = function() {
  clearBoardInstant();

  for (var i in CURRENT_POSITION) {
    if (CURRENT_POSITION.hasOwnProperty(i) !== true) continue;

    $('#' + SQUARE_ELS_IDS[i]).append(buildPiece(CURRENT_POSITION[i]));
  }
};

var drawBoard = function() {
  boardEl.html(buildBoard(CURRENT_ORIENTATION));
  drawPositionInstant();
};

//------------------------------------------------------------------------------
// Animations
//------------------------------------------------------------------------------

var animateMove = function(srcSquare, destSquare, piece, completeFn) {
  // get information about the source and destination squares
  var srcSquareEl = $('#' + SQUARE_ELS_IDS[srcSquare]);
  var srcSquarePosition = srcSquareEl.offset();
  var destSquareEl = $('#' + SQUARE_ELS_IDS[destSquare]);
  var destSquarePosition = destSquareEl.offset();

  // create the animated piece and absolutely position it
  // over the source square
  var animatedPieceId = createId();
  $('body').append(buildPiece(piece, true, animatedPieceId));
  var animatedPieceEl = $('#' + animatedPieceId);
  animatedPieceEl.css({
    display: '',
    position: 'absolute',
    top: srcSquarePosition.top,
    left: srcSquarePosition.left
  });

  // remove original piece from source square
  srcSquareEl.find('img.' + CSS.piece).remove();

  // on complete
  var complete = function() {
    // add the "real" piece to the destination square
    destSquareEl.append(buildPiece(piece));

    // remove the animated piece
    animatedPieceEl.remove();

    // run complete function
    if (typeof completeFn === 'function') {
      completeFn();
    }
  };

  // animate the piece to the destination square
  var opts = {
    duration: 'fast',
    complete: complete
  };
  animatedPieceEl.animate(destSquarePosition, opts);
};

var doAnimations = function(a) {
  ANIMATION_HAPPENING = true;

  var numFinished = 0;
  var onFinish = function() {
    numFinished++;
    if (numFinished === a.length) {
      drawPositionInstant();
      ANIMATION_HAPPENING = false;
    }
  };

  for (var i = 0; i < a.length; i++) {
    // clear a piece
    if (a[i].type === 'clear') {
      $('#' + SQUARE_ELS_IDS[a[i].square] + ' img.' + CSS.piece)
        .fadeOut('fast', onFinish);
    }

    // add a piece
    if (a[i].type === 'add') {
      $('#' + SQUARE_ELS_IDS[a[i].square])
        .append(buildPiece(a[i].piece, true))
        .find('img.' + CSS.piece)
        .fadeIn('fast', onFinish);
    }

    // move a piece
    if (a[i].type === 'move') {
      animateMove(a[i].source, a[i].destination, a[i].piece, onFinish);
    }
  }
};

/*
// returns an array of closest squares from square
var createRadius = function(square) {
  var squares = [];

  // TODO: write me

};
*/

// returns the square of the closest instance of piece
// returns false if no instance of piece is found in position
var findClosestPiece = function(position, piece, square) {

  // TODO: replace this algorithm with a radius one

  for (var i in position) {
    if (position.hasOwnProperty(i) !== true) continue;

    // ignore the square
    // TODO: is this a bug?
    //if (i === square) continue;

    if (position[i] === piece) {
      return i;
    }
  }

  return false;
};

// calculate an array of animations that need to happen in order to get
// from pos1 to pos2
var calculateAnimations = function(pos1, pos2) {
  // make copies of both
  pos1 = deepCopy(pos1);
  pos2 = deepCopy(pos2);

  var animations = [];

  // remove pieces that are the same in both positions
  for (var i in pos2) {
    if (pos2.hasOwnProperty(i) !== true) continue;

    if (pos1.hasOwnProperty(i) === true && pos1[i] === pos2[i]) {
      delete pos1[i];
      delete pos2[i];
    }
  }

  // find all the "move" animations
  for (var i in pos2) {
    if (pos2.hasOwnProperty(i) !== true) continue;

    var closestPiece = findClosestPiece(pos1, pos2[i], i);
    if (closestPiece !== false) {
      animations.push({
        type: 'move',
        source: closestPiece,
        destination: i,
        piece: pos2[i]
      });

      delete pos1[closestPiece];
      delete pos2[i];
    }
  }

  // add pieces to pos2
  for (var i in pos2) {
    if (pos2.hasOwnProperty(i) !== true) continue;

    animations.push({
      type: 'add',
      square: i,
      piece: pos2[i]
    })

    delete pos2[i];
  }

  // clear pieces from pos1
  for (var i in pos1) {
    if (pos1.hasOwnProperty(i) !== true) continue;

    animations.push({
      type: 'clear',
      square: i,
      piece: pos1[i]
    });

    delete pos1[i];
  }

  return animations;
};

// given a position and a set of moves, return a new position
// with the moves executed
var calculatePositionFromMoves = function(position, moves) {
  position = deepCopy(position);

  for (var i in moves) {
    if (moves.hasOwnProperty(i) !== true) continue;

    // skip the move if the position doesn't have a piece on the source square
    if (position.hasOwnProperty(i) !== true) continue;

    var piece = position[i];
    delete position[i];
    position[moves[i]] = piece;
  }

  return position;
};

var setCurrentPosition = function(position) {
  var oldPosObj = deepCopy(CURRENT_POSITION);
  var newPosObj = deepCopy(position);
  var oldPosFEN = objToFEN(oldPosObj);
  var newPosFEN = objToFEN(newPosObj);

  // do nothing if no change in position
  if (oldPosFEN === newPosFEN) return;

  // run their onChange function
  if (cfg.hasOwnProperty('onChange') === true && 
      typeof cfg.onChange === 'function') {
    cfg.onChange(oldPosObj, newPosObj, oldPosFEN, newPosFEN);
  }

  // update state
  CURRENT_POSITION = position;
};

var animateToPosition = function(pos1, pos2) {
  doAnimations(calculateAnimations(pos1, pos2));
};

var isXYOnSquare = function(x, y) {
  for (var i in SQUARE_ELS_OFFSETS) {
    if (SQUARE_ELS_OFFSETS.hasOwnProperty(i) !== true) continue;

    var s = SQUARE_ELS_OFFSETS[i];
    if (x >= s.left && x < s.left + SQUARE_SIZE &&
        y >= s.top && y < s.top + SQUARE_SIZE) {
      return i;
    }
  }

  return 'offboard';
};

// records the XY coords of every square into memory
var captureSquareOffsets = function() {
  SQUARE_ELS_OFFSETS = {};

  for (var i in SQUARE_ELS_IDS) {
    if (SQUARE_ELS_IDS.hasOwnProperty(i) !== true) continue;

    SQUARE_ELS_OFFSETS[i] = $('#' + SQUARE_ELS_IDS[i]).offset();
  }
};

var removeSquareHighlights = function() {
  boardEl.find('div.' + CSS.square)
    .removeClass(CSS.highlight1 + ' ' + CSS.highlight2);
};

var snapbackPiece = function() {
  removeSquareHighlights();

  // get source square position
  var sourceSquarePosition = 
    $('#' + SQUARE_ELS_IDS[DRAGGED_PIECE_SOURCE_SQUARE])
      .offset();

  // animation complete
  var complete = function() {
    drawPositionInstant();
    DRAGGED_PIECE_EL.css('display', 'none');
  };

  // animate the piece to the target square
  var opts = {
    duration: 50,
    complete: complete
  };
  DRAGGED_PIECE_EL.animate(sourceSquarePosition, opts);

  // set state
  DRAGGING_A_PIECE = false;
};

var trashPiece = function() {
  removeSquareHighlights();

  // remove the source piece
  var newPosition = deepCopy(CURRENT_POSITION);
  delete newPosition[DRAGGED_PIECE_SOURCE_SQUARE];
  setCurrentPosition(newPosition);

  // redraw the position
  drawPositionInstant();

  // hide the dragged piece
  DRAGGED_PIECE_EL.fadeOut('fast');

  // set state
  DRAGGING_A_PIECE = false;
};

var dropPiece = function(square) {
  removeSquareHighlights();

  // update position
  var newPosition = deepCopy(CURRENT_POSITION);
  delete newPosition[DRAGGED_PIECE_SOURCE_SQUARE];
  newPosition[square] = DRAGGED_PIECE;
  setCurrentPosition(newPosition);

  // get target square information
  var targetSquareEl = $('#' + SQUARE_ELS_IDS[square]);
  var targetSquarePosition = targetSquareEl.offset();

  // animation complete
  var complete = function() {
    drawPositionInstant();
    DRAGGED_PIECE_EL.css('display', 'none');
  };

  // animate the piece to the target square
  var opts = {
    duration: 25,
    complete: complete
  };
  DRAGGED_PIECE_EL.animate(targetSquarePosition, opts);

  // set state
  DRAGGING_A_PIECE = false;
};

var beginDraggingPiece = function(square, piece, x, y) {
  // run their custom onDragStart function
  // their custom onDragStart function can cancel drag start
  if (typeof cfg.onDragStart === 'function' &&
      cfg.onDragStart(square, piece, 
        deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION) === false) {
    return;
  }

  // set state
  DRAGGING_A_PIECE = true;
  DRAGGED_PIECE = piece;
  DRAGGED_PIECE_SOURCE_SQUARE = square;
  DRAGGED_PIECE_LOCATION = square;
  captureSquareOffsets();

  // create the dragged piece
  DRAGGED_PIECE_EL.attr('src', buildPieceImgSrc(piece))
    .css({
      display: '',
      position: 'absolute',
      left: x - (SQUARE_SIZE / 2),
      top: y - (SQUARE_SIZE / 2)
    });

  // hide the piece on the source square
  $('#' + SQUARE_ELS_IDS[square] + ' img.' + CSS.piece).css('display', 'none');

  // highlight the source square
  $('#' + SQUARE_ELS_IDS[square]).addClass(CSS.highlight1);
};

//------------------------------------------------------------------------------
// Public Methods
//------------------------------------------------------------------------------

// clear the board
widget.clear = function(useAnimation) {
  if (useAnimation === false) {
    clearBoardInstant();
  }
  else {
    clearBoardFade();
  }

  setCurrentPosition({});
};

// get or set config properties
widget.config = function(arg1, arg2) {
  // get the current config
  if (arguments.length === 0) {
    return deepCopy(cfg);
  }

  // TODO: write me
};

// remove the widget from the page
widget.destroy = function() {
  // remove markup
  containerEl.html('');
  DRAGGED_PIECE_EL.remove();

  // remove event handlers
  containerEl.unbind();
};

// shorthand method to get the current FEN
widget.fen = function() {
  widget.position('fen');
};

// flip orientation
widget.flip = function() {
  widget.orientation('flip');
};

widget.highlight = function() {

  // TODO: write me

};

// move piece(s)
// TODO: allow the first argument to be an array of moves?
widget.move = function() {
  // NOTE: no need to throw an error here; just do nothing
  if (arguments.length === 0) return;

  var moves = {};
  for (var i = 0; i < arguments.length; i++) {
    // skip invalid arguments
    if (validMove(arguments[i]) !== true) {
      error(2826, 'Invalid move passed to the move method.', arguments[i]);
      continue;
    }

    var tmp = arguments[i].split('-');
    moves[tmp[0]] = tmp[1];
  }

  var pos2 = calculatePositionFromMoves(CURRENT_POSITION, moves);

  widget.position(pos2);

  // TODO: return the new position object
};

widget.position = function(position, useAnimation) {
  // no arguments, return the current position
  if (arguments.length === 0) {
    return deepCopy(CURRENT_POSITION);
  }

  // get position as FEN
  if (typeof position === 'string' && position.toLowerCase() === 'fen') {
    return objToFEN(CURRENT_POSITION);
  }

  // default for useAnimations is true
  if (useAnimation !== false) {
    useAnimation = true;
  }

  // start position
  if (position === 'start') {
    position = deepCopy(START_POSITION);
  }

  // convert FEN to position object
  if (validFEN(position) === true) {
    position = FENToObj(position);
  }

  // validate position object
  if (validPositionObject(position) !== true) {
    error(6482, 'Invalid value passed to the position method.', position);
    return;
  }

  if (useAnimation === true) {
    // start the animation
    animateToPosition(CURRENT_POSITION, position);

    // set the new position
    setCurrentPosition(position);
  }
  // instant update
  else {
    setCurrentPosition(position);
    drawPositionInstant();
  }
};

widget.resize = function() {
  // calulate the new square size
  SQUARE_SIZE = calculateSquareSize();

  // set board width
  boardEl.css('width', (SQUARE_SIZE * 8) + 'px');

  // redraw the board
  drawBoard();
};

widget.orientation = function(arg) {
  // no arguments, return the current orientation
  if (arguments.length === 0) {
    return CURRENT_ORIENTATION;
  }

  // set to white or black
  if (arg === 'white' || arg === 'black') {
    CURRENT_ORIENTATION = arg;
    drawBoard();
    return;
  }

  // flip orientation
  if (arg === 'flip') {
    CURRENT_ORIENTATION = (CURRENT_ORIENTATION === 'white') ? 'black' : 'white';
    drawBoard();
    return;
  }

  error(5482, 'Invalid value passed to the orientation method.', arg);
};

// set the starting position
widget.start = function(useAnimation) {
  widget.position('start', useAnimation);
};

//------------------------------------------------------------------------------
// Browser Events
//------------------------------------------------------------------------------

var stopDefault = function(e) {
  e.preventDefault();
};

var mousedownSquare = function(e) {
  // do nothing if we're not draggable
  if (cfg.draggable !== true) return;

  var square = $(this).attr('data-square');

  // no piece on this square
  if (validSquare(square) !== true ||
      CURRENT_POSITION.hasOwnProperty(square) !== true) {
    return;
  }

  beginDraggingPiece(square, CURRENT_POSITION[square], e.pageX, e.pageY);
};

var mousemoveBody = function(e) {
  // do nothing if we are not dragging a piece
  if (DRAGGING_A_PIECE !== true || cfg.draggable !== true ||
      ! DRAGGED_PIECE_EL) return;

  // put the dragged piece over the mouse cursor
  DRAGGED_PIECE_EL.css({
    left: e.pageX - (SQUARE_SIZE / 2),
    top: e.pageY - (SQUARE_SIZE / 2)
  });

  // get location
  var location = isXYOnSquare(e.pageX, e.pageY);

  // do nothing if the location has not changed
  if (location === DRAGGED_PIECE_LOCATION) return;

  // remove highlight from previous square
  if (DRAGGED_PIECE_LOCATION !== 'offboard') {
    $('#' + SQUARE_ELS_IDS[DRAGGED_PIECE_LOCATION])
      .removeClass(CSS.highlight2);
  }

  // add highlight to new square
  if (location !== 'offboard') {
    $('#' + SQUARE_ELS_IDS[location]).addClass(CSS.highlight2);
  }

  // run onDragMove
  if (typeof cfg.onDragMove === 'function') {
    cfg.onDragMove(location, DRAGGED_PIECE_LOCATION, 
      DRAGGED_PIECE_SOURCE_SQUARE, DRAGGED_PIECE,
      deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION);
  }

  // update state
  DRAGGED_PIECE_LOCATION = location;
};

var mouseupBody = function(e) {
  // do nothing if we are not dragging a piece
  if (DRAGGING_A_PIECE !== true || cfg.draggable !== true ||
      ! DRAGGED_PIECE_EL) return;

  // get the location
  var location = isXYOnSquare(e.pageX, e.pageY);

  // determine what the action should be
  var action = 'drop';
  if (location === 'offboard' && cfg.dropOffBoard === 'snapback') {
    action = 'snapback';
  }
  else if (location === 'offboard' && cfg.dropOffBoard === 'trash') {
    action = 'trash';
  }

  // run their onDrop function, which can potentially change the drop action
  if (typeof cfg.onDrop === 'function') {
    var newPosition = deepCopy(CURRENT_POSITION);
    if (location !== 'offboard') {
      var moves = {};
      moves[DRAGGED_PIECE_SOURCE_SQUARE] = location;
      newPosition = calculatePositionFromMoves(CURRENT_POSITION, moves);
    }
    var oldPosition = deepCopy(CURRENT_POSITION);

    var result = cfg.onDrop(location, newPosition, oldPosition,
      DRAGGED_PIECE_SOURCE_SQUARE, DRAGGED_PIECE, CURRENT_ORIENTATION);
    if (result === 'snapback' || result === 'trash') {
      action = result;
    }
  }

  // do it!
  if (action === 'snapback') {
    snapbackPiece();
  }
  else if (action === 'trash') {
    trashPiece();
  }
  else if (action === 'drop') {
    dropPiece(location);
  }
};

//------------------------------------------------------------------------------
// Initialization
//------------------------------------------------------------------------------

// NOTE: using delegate and bind here instead of $.on to
// maintain compatibility with older jquery versions
var addEvents = function() {
  // prevent browser "image drag"
  $('body').delegate('img.' + CSS.piece, 'mousedown mousemove', stopDefault);
  document.ondragstart = function() { return false; }; // IE-specific

  // draggable pieces
  boardEl.delegate('div.' + CSS.square, 'mousedown', mousedownSquare);
  $('body').bind('mousemove', mousemoveBody);
  $('body').bind('mouseup', mouseupBody);
};

var initDom = function() {
  // build board and save it in memory
  containerEl.html(buildBoardContainer());
  boardEl = containerEl.find('div.' + CSS.board);

  // set the size
  widget.resize();

  // load the initial position
  drawBoard();

  // create the drag piece
  var draggedPieceId = createId();
  $('body').append(buildPiece('wP', true, draggedPieceId));
  DRAGGED_PIECE_EL = $('#' + draggedPieceId);  
};

var init = function() {
  if (checkDeps() !== true ||
      expandConfig() !== true) return;

  createSquareIds();
  initDom();
  addEvents();
};

// go time
init();

// return the widget object
return widget;

}; // end window.ChessBoard

// expose util functions
window.ChessBoard.FENToObj = FENToObj;
window.ChessBoard.objToFEN = objToFEN;

})(); // end anonymous wrapper
