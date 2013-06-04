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

var COLUMNS = 'abcdefgh'.split('');

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

  // FEN should be 9 sections separated by slashes
  var chunks = fen.split('/');
  if (chunks.length !== 9) return false;

  // check the piece sections
  for (var i = 0; i < 8; i++) {
    // TODO: write me
  }

  // last section should be either 'w' or 'b'
  if (chunks[8] !== 'w' && chunks[8] !== 'b') return false;

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
      // TODO: check this with regex instead
      var emptySquares = parseInt(row[j], 10);
      if (emptySquares > 0) {
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
var MINIMUM_JQUERY_VERSION = '1.4.2';

// TODO: use start FEN and just convert to position object on load

var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

var START_POSITION = {
  // white pieces
  a1: 'wR', b1: 'wN', c1: 'wB', d1: 'wQ', e1: 'wK', f1: 'wB', g1: 'wN', h1: 'wR',

  // white pawns
  a2: 'wP', b2: 'wP', c2: 'wP', d2: 'wP', e2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP',

  // black pieces
  a8: 'bR', b8: 'bN', c8: 'bB', d8: 'bQ', e8: 'bK', f8: 'bB', g8: 'bN', h8: 'bR',

  // black pawns
  a7: 'bP', b7: 'bP', c7: 'bP', d7: 'bP', e7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP'
};

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
  DRAGGING_A_PIECE = false,
  DRAGGED_PIECE,
  DRAGGED_PIECE_SOURCE_SQUARE,
  DRAGGED_PIECE_EL,
  HIGHLIGHTED_SQUARE = false,
  SQUARE_ELS_IDS = {},
  SQUARE_ELS_OFFSETS;

//------------------------------------------------------------------------------
// JS Util Functions
//------------------------------------------------------------------------------

// http://yuiblog.com/sandbox/yui/3.3.0pr3/api/escape.js.html
var regexEscape = function(str) {
  return (str + '').replace(/[\-#$\^*()+\[\]{}|\\,.?\s]/g, '\\$&');
};

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

var isArray = Array.isArray || function(vArg) {
  return Object.prototype.toString.call(vArg) === '[object Array]';
};

var isObject = $.isPlainObject;

// returns an array of object keys
var keys = function(obj) {
  var arr = [];
  for (var i in obj) {
    if (obj.hasOwnProperty(i) !== true) continue;
    arr.push(i);
  }
  return arr;
};

// simple string replacement
var tmpl = function(str, obj) {
  for (var i in obj) {
    if (obj.hasOwnProperty(i) !== true) continue;

    // convert to string
    var value = obj[i] + '';

    str = str.replace(new RegExp('{' + regexEscape(i) + '}', 'g'), value);
  }
  return str;
};

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
// Chess Util Functions
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
// Validation
//------------------------------------------------------------------------------



/*
var error = function(code, msg, obj) {
  if (cfg.hasOwnProperty('showErrors') !== true ||
      cfg.showErrors === false) {
    return;
  }

  var errorText = 'ChessBoard Error ' + code + ': ' + msg;
  if (cfg.showErrors === 'console' &&
      typeof console === 'object' &&
      typeof console.log === 'function') {
    console.log(errorText);
    if (arguments.length >= 2) {
      console.log(obj);
    }
    return;
  }

  if (cfg.showErrors === 'alert') {
    if (obj) {
      errorText += '\n\n' + JSON.stringify(obj);
    }
    window.alert(errorText);
    return;
  }

  if (typeof cfg.showErrors === 'function') {
    cfg.showErrors(code, msg, obj);
  }
};
*/

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

  // default for dragOffBoard is 'snapback'
  if (cfg.dragOffBoard !== 'trash') {
    cfg.dragOffBoard = 'snapback';
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
      // TODO: throw error
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
// fudget factor, and then keep reducing until we find an exact mod 8 for
// our square size
var calculateSquareSize = function() {

  var containerWidth = parseInt(containerEl.css('width'), 10);

  // NOTE: there were times while debugging that the while loop would get
  //       stuck, so I added this in order to prevent that
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

var buildWidget = function() {
  var squareSize = calculateSquareSize();
  var boardWidth = (squareSize * 8);

  var html = '<div class="' + CSS.chessboard + '">' +
  '<div class="' + CSS.board + '" style="width: ' + boardWidth + 'px"></div>' +
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

  var squareSize = calculateSquareSize();
  var boardWidth = (squareSize * 8);
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
        'style="width: ' + squareSize + 'px; height: ' + squareSize + 'px" ' +
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

// TODO: integrate this with themeing
var createPieceImgSrc = function(piece) {
  return 'img/pieces/wikipedia/' + piece + '.png';
};

var buildPiece = function(piece, hidden, id) {
  var html = '<img src="' + createPieceImgSrc(piece) + '" ';
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

// returns an array of closest squares from square
var createRadius = function(square) {
  var squares = [];

  // TODO: write me

};

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
// pos1 to pos2
var calculateAnimations = function(pos1, pos2) {
  // make deep copies of both
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

    // skip if the position doesn't have a piece on the source square
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

  cfg.onChange(oldPosObj, newPosObj, oldPosFEN, newPosFEN);

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

  return false;
};

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
  HIGHLIGHTED_SQUARE = false;
};

var dropPieceOffBoard = function() {
  removeSquareHighlights();

  // snap back to the board
  if (cfg.dragOffBoard === 'snapback') {
    // get source square position
    var sourceSquarePosition =
      $('#' + SQUARE_ELS_IDS[DRAGGED_PIECE_SOURCE_SQUARE])
      .offset();

    // animation complete
    var complete = function() {
      drawPositionInstant();
      DRAGGED_PIECE_EL.remove();
    };

    // animate the piece to the target square
    var opts = {
      duration: 50,
      complete: complete
    };
    DRAGGED_PIECE_EL.animate(sourceSquarePosition, opts);
  }

  // trash the piece
  else if (cfg.dragOffBoard === 'trash') {
    // update position
    var newPosition = deepCopy(CURRENT_POSITION);
    delete newPosition[DRAGGED_PIECE_SOURCE_SQUARE];
    setCurrentPosition(newPosition);

    // redraw board
    drawPositionInstant();

    // fade the dragged piece
    DRAGGED_PIECE_EL.fadeOut('fast', function() {
      DRAGGED_PIECE_EL.remove();
    });
  }

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
    DRAGGED_PIECE_EL.remove();
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

// TODO: just keep the dragged piece always in the DOM and update it's CSS
//       as necessary
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
  captureSquareOffsets();

  // create the dragged piece
  var draggedPieceId = createId();
  $('body').append(buildPiece(piece, true, draggedPieceId));
  DRAGGED_PIECE_EL = $('#' + draggedPieceId);
  DRAGGED_PIECE_EL.css({
    display: '',
    position: 'absolute',
    left: x - (SQUARE_SIZE / 2),
    top: y - (SQUARE_SIZE / 2)
  });

  // hide the piece on the square
  $('#' + SQUARE_ELS_IDS[square] + ' img.' + CSS.piece).css('display', 'none');

  // highlight the initial square
  $('#' + SQUARE_ELS_IDS[square]).addClass(CSS.highlight1);
  HIGHLIGHTED_SQUARE = square;
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

  // TODO: write me

};

// flip orientation
widget.flip = function() {
  widget.orientation('flip');
};

widget.highlight = function() {

  // TODO: write me

};

// move piece(s)
// TODO: support N arguments
//       support format of 'e2-e4' string
//       validate moves format
widget.move = function(start, end) {
  if (arguments.length === 0) {
    // TODO: throw error
    return;
  }

  if (arguments.length === 2) {
    var tmp = {};
    tmp[start] = end;
    start = tmp;
  }

  // TODO: validate the moves object here

  var pos2 = calculatePositionFromMoves(CURRENT_POSITION, start);

  widget.position(pos2);
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

    // TODO: throw error

    return;
  }

  if (useAnimation === true) {
    // start the animation
    animateToPosition(CURRENT_POSITION, position);

    // set the new position
    setCurrentPosition(position);
  }
  else {
    setCurrentPosition(position);
    drawPositionInstant();
  }
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
  }

  // flip orientation
  if (arg === 'flip') {
    CURRENT_ORIENTATION = (CURRENT_ORIENTATION === 'white') ? 'black' : 'white';
    drawBoard();
  }

  // TODO: throw error
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

  // update the dragged piece
  DRAGGED_PIECE_EL.css({
    left: e.pageX - (SQUARE_SIZE / 2),
    top: e.pageY - (SQUARE_SIZE / 2)
  });

  // are we on a square?
  var square = isXYOnSquare(e.pageX, e.pageY);

  // off the board, remove highlight2
  if (square === false && HIGHLIGHTED_SQUARE) {
    $('#' + SQUARE_ELS_IDS[HIGHLIGHTED_SQUARE]).removeClass(CSS.highlight2);
    HIGHLIGHTED_SQUARE = false;
    return;
  }

  // new square, remove highlight from the old one and set to the new one
  if (square && HIGHLIGHTED_SQUARE !== square) {
    $('#' + SQUARE_ELS_IDS[HIGHLIGHTED_SQUARE]).removeClass(CSS.highlight2);
    $('#' + SQUARE_ELS_IDS[square]).addClass(CSS.highlight2);
    HIGHLIGHTED_SQUARE = square;
  }
};

var mouseupBody = function(e) {
  // do nothing if we are not dragging a piece
  if (DRAGGING_A_PIECE !== true || cfg.draggable !== true ||
      ! DRAGGED_PIECE_EL) return;

  // are we on a square?
  var square = isXYOnSquare(e.pageX, e.pageY);

  // not on the board
  if (square === false) {
    dropPieceOffBoard();
  }
  // on a square
  else {
    dropPiece(square);
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
  SQUARE_SIZE = calculateSquareSize();

  // build the board
  containerEl.html(buildWidget());

  // grab elements in memory
  boardEl = containerEl.find('div.' + CSS.board);

  // load the initial position
  drawBoard();
};

var init = function() {
  if (checkDeps() !== true) return;
  if (expandConfig() !== true) return;

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
