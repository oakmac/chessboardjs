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

window['ChessBoard'] = window['ChessBoard'] || function(containerElOrId, cfg) {
'use strict';

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------
var MINIMUM_JQUERY_VERSION = '1.4.2';

var COLUMNS = 'abcdefgh'.split('');

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

//var START_POSITION_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR/w';

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

var ANIMATION_HAPPENING = false;
var CURRENT_ORIENTATION = 'white';
var CURRENT_POSITION = {};
var CURRENT_SQUARE_SIZE;
var SQUARE_ELS_IDS = {};

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

  var versionNum = (version.major * 10000 * 10000) + (version.minor * 10000) + version.patch;
  var minimumNum = (minimum.major * 10000 * 10000) + (minimum.minor * 10000) + minimum.patch;

  return (versionNum >= minimumNum);
};

//------------------------------------------------------------------------------
// Chess Util Functions
//------------------------------------------------------------------------------

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

//------------------------------------------------------------------------------
// Validation
//------------------------------------------------------------------------------

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
  if (isObject(pos) !== true) return false;

  for (var i in pos) {
    if (pos.hasOwnProperty(i) !== true) continue;

    if (validSquare(i) !== true || validPieceCode(pos[i]) !== true) {
      return false;
    }
  }

  return true;
};

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

// basic checks before we load the config or show anything on screen
var sanityChecks = function() {
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
      window.alert('ChessBoard Error 1017: The first argument to ' +
        'ChessBoard() must be an ID or a single DOM node.' + 
        '\n\nExiting...');
      return false;
    }
  }

  // JSON must exist
  if (! window.JSON ||
      typeof JSON.stringify !== 'function' ||
      typeof JSON.parse !== 'function') {
    window.alert('ChessBoard Error 1003: JSON does not exist. ' +
      'Please include a JSON polyfill.\n\nExiting...');
    return false;
  }

  // check for the correct version of jquery
  if (! (typeof window.$ && $.fn && $.fn.jquery &&
      compareSemVer($.fn.jquery, MINIMUM_JQUERY_VERSION) === true)) {
    window.alert('ChessBoard Error 1004: Unable to find a valid version ' +
      'of jQuery. Please include jQuery ' + MINIMUM_JQUERY_VERSION + ' or ' +
      'higher on the page.\n\nExiting...');
    return false;
  }

  // expand the config
  return expandConfig();
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

//------------------------------------------------------------------------------
// Expand Data Structures / Set Default Options
//------------------------------------------------------------------------------

var expandConfig = function() {
  cfg = cfg || {};

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

  // onChange must be a function
  if (cfg.hasOwnProperty('onChange') === true &&
      typeof cfg.onChange !== 'function') {
    // TODO: show error
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
var calculateSquareSize = function() {
  // got a little CSS black magic here, so let me explain:
  // div#board_container is fluid and will change with the page - this is what we want
  // get that width, then reduce by 1 for a fudge factor, and then keep reducing until
  // we find an exact mod 8 for our square size

  var containerWidth = parseInt(containerEl.css('width'), 10);

  // NOTE: there were times while debugging that the while loop would get stuck, so
  //       I added this in order to prevent that
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
        'id="' + SQUARE_ELS_IDS[square] + '">';

      if (cfg.notation === true) {
        // alpha notation
        if ((orientation === 'white' && row === 1) || (orientation === 'black' && row === 8)) {
          html += '<div class="' + CSS.notation + ' ' + CSS.alpha + '">' + alpha[j] + '</div>';
        }

        // numeric notation
        if (j === 0) {
          html += '<div class="' + CSS.notation + ' ' + CSS.numeric + '">' + row + '</div>';
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

var buildPiece = function(code, hidden, id) {
  var html = '<img src="img/pieces/wikipedia/' + code + '.png" ';
  if (id && typeof id === 'string') {
    html += 'id="' + id + '" ';
  }
  html += 'alt="" ' +
  'class="' + CSS.piece + '" ' +
  'data-piece="' + code + '" ' +
  'style="width: ' + CURRENT_SQUARE_SIZE + 'px; ' +
  'height: ' + CURRENT_SQUARE_SIZE + 'px; ';
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

var setPositionInstant = function(position) {
  clearBoardInstant();

  for (var i in position) {
    if (position.hasOwnProperty(i) !== true) continue;

    var squareId = SQUARE_ELS_IDS[i];
    $('#' + squareId).append(buildPiece(position[i]));
  }
};

var drawBoard = function() {
  boardEl.html(buildBoard(CURRENT_ORIENTATION));
  setPositionInstant(CURRENT_POSITION);
};

//------------------------------------------------------------------------------
// Animations
//------------------------------------------------------------------------------

var animateMove = function(src, dest, completeFn) {
  // get information about the source piece
  var sourcePieceCode = CURRENT_POSITION[src];
  var sourcePieceEl = $('#' + SQUARE_ELS_IDS[src] + ' img.' + CSS.piece);
  var sourcePiecePosition = sourcePieceEl.offset();

  // add an absolutely positioned piece for animation
  var animatedPieceId = createId();
  boardEl.append(buildPiece(sourcePieceCode, true, animatedPieceId));
  var animatedPieceEl = $('#' + animatedPieceId);
  animatedPieceEl.css({
    display: '',
    position: 'absolute',
    top: sourcePiecePosition.top,
    left: sourcePiecePosition.left
  });

  // remove the existing piece
  sourcePieceEl.remove();

  // get information about the destination square
  var destinationSquareEl = $('#' + SQUARE_ELS_IDS[dest]);
  var destinationSquarePosition = destinationSquareEl.offset();

  // animation complete
  var complete = function() {
    // remove any pieces on the target square
    destinationSquareEl.find('img.' + CSS.piece).remove();

    // add the destination piece to the square
    destinationSquareEl.append(buildPiece(sourcePieceCode));

    // remove the animation shim
    animatedPieceEl.remove();

    // run the complete function
    if (typeof completeFn === 'function') {
      completeFn(); 
    }
  };

  // animate the piece to the new square
  var opts = {
    duration: 'fast',
    complete: complete
  };
  animatedPieceEl.animate(destinationSquarePosition, opts);
};

var isSquareEmpty = function(square) {
  return (CURRENT_POSITION.hasOwnProperty(square) !== true ||
    CURRENT_POSITION[square] === '');
};

var animateAdd = function(square, piece) {
  if (isSquareEmpty(square) !== true) {

  }
};

var doAnimations = function(a) {
  var numFinished = 0;
  var onFinish = function() {
    numFinished++;
    if (numFinished === a.length) {
      CURRENT_POSITION = getPositionFromDom();
    }
  };

  for (var i = 0; i < a.length; i++) {
    // clear a piece
    if (a[i].type === 'clear') {
      $('#' + SQUARE_ELS_IDS[a[i].square] + ' img.' + CSS.piece).fadeOut('fast', function() {
        $(this).remove();
      });
    }

    // add a piece
    if (a[i].type === 'add') {

      $('#' + SQUARE_ELS_IDS[a[i].square] + ' img.' + CSS.piece).fadeOut('fast', function() {
        $(this).remove();
      });

      var square = a[i].square;
      $('#' + SQUARE_ELS_IDS[square]).append(buildPiece(a[i].piece, true))
        .find('img.' + CSS.piece).fadeIn('fast');
    }

    // move a piece
    if (a[i].type === 'move') {
      // do nothing if source and destination are the same
      // or if the source square is empty
      if (a[i].source === a[i].destination ||
          isSquareEmpty(a[i].source) === true) continue;

      animateMove(a[i].source, a[i].destination, onFinish);
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
  // TODO: is this necessary?
  //       I've been writing JS for nearly a decade; should probably learn the rules
  //       about deep / shallow copies by now...
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
        destination: i
      });

      delete pos1[closestPiece];
      delete pos2[i];
    }
  }

  // TODO: clear pieces

  // TODO: add pieces

  return animations;
};

var getPositionFromDom = function() {
  var position = {};
  for (var i in SQUARE_ELS_IDS) {
    if (SQUARE_ELS_IDS.hasOwnProperty(i) !== true) continue;

    var piece = $('#' + SQUARE_ELS_IDS[i] + ' img.' + CSS.piece);
    if (piece.length === 1) {
      position[i] = piece.attr('data-piece');
    }
  }
  return position;
};

var movePieces = function(movements) {
  var animations = [];

  for (var i in movements) {
    if (movements.hasOwnProperty(i) !== true) continue;

    // ignore if there is no piece on the source square
    if (isSquareEmpty(i) === true) continue;

    // create the animation
    animations.push({
      type: 'move',
      source: i,
      destination: movements[i]
    });
  }

  doAnimations(animations);

  /*
  var animations = [
    {
      type: 'clear',
      square: 'a1'
    },
    {
      type: 'clear',
      square: 'b2'
    },
    {
      type: 'add',
      square: 'a4',
      piece: 'bR'
    },
    {
      type: 'move',
      source: 'e2',
      destination: 'e4'
    },
    {
      type: 'move',
      source: 'f2',
      destination: 'e3'
    }    
  ];

  doAnimations(animations);
  */
};

var animateToPosition = function(newPosition) {
  var animations = calculateAnimations(CURRENT_POSITION, newPosition);
  doAnimations(animations);
};

//------------------------------------------------------------------------------
// Public Methods
//------------------------------------------------------------------------------

// clear the board
widget.clear = function(useAnimation) {
  CURRENT_POSITION = {};
  
  if (useAnimation === false) {
    clearBoardInstant();
  }
  else {
    clearBoardFade();
  }
};

// remove the widget from the page
widget.destroy = function() {
  
  // TODO: write me

};

// flip orientation
widget.flip = function() {
  widget.orientation('flip');
};

// move piece(s)
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

  // TODO: validate start object here

  movePieces(start);
};

widget.position = function(position, useAnimation) {
  // no arguments, return the current position
  if (arguments.length === 0) {
    return CURRENT_POSITION;
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
    animateToPosition(position);
  }
  else {
    CURRENT_POSITION = position;
    drawBoard();
  }
};

widget.orientation = function(whiteOrBlackOrFlip) {
  // no arguments, return the current orientation
  if (arguments.length === 0) {
    return CURRENT_ORIENTATION;
  }
  
  // set to white or black
  if (whiteOrBlackOrFlip === 'white' || whiteOrBlackOrFlip === 'black') {
    CURRENT_ORIENTATION = whiteOrBlackOrFlip;
    drawBoard();
  }

  // flip orientation
  if (whiteOrBlackOrFlip === 'flip') {
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
// Initialization
//------------------------------------------------------------------------------

var addEvents = function() {

  // TODO: prevent dragging of images on the board

  /*
  // NOTE: using delegate and bind here instead of $.on to
  // maintain compatibility with older jquery versions
  containerEl.bind('click', clickContainerElement);
  containerEl.delegate('input.autocomplete-input', 'keydown', keydownInput);
  containerEl.delegate('input.autocomplete-input', 'change keyup',
    updateInputWidth);
  containerEl.delegate('input.autocomplete-input', 'focus', focusInput);
  containerEl.delegate('input.autocomplete-input', 'blur', blurInput);
  containerEl.delegate('li.' + CSS.option, 'click', clickOption);
  containerEl.delegate('li.' + CSS.option, 'mouseover', mouseoverOption);
  containerEl.delegate('div.' + CSS.tokenGroup, 'click', clickTokenGroup);
  containerEl.delegate(
    'div.' + CSS.tokenGroup + ' span.' + CSS.removeTokenGroup,
    'click', clickRemoveTokenGroup);

  // catch all clicks on the page
  $('html').bind('click touchstart', clickPage);

  // catch global keydown
  $(window).bind('keydown', keydownWindow);
  */
};

var initDom = function() {
  CURRENT_SQUARE_SIZE = calculateSquareSize();

  // build the board
  containerEl.html(buildWidget());

  // grab elements in memory
  boardEl = containerEl.find('div.' + CSS.board);

  // load the initial position
  drawBoard();

  /*
  for (var i in SQUARE_ELS_IDS) {
    if (SQUARE_ELS_IDS.hasOwnProperty(i) !== true) continue;
    SQUARE_ELS[i] = 
  }
  */
};

var init = function() {
  if (sanityChecks() !== true) return;

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
//window.ChessBoard.FENToObj = FENToObj;
//window.ChessBoard.objToFEN = objToFEN;

})(); // end anonymous wrapper
