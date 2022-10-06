/// <reference lib="es2021" />
/* eslint-env browser */

import * as pieces from './pieces.svg.js';

// ------------------------ //
//        Constants         //
// ------------------------ //

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

// ------------------------ //
//        Misc Utils        //
// ------------------------ //

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

/**
 * @param {unknown} o
 * @returns {o is {}}
 */
function isPlainObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}


// ------------------------ //
//        Chess Utils       //
// ------------------------ //

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
      const piece = row[j];
      if (piece.search(/[1-8]/) !== -1) {
        const numEmptySquares = parseInt(piece, 10);
        colIdx = colIdx + numEmptySquares;
      } else {
        // piece
        const square = COLUMNS[colIdx] + currentRow;
        position[square] = piece.toLowerCase() === piece
          ? `b${piece.toUpperCase()}`  // black
          : `w${piece.toUpperCase()}`; // white;
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
        const [color, pieceKey] = obj[square].split('');
        fen += color === 'w'
          ? pieceKey.toUpperCase()  // white
          : pieceKey.toLowerCase(); // black
      } else {
        fen += '1'; // empty space
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

/**
 * Returns the distance between two squares
 * @param {string} squareA
 * @param {string} squareB
 * @returns {number}
 */
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

/**
 * Returns the square of the closest instance of piece, or `false` if no piece found
 * @param {*} position
 * @param {*} piece
 * @param {*} square
 * @returns {string | false}
 */
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

/**
 * Returns an array of closest squares from square
 * @param {string} square
 * @returns
 */
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

class Chessboard {
  static pieces = pieces;
  static fenToObj = fenToObj;
  static objToFen = objToFen;

  /**
   * @type {HTMLElement}
   */
  #container;
  /**
   * @type {HTMLElement}
   */
  #board;
  /**
   * @type {'white' | 'black'}
   */
  #orientation = 'white';
  /**
   * @type {Map<string, string>}
   */
  #position = new Map();
  /**
   * @type {Map<string, HTMLElement>}
   */
  #squares = new Map();
  /**
   * @type {Map<string, HTMLElement>}
   */
  #pieces = new Map();
  /**
   * @type {Map<string, HTMLElement>}
   */
  #sparePieces = new Map();
  /**
   * @type {HTMLElement}
   */
  #topShelf;
  /**
   * @type {HTMLElement}
   */
  #bottomShelf;

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
   * @property {boolean} useAnimation
   * @property {string | boolean} sparePieces
   * @property {'snapback' | 'trash'} dropOffBoard
   * @property {'white' | 'black'} orientation
   * @property {string | { [x: string]: string }} position
   * @property {'alert' | 'console' | boolean | ((x: string, y: any, z: HTMLElement) => void)} showErrors
   * @property {string | ((x: string) => string)} pieceTheme
   * @property {(x: object, y: object) => void} [onChange]
   * @property {(x: string, y: string, z: string, w: HTMLElement, r: object, s: 'white' | 'black') => void} [onDragMove]
   * @property {(x: string | null | undefined, y: boolean, z: object, o: 'white' | 'black') => boolean} [onDragStart]
   * @property {(x: string, y: any, z: HTMLElement, w: object, r: object, s: 'white' | 'black') => 'snapback' | 'trash'} [onDrop]
   * @property {(x: object, y: object) => void} [onMoveEnd]
   */
  #config = /** @type {ChessboardConfig} */ ({
    showErrors: 'alert' // default value only used in constructor prior to user config assignment
  });

  get fen() {
    return objToFen(this.position);
  }

  get orientation() {
    return this.#orientation;
  }

  get position() {
    return Object.fromEntries(this.#position.entries());
  }

  /**
   * Returns calculated square size based on the width of the container
   * @type {number}
   */
  get squareSize() {
    // got a little CSS black magic here, so let me explain:
    // get the width of the container element (could be anything), reduce by 1 for
    // fudge factor, and then keep reducing until we find an exact mod 8 for
    // our square size
    const containerWidth = this.#container.clientWidth;

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

  /**
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
      const container = document.querySelectorAll(containerElOrString);
      if (container.length !== 1) {
        this.#error(1003, 'The first argument to new Chessboard() must be the ID of a DOM node, an ID query selector, or a single DOM node.\n\nExiting…');
        return;
      }

      this.#container = /** @type {HTMLElement} */((container.item(0)));
      this.#container.classList.add(ClassNameLookup.chessboard);
      this.#container.replaceChildren();
    } else {
      this.#error(1003, 'The first argument to new Chessboard() must be the ID of a DOM node, an ID query selector, or a single DOM node.\n\nExiting…');
      return;
    }

    this.#board = document.createElement('div');
    this.#board.classList.add(ClassNameLookup.board);
    this.#config = this.#validateConfig(config);
    this.#orientation = this.#config.orientation;

    this.#topShelf = document.createElement('div');
    this.#topShelf.classList.add(ClassNameLookup.sparePieces, ClassNameLookup.sparePiecesTop);
    this.#bottomShelf = document.createElement('div');
    this.#bottomShelf.classList.add(ClassNameLookup.sparePieces, ClassNameLookup.sparePiecesBottom);

    this.#container.appendChild(this.#topShelf);
    this.#container.appendChild(this.#board);
    this.#container.appendChild(this.#bottomShelf);

    if (this.#config.sparePieces) {
      for (const pieceKey of 'KQRNBP'.split('')) {
        const whitePieceName = `w${pieceKey}`;
        const whitePiece = this.#buildPiece(whitePieceName);

        const blackPieceName = `b${pieceKey}`;
        const blackPiece = this.#buildPiece(blackPieceName);

        this.#sparePieces.set(whitePieceName, whitePiece);
        this.#sparePieces.set(blackPieceName, blackPiece);
      }
    }

    this.render();
  }

  /**
   * Clear the board of pieces
   */
  clear() {
    this.setPosition('clear');
  }

  /**
   * Set the board to the starting position
   */
  start() {
    this.setPosition('start');
  }

  /**
   * Flip orientation
   */
  flip() {
    return this.setOrientation('flip');
  }

  /**
   * Move pieces
   * @param {string | string[]} moveset
   */
  move(moveset) {
    if (moveset.length === 0) return;
    if (!Array.isArray(moveset)) moveset = [moveset];

    // collect the moves into an object
    const moves = moveset
      .filter(move => validMove(move) || this.#error(2826, 'Invalid move passed to the move method.', move))
      .map(move => move.split('-'));

    for (const [source, destination] of moves) {
      if (!this.#position.has(source)) continue;

      const piece = this.#position.get(source);
      this.#position.delete(source);
      if (typeof piece === 'string' && piece.length > 0) {
        this.#position.set(destination, piece);
      }
    }

    this.setPosition(this.position);
  }

  /**
   * @param {'white' | 'black' | 'flip'} orientation
   */
  setOrientation(orientation) {
    if (!orientation) {
      return this.#orientation;
    } else if (orientation === 'white' || orientation === 'black') {
      this.#orientation = orientation;
    } else if (orientation === 'flip') {
      this.#orientation = this.#orientation === 'white' ? 'black' : 'white';
    } else {
      this.#error(5482, 'Invalid value passed to the orientation method.', orientation);
    }

    this.render();

    return this.#orientation;
  }

  /**
   * @param {'clear' | 'start' | object} position
   */
  setPosition(position) {
    const positionIsString = typeof position === 'string';

    if (positionIsString) {
      const positionLowerCase = position.toLowerCase();

      if (positionLowerCase === 'clear') {
        position = {};
      } else if (positionLowerCase === 'start') {
        position = START_POSITION;
      }
    }

    // convert FEN to position object
    if (validFen(position)) {
      position = fenToObj(position);
    }

    // validate position object
    if (validPositionObject(position)) {
      position = { ...position };
    } else {
      this.#error(6482, 'Invalid value passed to the position method.', position);
      return;
    }

    const setCurrentPosition = () => {
      const { position: currentPosition } = this;
      if (objToFen(currentPosition) !== objToFen(position)) {
        if (typeof this.#config.onChange === 'function') {
          this.#config.onChange(currentPosition, position);
        }
        this.#position = new Map(Object.entries(position));
      }
    };

    if (this.#config.useAnimation) {
      const animations = this.#calculateAnimations(position);
      this.#doAnimations(animations, position).then(setCurrentPosition);
    } else {
      setCurrentPosition();
      this.#drawPosition();
    }
  }

  render() {
    this.#drawBoard();
    this.#drawPosition();
  }

  /**
   * Irretrievably remove everything. The Chessboard instance will become useless.
   */
  destroy() {
    this.#container.replaceChildren();
    this.#container = /** @type {any} */(undefined);
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

  /**
   * @param {string | Partial<ChessboardConfig>} config
   * @returns {ChessboardConfig}
   */
  #validateConfig(config) {
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
    if (config.useAnimation !== false) config.useAnimation = true;
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
          this.#position = new Map(Object.entries(START_POSITION));
        } else if (validFen(config.position)) {
          this.#position = new Map(Object.entries(fenToObj(config.position)));
        }
      } else if (validPositionObject(config.position)) {
        this.#position = new Map(Object.entries(config.position));
      } else {
        this.#error(7263, 'Invalid value passed to config.position.', config.position);
      }
    }

    return /** @type {ChessboardConfig} */(config);
  }

  #buildPiece(pieceName) {
    const { squareSize } = this;
    const piece = new Image(squareSize, squareSize);

    let src = '';
    if (typeof this.#config.pieceTheme === 'function') {
      src = this.#config.pieceTheme(pieceName);
    }
    if (typeof this.#config.pieceTheme === 'string') {
      src = this.#config.pieceTheme.replaceAll('{piece}', pieceName);
    }

    piece.id = `${pieceName}-${uuid()}`;
    piece.alt = '';
    piece.src = src === pieceName ? pieces[src] : src;
    piece.classList.add(ClassNameLookup.piece);
    piece.dataset.piece = pieceName;

    piece.draggable = this.#config.draggable;
    if (piece.draggable) {
      piece.ondragstart = (evt) => {
        if (evt.target instanceof HTMLElement && evt.dataTransfer != null) {
          const source = evt.target.dataset.square ?? "spare";
          if (source !== "spare") {
            const square = this.#squares.get(source);
            if (square instanceof HTMLElement) {
              square.classList.add(ClassNameLookup.highlight1);
            }
          }
          evt.dataTransfer.setData("pieceName", pieceName);
          evt.dataTransfer.setData("source", source);
          evt.dataTransfer.effectAllowed = "move";
        }
      };
    }

    return piece;
  }

  /**
   * Calculate an array of animations that need to happen in order to get from `pos1` to `pos2`
   * @param {{ [index: string ]: string }} pos2
   * @returns {any[]}
   */
  #calculateAnimations(pos2) {
    const animations = [];

    if (Object.keys(pos2).length === 0) {
      for (const [square, piece] of this.#position.entries()) {
        animations.push({ type: 'clear', square, piece });
      }
      return animations;
    }

    const pos1 = this.position;

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

  /**
   * Execute an array of animations
   * @param {any[]} animations
   * @param {{ [index: string]: string; }} newPosition
   */
  #doAnimations(animations, newPosition) {
    if (animations.length === 0) return Promise.resolve();

    let numFinished = 0;
    return Promise.all(
      animations.map(animation => /** @type {Promise<void>} */(new Promise((resolve) => {
        const onFinishAnimation = () => {
          numFinished += 1;
          if (numFinished === animations.length) {
            if (typeof this.#config.onMoveEnd === 'function') {
              this.#config.onMoveEnd(this.position, { ...newPosition });
            }
            resolve();
          }
        };
        if (animation.type === 'add') {
          this.#doAddAnimation(animation, onFinishAnimation);
        } else if (animation.type === 'clear') {
          this.#doClearAnimation(animation, onFinishAnimation);
        } else if (animation.type === 'move') {
          this.#doMoveAnimation(animation, onFinishAnimation);
        }
      })))
    );
  }

  #doAddAnimation(animation, onFinishAnimation) {
    const { piece: pieceName, square: squareName } = animation;
    const { sparePieces } = this.#config;

    const piece = this.#buildPiece(pieceName);
    const destination = /** @type {HTMLElement} */(this.#squares.get(squareName));

    if (destination != null) {
      if (sparePieces) {
        const sparePiece = this.#sparePieces.get(pieceName);
        if (sparePiece == null) {
          throw new Error(`Unable to locate spare piece for ${pieceName}`);
        }

        document.body.appendChild(piece);
        piece.style.setProperty('position', 'absolute');

        piece
          .animate(
            [getJqueryStyleOffset(sparePiece), getJqueryStyleOffset(destination)],
            this.#config.moveSpeed
          )
          .onfinish = () => {
            piece.style.removeProperty('position');
            piece.dataset.square = squareName;
            destination.prepend(piece);

            this.#pieces.get(squareName)?.remove();
            this.#pieces.set(squareName, piece);
            this.#position.set(squareName, pieceName);

            onFinishAnimation();
          };
      } else {
        destination.prepend(piece);
        piece
          .animate([{ opacity: 0 }, { opacity: 1 }], this.#config.appearSpeed)
          .onfinish = () => {
            this.#pieces.delete(squareName);
            this.#pieces.set(squareName, piece);
            onFinishAnimation();
          };
      }
    } else {
      throw new Error(`Unable to locate destination square ${squareName}`);
    }
  }

  #doClearAnimation(animation, onFinishAnimation) {
    const piece = this.#pieces.get(animation.square);
    if (piece != null) {
      piece
        .animate([{ opacity: 1 }, { opacity: 0 }], this.#config.trashSpeed)
        .onfinish = () => {
          piece.remove();
          this.#pieces.delete(animation.square);
          this.#position.delete(animation.square);
          onFinishAnimation();
        };
    }
  }

  #doMoveAnimation(animation, onFinishAnimation) {
    const { piece: pieceName, source: sourceName, destination: destinationName } = animation;

    const source = /** @type {HTMLElement} */(this.#squares.get(sourceName));
    const destination = /** @type {HTMLElement} */(this.#squares.get(destinationName));

    const piece = this.#pieces.get(sourceName);
    if (piece == null) {
      throw new Error(`Unable to locate piece for square ${sourceName}`);
    }
    document.body.appendChild(piece);
    piece.style.setProperty('position', 'absolute');

    piece
      .animate(
        [getJqueryStyleOffset(source), getJqueryStyleOffset(destination)],
        this.#config.moveSpeed
      )
      .onfinish = () => {
        piece.style.removeProperty('position');

        this.#pieces.delete(sourceName);
        this.#position.delete(sourceName);
        this.#pieces.set(destinationName, piece);
        this.#position.set(destinationName, pieceName);

        destination.appendChild(piece);
        onFinishAnimation();
      };
  }

  // ------------------------
  // Control Flow
  // ------------------------
  #clearPieces() {
    if (this.#pieces.size === 0) return;

    for (const piece of this.#pieces.values()) {
      if (this.#config.useAnimation) {
        piece
          .animate([{ opacity: 1 }, { opacity: 0 }], this.#config.trashSpeed)
          .onfinish = () => piece.remove();
      } else {
        piece.remove();
      }
    }
    this.#pieces.clear();
    this.#removeSquareHighlights();
  }

  #drawPosition() {
    this.#clearPieces();

    for (const [squareName, pieceName] of this.#position.entries()) {
      const square = this.#squares.get(squareName);
      if (square != null) {
        const piece = this.#buildPiece(pieceName);
        this.#pieces.set(squareName, piece);
        square.appendChild(piece);
      }
    }
  }

  #drawBoard() {
    this.#clearPieces();
    this.#board.style.setProperty('width', `${this.squareSize * 8}px`);

    // algebraic notation / orientation
    const alpha = COLUMNS.slice();
    let currentRow = 8;
    if (this.#orientation === 'black') {
      alpha.reverse();
      currentRow = 1;
    }

    this.#board.replaceChildren();

    let squareColor = 'white';
    for (let i = 0; i < 8; i++) {
      const row = document.createElement('row');
      row.classList.add(ClassNameLookup.row);

      for (let j = 0; j < 8; j++) {
        const { squareSize } = this;
        const squareName = alpha[j] + currentRow;
        const square = document.createElement('div');

        square.id = `${squareName}-${uuid()}`;
        square.dataset.square = squareName;
        square.classList.add(ClassNameLookup.square, ClassNameLookup[squareColor], `square-${squareName}`);
        square.style.setProperty('height', `${squareSize}px`);
        square.style.setProperty('width', `${squareSize}px`);

        square.ondrop = (evt) => {
          evt.preventDefault();
          if (evt.currentTarget != null && evt.dataTransfer != null) {
            const source = evt.dataTransfer.getData("source");
            const pieceName = evt.dataTransfer.getData("pieceName");
            const piece = source === "spare"
              ? this.#buildPiece(pieceName)
              : /** @type {HTMLElement} */(this.#pieces.get(source));

            piece.dataset.square = squareName;

            this.#pieces.delete(source);
            this.#position.delete(source);
            this.#pieces.get(squareName)?.remove();
            this.#pieces.set(squareName, piece);
            this.#position.set(squareName, pieceName);

            /** @type {HTMLElement} */(evt.currentTarget).appendChild(piece);
            this.#removeSquareHighlights();
          }
        };
        square.ondragover = (evt) => {
          evt.preventDefault();
          if (evt.target != null && evt.dataTransfer != null) {
            /** @type {HTMLElement} */(evt.target).classList.add(ClassNameLookup.highlight1);
            evt.dataTransfer.dropEffect = "move";
          }
          return false;
        };
        square.ondragleave = (evt) => {
          evt.preventDefault();
          if (evt.target != null) {
            /** @type {HTMLElement} */(evt.target).classList.remove(ClassNameLookup.highlight1);
          }
        };

        if (this.#config.showNotation) {
          // alpha notation
          if ((this.#orientation === 'white' && currentRow === 1) ||
            (this.#orientation === 'black' && currentRow === 8)) {
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

        this.#squares.set(squareName, square);
      }

      const clearfix = document.createElement('div');
      clearfix.classList.add(ClassNameLookup.clearfix);

      row.appendChild(clearfix);
      this.#board.appendChild(row);

      squareColor = (squareColor === 'white') ? 'black' : 'white';

      if (this.#orientation === 'white') {
        currentRow = currentRow - 1;
      } else {
        currentRow = currentRow + 1;
      }
    }

    if (this.#config.sparePieces) {
      this.#topShelf.replaceChildren();
      this.#bottomShelf.replaceChildren();
      for (const [pieceName, piece] of this.#sparePieces.entries()) {
        if (this.#orientation === 'white') {
          if (pieceName.startsWith('w')) {
            this.#bottomShelf.appendChild(piece);
          } else {
            this.#topShelf.appendChild(piece);
          }
        } else {
          if (pieceName.startsWith('w')) {
            this.#topShelf.appendChild(piece);
          } else {
            this.#bottomShelf.appendChild(piece);
          }
        }
      }
    }
  }

  #removeSquareHighlights() {
    for (const square of this.#squares.values()) {
      square.classList.remove(ClassNameLookup.highlight1);
      square.classList.remove(ClassNameLookup.highlight2);
    }
  }
}

export {
  Chessboard,
  fenToObj,
  objToFen,
  validFen,
  validPieceCode,
  validPositionObject,
  validSquare,
  START_FEN,
  START_POSITION,
};
