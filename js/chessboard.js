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

var START_POSITION_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR/w';

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

var CURRENT_ORIENTATION = 'white';
var CURRENT_POSITION = {};
var SQUARE_ELS = {};
var SQUARE_ELS_IDS = {};
var CURRENT_SQUARE_SIZE;

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

  // TODO: write me

  return false;

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

  // TODO: write me

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

  var html = '<div class="chessboard">' +
  '<div class="board" style="width: ' + boardWidth + 'px">' + 
  buildBoard() + '</div>' +
  '</div>'; // end .chessboard

  return html;
};

var buildSquare = function(color, size, notation) {

};

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
    html += '<div class="board-row">';
    for (var j = 0; j < 8; j++) {
      var square = alpha[j] + row;

      html += '<div class="square ' + squareColor + '" ' +
        'style="width: ' + squareSize + 'px; height: ' + squareSize + 'px" ' +
        'id="' + SQUARE_ELS_IDS[square] + '">';

      // alpha notation
      if ((orientation === 'white' && row === 1) || (orientation === 'black' && row === 8)) {
        html += '<div class="notation alpha">' + alpha[j] + '</div>';
      }

      // numeric notation
      if (j === 0) {
        html += '<div class="notation numeric">' + row + '</div>';
      }

      html += '</div>'; // end .square

      squareColor = (squareColor === 'white' ? 'black' : 'white');
    }
    html += '<div class="clearfix-9e28a5bb27"></div></div>';

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

var buildPiece = function(code) {
  var html = '<img src="img/pieces/wikipedia/' + code + '.png" ' +
  'alt="" ' +
  'data-piece="' + code + '" ' +
  'style="width: ' + CURRENT_SQUARE_SIZE + 'px; height: ' + CURRENT_SQUARE_SIZE + 'px" />';

  return html;
};

//------------------------------------------------------------------------------
// DOM Manipulation
//------------------------------------------------------------------------------

var clearBoardAnim = function() {
  boardEl.find('img').fadeOut('fast', function() {
    $(this).remove();
  });
};

var clearBoardInstant = function() {
  boardEl.find('img').remove();
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
// Public Methods
//------------------------------------------------------------------------------

// clear the board
widget.clear = function(useAnimation) {
  CURRENT_POSITION = {};
  
  if (useAnimation === false) {
    clearBoardInstant();
  }
  else {
    clearBoardAnim();
  }
};

// remove the widget from the page
widget.destroy = function() {
  
};

// flip orientation
widget.flip = function() {
  widget.orientation('flip');
};

// move piece(s)
widget.move = function(start, end) {

};

widget.position = function(position) {
  // no arguments, return the current position
  if (arguments.length === 0) {
    return CURRENT_POSITION;
  }

  // set the start position
  if (position === 'start') {
    CURRENT_POSITION = START_POSITION;
    drawBoard();
  }

  // FEN string
  if (validFEN(position) === true) {
    CURRENT_POSITION = FENToObj(position);
    drawBoard();
  }

  // position object
  if (validPositionObject(position) === true) {
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
  widget.position('start');
};

//------------------------------------------------------------------------------
// Initialization
//------------------------------------------------------------------------------

var addEvents = function() {
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
  boardEl = containerEl.find('div.board');

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
