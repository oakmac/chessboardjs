/// <reference lib="es2021" />
/* eslint-env browser */

import * as pieces from './pieces.svg.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLUMNS = 'abcdefgh'.split('');
const DEFAULT_DRAG_THROTTLE_RATE = 20;
const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
const START_POSITION = fenToObj(START_FEN);

// default animation speeds
const DEFAULT_APPEAR_SPEED = 200;
const DEFAULT_MOVE_SPEED = 200;
const DEFAULT_SNAPBACK_SPEED = 60;
const DEFAULT_SNAP_SPEED = 30;
const DEFAULT_TRASH_SPEED = 100;

// use unique class names to prevent clashing with anything else on the page
// and simplify selectors
// NOTE: these should never change
const ClassNameLookup = {
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
  sparePieces: 'spare-pieces-7492f',
  sparePiecesBottom: 'spare-pieces-bottom-ae20f',
  sparePiecesTop: 'spare-pieces-top-4028b',
  square: 'square-55d63',
  white: 'white-1e1d7'
};

// ---------------------------------------------------------------------------
// Misc Utils
// ---------------------------------------------------------------------------

function throttle(f, interval) {
  let timeout = 0;
  let shouldFire = false;
  let args = [];

  const handleTimeout = function () {
    timeout = 0;
    if (shouldFire) {
      shouldFire = false;
      fire();
    }
  };

  const fire = function () {
    timeout = window.setTimeout(handleTimeout, interval);
    f(args);
  };

  return function (..._args) {
    args = _args;
    if (!timeout) {
      fire();
    } else {
      shouldFire = true;
    }
  };
}

function uuid() {
  return 'xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function () {
    const r = (Math.random() * 16) | 0;
    return r.toString(16);
  });
}

/**
 *
 * @param {HTMLElement} element
 * @returns {{ top: number, left: number }}
 */
function getJqueryStyleOffset(element) {
  const { documentElement: { clientTop, clientLeft } } = document;
  const { x, y } = element.getBoundingClientRect();
  return {
    top: y + scrollY - clientTop,
    left: x + scrollX - clientLeft
  };
}

function isPlainObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}


function isTouchDevice() {
  return 'ontouchstart' in document.documentElement;
}

// ---------------------------------------------------------------------------
// Chess Utils
// ---------------------------------------------------------------------------

function validMove(move) {
  // move should be a string
  if (typeof move !== 'string') return false;

  // move should be in the form of "e2-e4", "f6-d5"
  const squares = move.split('-');
  if (squares.length !== 2) return false;

  const [start, end] = squares;
  return validSquare(start) && validSquare(end);
}

function validSquare(square) {
  return typeof square === 'string' && square.search(/^[a-h][1-8]$/) !== -1;
}

function validPieceCode(code) {
  return typeof code === 'string' && code.search(/^[bw][KQRNBP]$/) !== -1;
}

/**
 *
 * @param {string} [fen]
 * @returns {boolean}
 */
function validFen(fen) {
  if (typeof fen !== 'string') return false;

  // cut off any move, castling, etc info from the end
  // we're only interested in position information
  fen = fen.replace(/ .+$/, '');

  // expand the empty square numbers to just 1s
  fen = expandFenEmptySquares(fen);

  // FEN should be 8 sections separated by slashes
  const chunks = fen.split('/');
  if (chunks.length !== 8) return false;

  // check each section
  for (let i = 0; i < 8; i++) {
    if (chunks[i].length !== 8 ||
      chunks[i].search(/[^kqrnbpKQRNBP1]/) !== -1) {
      return false;
    }
  }

  return true;
}

function validPositionObject(pos) {
  if (!isPlainObject(pos)) return false;

  for (const i in pos) {
    if (!Object.prototype.hasOwnProperty.call(pos, i)) continue;

    if (!validSquare(i) || !validPieceCode(pos[i])) {
      return false;
    }
  }

  return true;
}

// convert FEN piece code to bP, wK, etc
function fenToPieceCode(piece) {
  // black piece
  if (piece.toLowerCase() === piece) {
    return 'b' + piece.toUpperCase();
  }

  // white piece
  return 'w' + piece.toUpperCase();
}

// convert bP, wK, etc code to FEN structure
function pieceCodeToFen(piece) {
  const pieceCodeLetters = piece.split('');

  // white piece
  if (pieceCodeLetters[0] === 'w') {
    return pieceCodeLetters[1].toUpperCase();
  }

  // black piece
  return pieceCodeLetters[1].toLowerCase();
}

/**
 * Convert FEN string to position object. Returns `false` if the FEN string is invalid
 * @param {string} [fen]
 * @returns {false | { [x: string]: string; }}
 */
function fenToObj(fen) {
  if (!fen || !validFen(fen)) return false;

  // cut off any move, castling, etc info from the end
  // we're only interested in position information
  fen = fen.replace(/ .+$/, '');

  const rows = fen.split('/');
  const position = /** @type {{ [x: string]: string; }} */({});

  let currentRow = 8;
  for (let i = 0; i < 8; i++) {
    const row = rows[i].split('');
    let colIdx = 0;

    // loop through each character in the FEN section
    for (let j = 0; j < row.length; j++) {
      // number / empty squares
      if (row[j].search(/[1-8]/) !== -1) {
        const numEmptySquares = parseInt(row[j], 10);
        colIdx = colIdx + numEmptySquares;
      } else {
        // piece
        const square = COLUMNS[colIdx] + currentRow;
        position[square] = fenToPieceCode(row[j]);
        colIdx = colIdx + 1;
      }
    }

    currentRow = currentRow - 1;
  }

  return position;
}

/**
 * Converts position object to FEN string. Returns false if the obj is not a valid position object
 * @param {object} obj
 * @returns {false | string}
 */
function objToFen(obj) {
  if (!validPositionObject(obj)) return false;

  let fen = '';

  let currentRow = 8;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const square = COLUMNS[j] + currentRow;

      // piece exists
      if (Object.prototype.hasOwnProperty.call(obj, square)) {
        fen = fen + pieceCodeToFen(obj[square]);
      } else {
        // empty space
        fen = fen + '1';
      }
    }

    if (i !== 7) {
      fen = fen + '/';
    }

    currentRow = currentRow - 1;
  }

  // squeeze the empty numbers together
  fen = squeezeFenEmptySquares(fen);

  return fen;
}

/**
 * @param {string} fen
 * @returns {string}
 */
function squeezeFenEmptySquares(fen) {
  return fen.replace(/11111111/g, '8')
    .replace(/1111111/g, '7')
    .replace(/111111/g, '6')
    .replace(/11111/g, '5')
    .replace(/1111/g, '4')
    .replace(/111/g, '3')
    .replace(/11/g, '2');
}

/**
 * @param {string} fen
 * @returns {string}
 */
function expandFenEmptySquares(fen) {
  return fen.replace(/8/g, '11111111')
    .replace(/7/g, '1111111')
    .replace(/6/g, '111111')
    .replace(/5/g, '11111')
    .replace(/4/g, '1111')
    .replace(/3/g, '111')
    .replace(/2/g, '11');
}

// returns the distance between two squares
function squareDistance(squareA, squareB) {
  const squareAArray = squareA.split('');
  const squareAx = COLUMNS.indexOf(squareAArray[0]) + 1;
  const squareAy = parseInt(squareAArray[1], 10);

  const squareBArray = squareB.split('');
  const squareBx = COLUMNS.indexOf(squareBArray[0]) + 1;
  const squareBy = parseInt(squareBArray[1], 10);

  const xDelta = Math.abs(squareAx - squareBx);
  const yDelta = Math.abs(squareAy - squareBy);

  if (xDelta >= yDelta) return xDelta;
  return yDelta;
}

// returns the square of the closest instance of piece
// returns false if no instance of piece is found in position
function findClosestPiece(position, piece, square) {
  // create array of closest squares from square
  const closestSquares = createRadius(square);

  // search through the position in order of distance for the piece
  for (let i = 0; i < closestSquares.length; i++) {
    const s = closestSquares[i];

    if (Object.prototype.hasOwnProperty.call(position, s) && position[s] === piece) {
      return s;
    }
  }

  return false;
}

// returns an array of closest squares from square
function createRadius(square) {
  const squares = [];

  // calculate distance of all squares
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const s = COLUMNS[i] + (j + 1);

      // skip the square we're starting from
      if (square === s) continue;

      squares.push({
        square: s,
        distance: squareDistance(square, s)
      });
    }
  }

  // sort by distance
  squares.sort(function (a, b) {
    return a.distance - b.distance;
  });

  // just return the square code
  const surroundingSquares = [];
  for (let i = 0; i < squares.length; i++) {
    surroundingSquares.push(squares[i].square);
  }

  return surroundingSquares;
}

// given a position and a set of moves, return a new position
// with the moves executed
function calculatePositionFromMoves(position, moves) {
  const newPosition = { ...position };

  for (const i in moves) {
    if (!Object.prototype.hasOwnProperty.call(moves, i)) continue;

    // skip the move if the position doesn't have a piece on the source square
    if (!Object.prototype.hasOwnProperty.call(newPosition, i)) continue;

    const piece = newPosition[i];
    delete newPosition[i];
    newPosition[moves[i]] = piece;
  }

  return newPosition;
}

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

class Chessboard {
  static pieces = pieces;
  static fenToObj = fenToObj;
  static objToFen = objToFen;

  /**
   * @typedef {object} ChessboardConfig
   * @property {number} appearSpeed
   * @property {number} dragThrottleRate
   * @property {number} moveSpeed
   * @property {number} snapbackSpeed
   * @property {number} snapSpeed
   * @property {number} trashSpeed
   * @property {boolean} draggable
   * @property {boolean} showNotation
   * @property {string | boolean} sparePieces
   * @property {'snapback' | 'trash'} dropOffBoard
   * @property {'white' | 'black'} orientation
   * @property {string | ((x: string) => string)} pieceTheme
   * @property {(x: object, y: object) => void} [onChange]
   * @property {(x: string, y: string, z: string, w: HTMLElement, r: object, s: 'white' | 'black') => void} [onDragMove]
   * @property {(x: string | null | undefined, y: boolean, z: object, o: 'white' | 'black') => boolean} [onDragStart]
   * @property {(x: string, y: any, z: HTMLElement, w: object, r: object, s: 'white' | 'black') => 'snapback' | 'trash'} [onDrop]
   * @property {(x: string | null | undefined, y: boolean, z: object, o: 'white' | 'black') => void} [onMouseoutSquare]
   * @property {(x: string | null | undefined, y: boolean, z: object, o: 'white' | 'black') => void} [onMouseoverSquare]
   * @property {(x: object, y: object) => void} [onMoveEnd]
   * @property {(e: HTMLElement, s: string, x: object, o: 'white' | 'black') => void} [onSnapbackEnd]
   * @property {(x: string, y: any, z: HTMLElement) => void} onSnapEnd
   * @property {string | { [x: string]: string }} position
   * @property {'alert' | 'console' | boolean | ((x: string, y: any, z: HTMLElement) => void)} showErrors
   */
  #config = /** @type {ChessboardConfig} */ ({
    showErrors: 'alert' // default value only used in constructor prior to user config assignment
  });

  /**
   * @type {HTMLElement}
   */
  #board;
  /**
   * @type {HTMLElement}
   */
  #container;
  /**
   * @type {HTMLElement}
   */
  #draggedPiece;
  /**
   * @type {HTMLElement}
   */
  #sparePiecesTop;
  /**
   * @type {HTMLElement}
   */
  #sparePiecesBottom;
  /**
   * @type {number}
   */
  #boardBorderSize = 2;
  /**
   * @type {'white' | 'black'}
   */
  #currentOrientation = 'white';
  #currentPosition = {};
  /**
   * @type {string}
   */
  #draggedPieceLocation = '';
  /**
   * @type {string}
   */
  #draggedPieceSource = '';
  /**
   * @type {boolean}
   */
  #isDragging = false;
  #sparePiecesElsIds = {};
  #squareElsIds = {};
  #squareElsOffsets = {};
  /**
   * @type {number}
   */
  #squareSize = 16;

  get currentPosition() {
    return { ...this.#currentPosition };
  }

  /**
   *
   * @param {string | HTMLElement} containerElOrString
   * @param {string | Partial<ChessboardConfig>} config
   * @returns
   */
  constructor(containerElOrString, config) {
    // first things first: check basic dependencies
    if (containerElOrString === '') {
      this.#error(1001, 'The first argument to new Chessboard() cannot be an empty string.\n\nExiting…');
      return;
    }

    if (containerElOrString instanceof HTMLElement) {
      this.#container = containerElOrString;
    } else if (typeof containerElOrString === 'string') {
      // convert containerEl to query selector if it is a string
      if (containerElOrString.startsWith('#') === false) {
        containerElOrString = `#${containerElOrString}`;
      }

      // containerEl must be something that becomes a NodeList of size 1
      const container = /** @type {NodeListOf<HTMLElement>} */(document.querySelectorAll(containerElOrString));
      if (container.length !== 1) {
        this.#error(1003, 'The first argument to new Chessboard() must be the ID of a DOM node, an ID query selector, or a single DOM node.\n\nExiting…');
        return;
      }

      this.#container = container.item(0);
    } else {
      this.#error(1003, 'The first argument to new Chessboard() must be the ID of a DOM node, an ID query selector, or a single DOM node.\n\nExiting…');
      return;
    }

    // ensure the config object is what we expect
    if (typeof config === 'string') {
      if (config === 'start') {
        config = { position: { ...START_POSITION } };
      } else if (validFen(config)) {
        config = { position: fenToObj(config) || {} };
      } else {
        config = {};
      }
    } else if (validPositionObject(config)) {
      config = { position: { .../** @type {{ [x: string]: string; }} */(config) } };
    } else if (!isPlainObject(config)) {
      config = {};
    }

    if (config.orientation !== 'black') config.orientation = 'white';
    if (config.showNotation !== false) config.showNotation = true;
    if (config.draggable !== true) config.draggable = false;
    if (config.dropOffBoard !== 'trash') config.dropOffBoard = 'snapback';
    if (config.sparePieces !== true) config.sparePieces = false;
    if (config.sparePieces) config.draggable = true; // draggable must be true if sparePieces is enabled

    // default piece theme is built-in svg
    if (!Object.prototype.hasOwnProperty.call(config, 'pieceTheme') ||
      (typeof config.pieceTheme !== 'string' && typeof config.pieceTheme !== 'function')) {
      config.pieceTheme = '{piece}';
    }

    const validThrottleRate = (rate) => Number.isInteger(rate) && rate >= 1;
    const validAnimationSpeed = (speed) =>
      (speed === 'fast' || speed === 'slow') || (Number.isInteger(speed) && speed >= 0);

    // throttle rate
    if (!validThrottleRate(config.dragThrottleRate)) config.dragThrottleRate = DEFAULT_DRAG_THROTTLE_RATE;

    // animation speeds
    if (!validAnimationSpeed(config.appearSpeed)) config.appearSpeed = DEFAULT_APPEAR_SPEED;
    if (!validAnimationSpeed(config.moveSpeed)) config.moveSpeed = DEFAULT_MOVE_SPEED;
    if (!validAnimationSpeed(config.snapbackSpeed)) config.snapbackSpeed = DEFAULT_SNAPBACK_SPEED;
    if (!validAnimationSpeed(config.snapSpeed)) config.snapSpeed = DEFAULT_SNAP_SPEED;
    if (!validAnimationSpeed(config.trashSpeed)) config.trashSpeed = DEFAULT_TRASH_SPEED;

    // make sure position is valid
    if (config.position != null) {
      if (typeof config.position === 'string') {
        if (config.position === 'start') {
          this.#currentPosition = { ...START_POSITION };
        } else if (validFen(config.position)) {
          this.#currentPosition = fenToObj(config.position);
        }
      } else if (validPositionObject(config.position)) {
        this.#currentPosition = { ...config.position };
      } else {
        this.#error(
          7263,
          'Invalid value passed to config.position.',
          config.position
        );
      }
    }

    this.#config = /** @type {ChessboardConfig} */(config);
    this.#currentOrientation = this.#config.orientation;


    /**
     * Create unique IDs for all our elements
     * */

    // squares on the board
    for (let i = 0; i < COLUMNS.length; i++) {
      for (let j = 1; j <= 8; j++) {
        const square = COLUMNS[i] + j;
        this.#squareElsIds[square] = square + '-' + uuid();
      }
    }

    // spare pieces
    const pieces = 'KQRNBP'.split('');
    for (let i = 0; i < pieces.length; i++) {
      const whitePiece = 'w' + pieces[i];
      const blackPiece = 'b' + pieces[i];
      this.#sparePiecesElsIds[whitePiece] = whitePiece + '-' + uuid();
      this.#sparePiecesElsIds[blackPiece] = blackPiece + '-' + uuid();
    }

    // build board and save it in memory
    this.#board = document.createElement('div');
    this.#board.classList.add(ClassNameLookup.board);

    this.#sparePiecesTop = document.createElement('div');
    this.#sparePiecesTop.classList.add(ClassNameLookup.sparePieces, ClassNameLookup.sparePiecesTop);
    this.#sparePiecesBottom = document.createElement('div');
    this.#sparePiecesBottom.classList.add(ClassNameLookup.sparePieces, ClassNameLookup.sparePiecesBottom);

    this.#container.replaceChildren(this.#drawChessboard());

    // create the drag piece
    this.#draggedPiece = document.body.appendChild(
      this.#buildPiece('wP', true, uuid())
    );

    // TODO: need to remove this dragged piece element if the board is no
    // longer in the DOM

    // get the border size
    this.#boardBorderSize = parseInt(this.#board.style.getPropertyValue('borderLeftWidth'), 10);

    // set the size and draw the board
    this.resize();

    this.#addEvents();
  }

  // clear the board
  clear(useAnimation) {
    this.position('clear', useAnimation);
  }

  // remove the widget from the page
  destroy() {
    // remove markup
    this.#container.replaceChildren();
    this.#draggedPiece.remove();

    // remove event handlers
    this.#container.onmousedown = null;
  }

  // shorthand method to get the current FEN
  fen() {
    return this.position('fen');
  }

  // flip orientation
  flip() {
    return this.orientation('flip');
  }

  // move pieces
  // TODO: this method should be variadic as well as accept an array of moves
  move(...args) {
    // no need to throw an error here; just do nothing
    // TODO: this should return the current position
    if (args.length === 0) return;

    let useAnimation = true;

    // collect the moves into an object
    const moves = {};
    for (let i = 0; i < args.length; i++) {
      // any "false" to this function means no animations
      if (args[i] === false) {
        useAnimation = false;
        continue;
      }

      // skip invalid arguments
      if (!validMove(args[i])) {
        this.#error(2826, 'Invalid move passed to the move method.', args[i]);
        continue;
      }

      const tmp = args[i].split('-');
      moves[tmp[0]] = tmp[1];
    }

    // calculate position from moves
    const newPos = calculatePositionFromMoves(this.#currentPosition, moves);

    // update the board
    this.position(newPos, useAnimation);

    // return the new position object
    return newPos;
  }

  /**
   * @param {string} [orientation]
   * @returns
   */
  orientation(orientation) {
    if (!orientation) {
      return this.#currentOrientation;
    } else if (orientation === 'white' || orientation === 'black') {
      this.#currentOrientation = orientation;
    } else if (orientation === 'flip') {
      this.#currentOrientation = this.#currentOrientation === 'white' ? 'black' : 'white';
    } else {
      this.#error(5482, 'Invalid value passed to the orientation method.', orientation);
    }

    this.#drawBoard();
    this.#drawPositionInstant();

    return this.#currentOrientation;
  }

  position(position, useAnimation) {
    if (!position) {
      return this.currentPosition;
    }

    const positionIsString = typeof position === 'string';

    if (positionIsString) {
      const positionLowerCase = position.toLowerCase();

      if (positionLowerCase === 'fen') {
        // get position as FEN
        return objToFen(this.#currentPosition);
      }
      if (positionLowerCase === 'start') {
        // start position
        position = { ...START_POSITION };
      }
      if (positionLowerCase === 'clear') {
        this.#clearPieces();
        position = {};
      }
    }

    // convert FEN to position object
    if (validFen(position)) {
      position = fenToObj(position);
    }

    // validate position object
    if (!validPositionObject(position)) {
      this.#error(6482, 'Invalid value passed to the position method.', position);
      return;
    }

    // default for useAnimations is true
    if (useAnimation !== false) useAnimation = true;

    if (useAnimation) {
      // start the animations
      const animations = this.#calculateAnimations(this.#currentPosition, position);
      this.#doAnimations(animations, this.#currentPosition, position);

      // set the new position
      this.#setCurrentPosition(position);
    } else {
      // instant update
      this.#setCurrentPosition(position);
      this.#drawPositionInstant();
    }
  }

  resize() {
    // calulate the new square size
    this.#squareSize = this.#calculateSquareSize();

    // set board width
    this.#board.style.setProperty('width', `${this.#squareSize * 8}px`);

    // set drag piece size
    this.#draggedPiece?.style.setProperty('height', `${this.#squareSize}px`);
    this.#draggedPiece?.style.setProperty('width', `${this.#squareSize}px`);

    // spare pieces
    if (this.#config.sparePieces) {
      /** @type {NodeListOf<HTMLElement>} */(
        this.#container.querySelectorAll('.' + ClassNameLookup.sparePieces)
      )
        .forEach(x => {
          const paddingLeft = this.#squareSize + this.#boardBorderSize;
          x.style.setProperty('paddingLeft', `${paddingLeft}px`);
        });
    }

    // redraw the board
    this.#drawBoard();
    this.#drawPositionInstant();
  }

  /**
   * Set the starting position
   * @param {*} useAnimation
   */
  start(useAnimation) {
    this.position('start', useAnimation);
  }

  #dropDraggedPieceOnSquare(square) {
    this.#removeSquareHighlights();

    // update position
    const newPosition = this.currentPosition;
    delete newPosition[this.#draggedPieceSource];
    newPosition[square] = this.#draggedPiece;
    this.#setCurrentPosition(newPosition);

    // get target square information
    const targetSquareId = this.#squareElsIds[square];
    const targetSquare = document.getElementById(targetSquareId);
    if (!targetSquare) {
      throw new Error(`Unable to locate target square with id ${targetSquareId}`);
    }
    const targetSquarePosition = getJqueryStyleOffset(targetSquare);

    // snap the piece to the target square
    const opts = {
      duration: this.#config.snapSpeed,
      complete: () => {
        this.#drawPositionInstant();
        this.#draggedPiece.style.setProperty('display', 'none');

        // execute their onSnapEnd function
        if (typeof this.#config.onSnapEnd === 'function') {
          this.#config.onSnapEnd(this.#draggedPieceSource, square, this.#draggedPiece);
        }
      }
    };
    this.#draggedPiece.animate(targetSquarePosition, opts);

    // set state
    this.#isDragging = false;
  }

  #error(code, msg, obj) {
    // do nothing if showErrors is not set
    if (
      Object.prototype.hasOwnProperty.call(this.#config, 'showErrors') !== true ||
      this.#config.showErrors === false
    ) {
      return;
    }

    let errorText = 'Chessboard Error ' + code + ': ' + msg;

    // print to console
    if (
      this.#config.showErrors === 'console' &&
      typeof console === 'object' &&
      typeof console.log === 'function'
    ) {
      console.log(errorText);
      if (obj) {
        console.log(obj);
      }
      return;
    }

    // alert errors
    if (this.#config.showErrors === 'alert') {
      if (obj) {
        errorText += '\n\n' + JSON.stringify(obj);
      }
      window.alert(errorText);
      return;
    }

    // custom function
    if (typeof this.#config.showErrors === 'function') {
      this.#config.showErrors(code, msg, obj);
    }
  }

  #buildPieceImgSrc(piece) {
    if (typeof this.#config.pieceTheme === 'function') {
      return this.#config.pieceTheme(piece);
    }

    if (typeof this.#config.pieceTheme === 'string') {
      return this.#config.pieceTheme.replaceAll('{piece}', piece);
    }

    // NOTE: this should never happen
    this.#error(8272, 'Unable to build image source for config.pieceTheme.');
    return '';
  }

  #buildPiece(piece, hidden, id) {
    const pieceEl = new Image(this.#squareSize, this.#squareSize);
    const src = this.#buildPieceImgSrc(piece);

    pieceEl.src = src === piece ? pieces[src] : src;
    pieceEl.alt = '';
    pieceEl.classList.add(ClassNameLookup.piece);
    pieceEl.dataset.piece = piece;

    if (typeof id === 'string' && id.length > 0) {
      pieceEl.id = id;
    }

    if (hidden) {
      pieceEl.style.setProperty('display', 'none');
    }

    return pieceEl;
  }

  #buildSparePieces(color) {
    const pieces = color === 'white'
      ? ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP']
      : ['bK', 'bQ', 'bR', 'bB', 'bN', 'bP'];

    return pieces.map(x => this.#buildPiece(x, false, this.#sparePiecesElsIds[x]));
  }

  #animateSquareToSquare(src, dest, piece, completeFn) {
    // get information about the source and destination squares
    const srcSquare = document.getElementById(this.#squareElsIds[src]);
    const destSquare = document.getElementById(this.#squareElsIds[dest]);
    if (!srcSquare) {
      throw new Error(`Unable to locate source square with id ${this.#squareElsIds[src]}`);
    }
    if (!destSquare) {
      throw new Error(`Unable to locate destination square with id ${this.#squareElsIds[dest]}`);
    }

    // create the animated piece and absolutely position it
    // over the source square
    const animatedPiece = document.body.appendChild(this.#buildPiece(piece, true, uuid()));
    animatedPiece.style.setProperty('display', '');
    animatedPiece.style.setProperty('position', 'absolute');

    // remove original piece from source square
    srcSquare.querySelector(`.${ClassNameLookup.piece}`)?.remove();

    const pieceEl = this.#buildPiece(piece);
    // animate the piece to the destination square
    const animation = animatedPiece.animate([
      getJqueryStyleOffset(srcSquare),
      getJqueryStyleOffset(destSquare)
    ], this.#config.moveSpeed);
    animation.onfinish = () => {
      // remove the animated piece
      animatedPiece.remove();
      // add the "real" piece to the destination square
      destSquare.querySelector(`.${ClassNameLookup.piece}`)?.remove();
      destSquare.appendChild(pieceEl);

      // run complete function
      if (typeof completeFn === 'function') {
        completeFn();
      }
    };
  }

  #animateSparePieceToSquare(piece, dest, completeFn) {
    const srcSquare = document.getElementById(this.#sparePiecesElsIds[piece]);
    const destSquare = document.getElementById(this.#squareElsIds[dest]);
    if (!srcSquare) {
      throw new Error(`Unable to locate source square with id ${this.#squareElsIds[piece]}`);
    }
    if (!destSquare) {
      throw new Error(`Unable to locate destination square with id ${this.#squareElsIds[dest]}`);
    }

    // create the animate piece
    const pieceEl = document.body.appendChild(this.#buildPiece(piece));
    pieceEl.style.setProperty('position', 'absolute');

    // animate the piece to the destination square
    pieceEl
      .animate(
        [getJqueryStyleOffset(srcSquare), getJqueryStyleOffset(destSquare)],
        this.#config.moveSpeed
      )
      .onfinish = () => {
        pieceEl.style.removeProperty('position');
        destSquare.querySelector(`.${ClassNameLookup.piece}`)?.remove();
        destSquare.appendChild(pieceEl);

        // run complete function
        if (typeof completeFn === 'function') {
          completeFn();
        }
      };
  }

  // execute an array of animations
  #doAnimations(animations, oldPos, newPos) {
    if (animations.length === 0) return;

    let numFinished = 0;
    const onFinishAnimation3 = () => {
      // exit if all the animations aren't finished
      numFinished = numFinished + 1;
      if (numFinished !== animations.length) return;

      // this.#drawPositionInstant();

      // run their onMoveEnd function
      if (typeof this.#config.onMoveEnd === 'function') {
        this.#config.onMoveEnd({ ...oldPos }, { ...newPos });
      }
    };

    for (let i = 0; i < animations.length; i++) {
      const animation = animations[i];

      // clear a piece
      if (animation.type === 'clear') {
        document.querySelectorAll(`#${this.#squareElsIds[animation.square]} .${ClassNameLookup.piece}`)
          .forEach(x => {
            const animation = x.animate([{ opacity: 1 }, { opacity: 0 }], this.#config.trashSpeed);
            animation.onfinish = onFinishAnimation3;
          });

        // add a piece with no spare pieces - fade the piece onto the square
      } else if (animation.type === 'add' && !this.#config.sparePieces) {
        const element = document.getElementById(this.#squareElsIds[animation.square]);
        if (element) {
          element.append(this.#buildPiece(animation.piece, true));
          element.querySelectorAll(`.${ClassNameLookup.piece}`)
            .forEach(x => {
              const animation = x.animate([{ opacity: 0 }, { opacity: 1 }], this.#config.appearSpeed);
              animation.onfinish = onFinishAnimation3;
            });
        }

        // add a piece with spare pieces - animate from the spares
      } else if (animation.type === 'add' && this.#config.sparePieces) {
        this.#animateSparePieceToSquare(animation.piece, animation.square, onFinishAnimation3);

        // move a piece from squareA to squareB
      } else if (animation.type === 'move') {
        this.#animateSquareToSquare(animation.source, animation.destination, animation.piece, onFinishAnimation3);
      }
    }
  }

  // calculate an array of animations that need to happen in order to get
  // from pos1 to pos2
  #calculateAnimations(pos1, pos2) {
    // make copies of both
    pos1 = { ...pos1 };
    pos2 = { ...pos2 };

    const animations = [];
    const squaresMovedTo = {};

    // remove pieces that are the same in both positions
    for (const i in pos2) {
      if (!Object.prototype.hasOwnProperty.call(pos2, i)) continue;

      if (Object.prototype.hasOwnProperty.call(pos1, i) && pos1[i] === pos2[i]) {
        delete pos1[i];
        delete pos2[i];
      }
    }

    // find all the "move" animations
    for (const i in pos2) {
      if (!Object.prototype.hasOwnProperty.call(pos2, i)) continue;

      const closestPiece = findClosestPiece(pos1, pos2[i], i);
      if (closestPiece) {
        animations.push({
          type: 'move',
          source: closestPiece,
          destination: i,
          piece: pos2[i]
        });

        delete pos1[closestPiece];
        delete pos2[i];
        squaresMovedTo[i] = true;
      }
    }

    // "add" animations
    for (const i in pos2) {
      if (!Object.prototype.hasOwnProperty.call(pos2, i)) continue;

      animations.push({
        type: 'add',
        square: i,
        piece: pos2[i]
      });

      delete pos2[i];
    }

    // "clear" animations
    for (const i in pos1) {
      if (!Object.prototype.hasOwnProperty.call(pos1, i)) continue;

      // do not clear a piece if it is on a square that is the result
      // of a "move", ie: a piece capture
      if (Object.prototype.hasOwnProperty.call(squaresMovedTo, i)) continue;

      animations.push({
        type: 'clear',
        square: i,
        piece: pos1[i]
      });

      delete pos1[i];
    }

    return animations;
  }

  // -------------------------------------------------------------------------
  // Control Flow
  // -------------------------------------------------------------------------
  #clearPieces() {
    this.#board.querySelectorAll(`.${ClassNameLookup.piece}`)
      .forEach(x => {
        const animation = x.animate([{ opacity: 1 }, { opacity: 0 }], this.#config.trashSpeed);
        animation.onfinish = () => x.remove();
      });
  }

  #drawPositionInstant() {
    this.#clearPieces();

    for (const i in this.#currentPosition) {
      if (!Object.prototype.hasOwnProperty.call(this.#currentPosition, i)) continue;

      document.getElementById(this.#squareElsIds[i])?.append(this.#buildPiece(this.#currentPosition[i]));
    }
  }

  #drawChessboard() {
    const chessboard = document.createElement('div');
    chessboard.classList.add(ClassNameLookup.chessboard);

    if (this.#config.sparePieces) {
      chessboard.appendChild(this.#sparePiecesTop);
      chessboard.appendChild(this.#board);
      chessboard.appendChild(this.#sparePiecesBottom);
    } else {
      chessboard.appendChild(this.#board);
    }

    return chessboard;
  }

  #drawBoard() {
    // algebraic notation / orientation
    const alpha = COLUMNS.slice();
    let currentRow = 8;
    if (this.#currentOrientation === 'black') {
      alpha.reverse();
      currentRow = 1;
    }

    const board = document.createElement('div');

    let squareColor = 'white';
    for (let i = 0; i < 8; i++) {
      const row = document.createElement('row');
      row.classList.add(ClassNameLookup.row);

      for (let j = 0; j < 8; j++) {
        const squareName = alpha[j] + currentRow;
        const square = document.createElement('div');
        square.id = this.#squareElsIds[squareName];
        square.dataset.square = squareName;
        square.classList.add(ClassNameLookup.square, ClassNameLookup[squareColor], `square-${squareName}`);
        square.style.setProperty('height', `${this.#squareSize}px`);
        square.style.setProperty('width', `${this.#squareSize}px`);

        if (this.#config.showNotation) {
          // alpha notation
          if ((this.#currentOrientation === 'white' && currentRow === 1) ||
            (this.#currentOrientation === 'black' && currentRow === 8)) {
            const notation = document.createElement('div');
            notation.classList.add(ClassNameLookup.notation, ClassNameLookup.alpha);
            notation.innerText = alpha[j];
            square.appendChild(notation);
          }

          // numeric notation
          if (j === 0) {
            const notation = document.createElement('div');
            notation.classList.add(ClassNameLookup.notation, ClassNameLookup.numeric);
            notation.innerText = currentRow.toString();
            square.appendChild(notation);
          }
        }

        row.appendChild(square);
        squareColor = (squareColor === 'white') ? 'black' : 'white';
      }

      const clearfix = document.createElement('div');
      clearfix.classList.add(ClassNameLookup.clearfix);

      row.appendChild(clearfix);
      board.appendChild(row);

      squareColor = (squareColor === 'white') ? 'black' : 'white';

      if (this.#currentOrientation === 'white') {
        currentRow = currentRow - 1;
      } else {
        currentRow = currentRow + 1;
      }
    }

    this.#board.replaceChildren(...board.children);

    if (this.#config.sparePieces) {
      const spareBlackPieces = this.#buildSparePieces('black');
      const spareWhitePieces = this.#buildSparePieces('white');
      if (this.#currentOrientation === 'white') {
        this.#sparePiecesTop.replaceChildren(...spareBlackPieces);
        this.#sparePiecesBottom.replaceChildren(...spareWhitePieces);
      } else {
        this.#sparePiecesTop.replaceChildren(...spareWhitePieces);
        this.#sparePiecesBottom.replaceChildren(...spareBlackPieces);
      }
    }
  }

  #setCurrentPosition(position) {
    const oldPos = this.currentPosition;
    const newPos = { ...position };
    const oldFen = objToFen(oldPos);
    const newFen = objToFen(newPos);

    // do nothing if no change in position
    if (oldFen === newFen) return;

    // run their onChange function
    if (typeof this.#config.onChange === 'function') {
      this.#config.onChange(oldPos, newPos);
    }

    // update state
    this.#currentPosition = position;
  }

  #isXYOnSquare(x, y) {
    for (const i in this.#squareElsOffsets) {
      if (!Object.prototype.hasOwnProperty.call(this.#squareElsOffsets, i)) continue;

      const s = this.#squareElsOffsets[i];
      if (x >= s.left &&
        x < s.left + this.#squareSize &&
        y >= s.top &&
        y < s.top + this.#squareSize) {
        return i;
      }
    }

    return 'offboard';
  }

  // records the XY coords of every square into memory
  #captureSquareOffsets() {
    this.#squareElsOffsets = {};

    for (const i in this.#squareElsIds) {
      if (!Object.prototype.hasOwnProperty.call(this.#squareElsIds, i)) continue;

      const element = document.getElementById(this.#squareElsIds[i]);

      if (!element) continue;

      this.#squareElsOffsets[i] = getJqueryStyleOffset(element);
    }
  }

  #removeSquareHighlights() {
    this.#board.querySelectorAll('.' + ClassNameLookup.square).forEach(x => {
      x.classList.remove(ClassNameLookup.highlight1);
      x.classList.remove(ClassNameLookup.highlight2);
    });
  }

  #snapbackDraggedPiece() {
    // there is no "snapback" for spare pieces
    if (this.#draggedPieceSource === 'spare') {
      this.#trashDraggedPiece();
      return;
    }

    this.#removeSquareHighlights();

    // get source square position
    const sourceSquare = document.getElementById(this.#squareElsIds[this.#draggedPieceSource]);
    if (!sourceSquare) throw new Error('');
    const sourceSquarePosition = getJqueryStyleOffset(sourceSquare);

    // animate the piece to the target square
    const opts = {
      duration: this.#config.snapbackSpeed,
      complete: () => {
        this.#drawPositionInstant();
        this.#draggedPiece.style.setProperty('display', 'none');

        // run their onSnapbackEnd function
        if (typeof this.#config.onSnapbackEnd === 'function') {
          this.#config.onSnapbackEnd(
            this.#draggedPiece,
            this.#draggedPieceSource,
            this.currentPosition,
            this.#currentOrientation
          );
        }
      }
    };
    this.#draggedPiece.animate(sourceSquarePosition, opts);

    // set state
    this.#isDragging = false;
  }

  #trashDraggedPiece() {
    this.#removeSquareHighlights();

    // remove the source piece
    const newPosition = this.currentPosition;
    delete newPosition[this.#draggedPieceSource];
    this.#setCurrentPosition(newPosition);

    // redraw the position
    this.#drawPositionInstant();

    // hide the dragged piece
    this.#draggedPiece.animate([{ opacity: 1 }, { opacity: 0 }], this.#config.trashSpeed);

    // set state
    this.#isDragging = false;
  }

  #beginDraggingPiece(source, piece, x, y) {
    console.log('begin');
    // run their custom onDragStart function
    // their custom onDragStart function can cancel drag start
    if (typeof this.#config.onDragStart === 'function' &&
      this.#config.onDragStart(source, piece, this.currentPosition, this.#currentOrientation) === false) {
      return;
    }

    // set state
    this.#isDragging = true;
    this.#draggedPiece = piece;
    this.#draggedPieceSource = source;

    // if the piece came from spare pieces, location is offboard
    if (source === 'spare') {
      this.#draggedPieceLocation = 'offboard';
    } else {
      this.#draggedPieceLocation = source;
    }

    // capture the x, y coords of all squares in memory
    this.#captureSquareOffsets();

    // create the dragged piece
    this.#draggedPiece.setAttribute('src', this.#buildPieceImgSrc(piece));
    this.#draggedPiece.style.setProperty('display', '');
    this.#draggedPiece.style.setProperty('position', 'absolute');
    this.#draggedPiece.style.setProperty('left', `${x - this.#squareSize / 2}px`);
    this.#draggedPiece.style.setProperty('top', `${y - this.#squareSize / 2}px`);

    if (source !== 'spare') {
      // highlight the source square and hide the piece
      const sourceSquare = document.getElementById(this.#squareElsIds[source]);
      if (sourceSquare) {
        sourceSquare.classList.add(ClassNameLookup.highlight1);
        /** @type {NodeListOf<HTMLElement>} */(sourceSquare.querySelectorAll(`.${ClassNameLookup.piece}`))
          .forEach(x => x.style.setProperty('display', 'none'));
      }
    }
  }

  #updateDraggedPiece(x, y) {
    // put the dragged piece over the mouse cursor
    this.#draggedPiece.style.setProperty('left', `${x - this.#squareSize / 2}px`);
    this.#draggedPiece.style.setProperty('top', `${y - this.#squareSize / 2}px`);

    // get location
    const location = this.#isXYOnSquare(x, y);

    // do nothing if the location has not changed
    if (location === this.#draggedPieceLocation) return;

    // remove highlight from previous square
    if (validSquare(this.#draggedPieceLocation)) {
      document.getElementById(this.#squareElsIds[this.#draggedPieceLocation])?.classList.remove(ClassNameLookup.highlight2);
    }

    // add highlight to new square
    if (validSquare(location)) {
      document.getElementById(this.#squareElsIds[location])?.classList.add(ClassNameLookup.highlight2);
    }

    // run onDragMove
    if (typeof this.#config.onDragMove === 'function') {
      this.#config.onDragMove(
        location,
        this.#draggedPieceLocation,
        this.#draggedPieceSource,
        this.#draggedPiece,
        this.currentPosition,
        this.#currentOrientation
      );
    }

    // update state
    this.#draggedPieceLocation = location;
  }

  #stopDraggedPiece(location) {
    // determine what the action should be
    let action = 'drop';
    if (location === 'offboard' && this.#config.dropOffBoard === 'snapback') {
      action = 'snapback';
    }
    if (location === 'offboard' && this.#config.dropOffBoard === 'trash') {
      action = 'trash';
    }

    // run their onDrop function, which can potentially change the drop action
    if (typeof this.#config.onDrop === 'function') {
      const newPosition = this.currentPosition;

      // source piece is a spare piece and position is off the board
      // if (draggedPieceSource === 'spare' && location === 'offboard') {...}
      // position has not changed; do nothing

      // source piece is a spare piece and position is on the board
      if (this.#draggedPieceSource === 'spare' && validSquare(location)) {
        // add the piece to the board
        newPosition[location] = this.#draggedPiece;
      }

      // source piece was on the board and position is off the board
      if (validSquare(this.#draggedPieceSource) && location === 'offboard') {
        // remove the piece from the board
        delete newPosition[this.#draggedPieceSource];
      }

      // source piece was on the board and position is on the board
      if (validSquare(this.#draggedPieceSource) && validSquare(location)) {
        // move the piece
        delete newPosition[this.#draggedPieceSource];
        newPosition[location] = this.#draggedPiece;
      }

      const oldPosition = this.currentPosition;

      const result = this.#config.onDrop(
        this.#draggedPieceSource,
        location,
        this.#draggedPiece,
        newPosition,
        oldPosition,
        this.#currentOrientation
      );
      if (result === 'snapback' || result === 'trash') {
        action = result;
      }
    }

    // do it!
    if (action === 'snapback') {
      this.#snapbackDraggedPiece();
    } else if (action === 'trash') {
      this.#trashDraggedPiece();
    } else if (action === 'drop') {
      this.#dropDraggedPieceOnSquare(location);
    }
  }

  // -------------------------------------------------------------------------
  // Browser Events
  // -------------------------------------------------------------------------

  #stopDefault(evt) {
    evt.preventDefault();
  }

  #mousedownSquare(evt) {
    // do nothing if we're not draggable
    if (!this.#config.draggable) return;

    // do nothing if there is no piece on this square
    const square = evt.currentTarget.getAttribute('data-square');
    if (!validSquare(square)) return;
    if (!Object.prototype.hasOwnProperty.call(this.#currentPosition, square)) return;

    this.#beginDraggingPiece(square, this.#currentPosition[square], evt.pageX, evt.pageY);
  }

  #touchstartSquare(e) {
    // do nothing if we're not draggable
    if (!this.#config.draggable) return;

    // do nothing if there is no piece on this square
    const square = e.currentTarget.getAttribute('data-square');
    if (!validSquare(square)) return;
    if (!Object.prototype.hasOwnProperty.call(this.#currentPosition, square)) return;

    e = e.originalEvent;
    this.#beginDraggingPiece(
      square,
      this.#currentPosition[square],
      e.changedTouches[0].pageX,
      e.changedTouches[0].pageY
    );
  }

  #mousedownSparePiece(evt) {
    // do nothing if sparePieces is not enabled
    if (!this.#config.sparePieces) return;

    const piece = evt.currentTarget.getAttribute('data-piece');

    this.#beginDraggingPiece('spare', piece, evt.pageX, evt.pageY);
  }

  #touchstartSparePiece(e) {
    // do nothing if sparePieces is not enabled
    if (!this.#config.sparePieces) return;

    const piece = e.currentTarget.getAttribute('data-piece');

    e = e.originalEvent;
    this.#beginDraggingPiece(
      'spare',
      piece,
      e.changedTouches[0].pageX,
      e.changedTouches[0].pageY
    );
  }

  #mousemoveWindow(evt) {
    if (this.#isDragging) {
      this.#updateDraggedPiece(evt.pageX, evt.pageY);
    }
  }

  #touchmoveWindow(evt) {
    // do nothing if we are not dragging a piece
    if (!this.#isDragging) return;

    // prevent screen from scrolling
    evt.preventDefault();

    this.#updateDraggedPiece(evt.originalEvent.changedTouches[0].pageX,
      evt.originalEvent.changedTouches[0].pageY);
  }

  #mouseupWindow(evt) {
    // do nothing if we are not dragging a piece
    if (!this.#isDragging) return;

    // get the location
    const location = this.#isXYOnSquare(evt.pageX, evt.pageY);

    this.#stopDraggedPiece(location);
  }

  #touchendWindow(evt) {
    // do nothing if we are not dragging a piece
    if (!this.#isDragging) return;

    // get the location
    const location = this.#isXYOnSquare(evt.originalEvent.changedTouches[0].pageX,
      evt.originalEvent.changedTouches[0].pageY);

    this.#stopDraggedPiece(location);
  }

  /**
   * @param {MouseEvent} evt
   * @returns {void}
   */
  #mouseenterSquare(evt) {
    // do not fire this event if we are dragging a piece
    // NOTE: this should never happen, but it's a safeguard
    if (this.#isDragging) return;

    // exit if they did not provide a onMouseoverSquare function
    if (typeof this.#config.onMouseoverSquare !== 'function') return;

    // get the square
    const square = /** @type {HTMLElement | null} */(evt.currentTarget)?.getAttribute('data-square');

    // NOTE: this should never happen; defensive
    if (!validSquare(square)) return;

    // get the piece on this square
    let piece = false;
    if (square != null && Object.prototype.hasOwnProperty.call(this.#currentPosition, square)) {
      piece = this.#currentPosition[square];
    }

    // execute their function
    this.#config.onMouseoverSquare(square, piece, this.currentPosition, this.#currentOrientation);
  }

  #mouseleaveSquare(evt) {
    // do not fire this event if we are dragging a piece
    // NOTE: this should never happen, but it's a safeguard
    if (this.#isDragging) return;

    // exit if they did not provide an onMouseoutSquare function
    if (typeof this.#config.onMouseoutSquare !== 'function') return;

    // get the square
    const square = document.getElementById(evt.currentTarget)?.getAttribute('data-square');

    // NOTE: this should never happen; defensive
    if (!validSquare(square)) return;

    // get the piece on this square
    let piece = false;
    if (square != null && Object.prototype.hasOwnProperty.call(this.#currentPosition, square)) {
      piece = this.#currentPosition[square];
    }

    // execute their function
    this.#config.onMouseoutSquare(square, piece, this.currentPosition, this.#currentOrientation);
  }

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------

  #addEvents() {
    // prevent "image drag"
    document.body.onmousedown = (e) => e.target && /** @type {Element} */(e.target).matches(`.${ClassNameLookup.piece}`) && this.#stopDefault(e);
    document.body.onmousemove = (e) => e.target && /** @type {Element} */(e.target).matches(`.${ClassNameLookup.piece}`) && this.#stopDefault(e);

    // mouse drag pieces
    this.#board.onmousedown = (e) => e.target && /** @type {Element} */(e.target).matches(`.${ClassNameLookup.square}`) && this.#mousedownSquare(e);
    this.#container.onmousedown = (e) => e.target && /** @type {Element} */(e.target).matches(`.${ClassNameLookup.sparePieces} .${ClassNameLookup.piece}`) && this.#mousedownSparePiece(e);

    // mouse enter / leave square
    this.#board.onmouseenter = (e) => e.target && /** @type {Element} */(e.target).matches(`.${ClassNameLookup.square}`) && this.#mouseenterSquare(e);
    this.#board.onmouseleave = (e) => e.target && /** @type {Element} */(e.target).matches(`.${ClassNameLookup.square}`) && this.#mouseleaveSquare(e);

    // piece drag
    const throttledMousemoveWindow = throttle((e) => this.#mousemoveWindow(e), this.#config.dragThrottleRate);
    const throttledTouchmoveWindow = throttle((e) => this.#touchmoveWindow(e), this.#config.dragThrottleRate);
    window.onmousemove = (e) => throttledMousemoveWindow(e);
    window.onmouseup = (e) => this.#mouseupWindow(e);

    // touch drag pieces
    if (isTouchDevice()) {
      this.#board.ontouchstart = (e) => e.target && /** @type {Element} */(e.target).matches(`.${ClassNameLookup.square}`) && this.#touchstartSquare(e);
      this.#board.ontouchstart = (e) => e.target && /** @type {Element} */(e.target).matches(`.${ClassNameLookup.sparePieces} .${ClassNameLookup.piece}`) && this.#touchstartSparePiece(e);
      window.ontouchmove = (e) => throttledTouchmoveWindow(e);
      window.ontouchend = (e) => this.#touchendWindow(e);
    }
  }

  /**
   * Calculates square size based on the width of the container
   */
  #calculateSquareSize() {
    // got a little CSS black magic here, so let me explain:
    // get the width of the container element (could be anything), reduce by 1 for
    // fudge factor, and then keep reducing until we find an exact mod 8 for
    // our square size
    const containerWidth = this.#container.getBoundingClientRect().width;

    // defensive, prevent infinite loop
    if (!containerWidth || containerWidth <= 0) {
      return 0;
    }

    // pad one pixel
    let boardWidth = containerWidth - 1;

    while (boardWidth % 8 !== 0 && boardWidth > 0) {
      boardWidth = boardWidth - 1;
    }

    return boardWidth / 8;
  }
}

export { Chessboard, fenToObj, objToFen, validSquare, validPieceCode, validFen, validPositionObject, START_FEN, START_POSITION, isTouchDevice };
