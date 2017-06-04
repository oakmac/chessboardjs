/*!
 * chessboard.js $version$
 *
 * Copyright 2013 Chris Oakman
 * Released under the MIT license
 * https://github.com/oakmac/chessboardjs/blob/master/LICENSE
 *
 * Date: $date$
 */

// start anonymous scope
;(function () {
  'use strict'

  var $ = window['jQuery']

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  var COLUMNS = 'abcdefgh'.split('')
  var MINIMUM_JQUERY_VERSION = '1.8.3'
  var RUN_ASSERTS = true
  var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
  var START_POSITION = fenToObj(START_FEN)

  // default animation speeds
  var DEFAULT_APPEAR_SPEED = 200
  var DEFAULT_MOVE_SPEED = 200
  var DEFAULT_SNAPBACK_SPEED = 60
  var DEFAULT_SNAP_SPEED = 30
  var DEFAULT_TRASH_SPEED = 100

  // use unique class names to prevent clashing with anything else on the page
  // and simplify selectors
  // NOTE: these should never change
  var CSS = {}
  CSS['alpha'] = 'alpha-d2270'
  CSS['black'] = 'black-3c85d'
  CSS['board'] = 'board-b72b1'
  CSS['chessboard'] = 'chessboard-63f37'
  CSS['clearfix'] = 'clearfix-7da63'
  CSS['highlight1'] = 'highlight1-32417'
  CSS['highlight2'] = 'highlight2-9c5d2'
  CSS['notation'] = 'notation-322f9'
  CSS['numeric'] = 'numeric-fc462'
  CSS['piece'] = 'piece-417db'
  CSS['row'] = 'row-5277c'
  CSS['sparePieces'] = 'spare-pieces-7492f'
  CSS['sparePiecesBottom'] = 'spare-pieces-bottom-ae20f'
  CSS['sparePiecesTop'] = 'spare-pieces-top-4028b'
  CSS['square'] = 'square-55d63'
  CSS['white'] = 'white-1e1d7'

  // ---------------------------------------------------------------------------
  // Misc Util Functions
  // ---------------------------------------------------------------------------

  function uuid () {
    return 'xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function (c) {
      var r = (Math.random() * 16) | 0
      return r.toString(16)
    })
  }

  function deepCopy (thing) {
    return JSON.parse(JSON.stringify(thing))
  }

  function parseSemVer (version) {
    var tmp = version.split('.')
    return {
      major: parseInt(tmp[0], 10),
      minor: parseInt(tmp[1], 10),
      patch: parseInt(tmp[2], 10)
    }
  }

  // returns true if version is >= minimum
  function validSemanticVersion (version, minimum) {
    version = parseSemVer(version)
    minimum = parseSemVer(minimum)

    var versionNum = (version.major * 100000 * 100000) +
                     (version.minor * 100000) +
                     version.patch
    var minimumNum = (minimum.major * 100000 * 100000) +
                     (minimum.minor * 100000) +
                     minimum.patch

    return versionNum >= minimumNum
  }

  function interpolateTemplate (str, obj) {
    for (var key in obj) {
      if (!obj.hasOwnProperty(key)) continue
      var keyTemplateStr = '{' + key + '}'
      var value = obj[key]
      while (str.indexOf(keyTemplateStr) !== -1) {
        str = str.replace(keyTemplateStr, value)
      }
    }
    return str
  }

  if (RUN_ASSERTS) {
    console.assert(interpolateTemplate('{a}{a}', {a: 'z'}) === 'zz')
    console.assert(interpolateTemplate('{a}{a}{b}', {a: 'z', b: 'y'}) === 'zzy')
  }

  // ---------------------------------------------------------------------------
  // Predicates
  // ---------------------------------------------------------------------------

  function isString (s) {
    return typeof s === 'string'
  }

  function isFunction (f) {
    return typeof f === 'function'
  }

  function isInteger (n) {
    return typeof n === 'number' &&
           isFinite(n) &&
           Math.floor(n) === n
  }

  function validAnimationSpeed (speed) {
    if (speed === 'fast' || speed === 'slow') return true
    if (!isInteger(speed)) return false
    return speed >= 0
  }

  function validMove (move) {
    // move should be a string
    if (!isString(move)) return false

    // move should be in the form of "e2-e4", "f6-d5"
    var squares = move.split('-')
    if (squares.length !== 2) return false

    return validSquare(squares[0]) && validSquare(squares[1])
  }

  function validSquare (square) {
    return isString(square) && square.search(/^[a-h][1-8]$/) !== -1
  }

  if (RUN_ASSERTS) {
    console.assert(validSquare('a1'))
    console.assert(validSquare('e2'))
    console.assert(!validSquare('D2'))
    console.assert(!validSquare('g9'))
    console.assert(!validSquare('a'))
    console.assert(!validSquare(true))
    console.assert(!validSquare(null))
    console.assert(!validSquare({}))
  }

  function validPieceCode (code) {
    return isString(code) && code.search(/^[bw][KQRNBP]$/) !== -1
  }

  if (RUN_ASSERTS) {
    console.assert(validPieceCode('bP'))
    console.assert(validPieceCode('bK'))
    console.assert(validPieceCode('wK'))
    console.assert(validPieceCode('wR'))
    console.assert(!validPieceCode('WR'))
    console.assert(!validPieceCode('Wr'))
    console.assert(!validPieceCode('a'))
    console.assert(!validPieceCode(true))
    console.assert(!validPieceCode(null))
    console.assert(!validPieceCode({}))
  }

  function validFen (fen) {
    if (!isString(fen)) return false

    // cut off any move, castling, etc info from the end
    // we're only interested in position information
    fen = fen.replace(/ .+$/, '')

    // expand the empty square numbers to just 1s
    fen = expandFenEmptySquares(fen)

    // FEN should be 8 sections separated by slashes
    var chunks = fen.split('/')
    if (chunks.length !== 8) return false

    // check each section
    for (var i = 0; i < 8; i++) {
      if (chunks[i].length !== 8 ||
          chunks[i].search(/[^kqrnbpKQRNBP1]/) !== -1) {
        return false
      }
    }

    return true
  }

  if (RUN_ASSERTS) {
    console.assert(validFen(START_FEN))
    console.assert(validFen('8/8/8/8/8/8/8/8'))
    console.assert(validFen('r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R'))
    console.assert(!validFen('anbqkbnr/8/8/8/8/8/PPPPPPPP/8'))
    console.assert(!validFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/'))
    console.assert(!validFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBN'))
    console.assert(!validFen('888888/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'))
    console.assert(!validFen('888888/pppppppp/74/8/8/8/PPPPPPPP/RNBQKBNR'))
    console.assert(!validFen({}))
  }

  function validPositionObject (pos) {
    if (!$.isPlainObject(pos)) return false

    for (var i in pos) {
      if (!pos.hasOwnProperty(i)) continue

      if (!validSquare(i) || !validPieceCode(pos[i])) {
        return false
      }
    }

    return true
  }

  if (RUN_ASSERTS) {
    console.assert(validPositionObject(START_POSITION))
    console.assert(validPositionObject({}))
    console.assert(validPositionObject({e2: 'wP'}))
    console.assert(validPositionObject({e2: 'wP', d2: 'wP'}))
    console.assert(!validPositionObject({e2: 'BP'}))
    console.assert(!validPositionObject({y2: 'wP'}))
    console.assert(!validPositionObject(null))
    console.assert(!validPositionObject('start'))
    console.assert(!validPositionObject(START_FEN))
  }

  function isTouchDevice () {
    return 'ontouchstart' in document.documentElement
  }

  function isMSIE () {
    return navigator &&
           navigator.userAgent &&
           navigator.userAgent.search(/MSIE/) !== -1
  }

  function validJQueryVersion () {
    return typeof window.$ &&
           $.fn &&
           $.fn.jquery &&
           validSemanticVersion($.fn.jquery, MINIMUM_JQUERY_VERSION)
  }

  // ---------------------------------------------------------------------------
  // Chess Util Functions
  // ---------------------------------------------------------------------------

  // convert FEN piece code to bP, wK, etc
  function fenToPieceCode (piece) {
    // black piece
    if (piece.toLowerCase() === piece) {
      return 'b' + piece.toUpperCase()
    }

    // white piece
    return 'w' + piece.toUpperCase()
  }

  // convert bP, wK, etc code to FEN structure
  function pieceCodeToFen (piece) {
    var pieceCodeLetters = piece.split('')

    // white piece
    if (pieceCodeLetters[0] === 'w') {
      return pieceCodeLetters[1].toUpperCase()
    }

    // black piece
    return pieceCodeLetters[1].toLowerCase()
  }

  // convert FEN string to position object
  // returns false if the FEN string is invalid
  function fenToObj (fen) {
    if (!validFen(fen)) return false

    // cut off any move, castling, etc info from the end
    // we're only interested in position information
    fen = fen.replace(/ .+$/, '')

    var rows = fen.split('/')
    var position = {}

    var currentRow = 8
    for (var i = 0; i < 8; i++) {
      var row = rows[i].split('')
      var colIdx = 0

      // loop through each character in the FEN section
      for (var j = 0; j < row.length; j++) {
        // number / empty squares
        if (row[j].search(/[1-8]/) !== -1) {
          var numEmptySquares = parseInt(row[j], 10)
          colIdx = colIdx + numEmptySquares
        } else {
          // piece
          var square = COLUMNS[colIdx] + currentRow
          position[square] = fenToPieceCode(row[j])
          colIdx = colIdx + 1
        }
      }

      currentRow = currentRow - 1
    }

    return position
  }

  // position object to FEN string
  // returns false if the obj is not a valid position object
  function objToFen (obj) {
    if (!validPositionObject(obj)) return false

    var fen = ''

    var currentRow = 8
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        var square = COLUMNS[j] + currentRow

        // piece exists
        if (obj.hasOwnProperty(square)) {
          fen = fen + pieceCodeToFen(obj[square])
        } else {
          // empty space
          fen = fen + '1'
        }
      }

      if (i !== 7) {
        fen = fen + '/'
      }

      currentRow = currentRow - 1
    }

    // squeeze the empty numbers together
    fen = squeezeFenEmptySquares(fen)

    return fen
  }

  if (RUN_ASSERTS) {
    console.assert(objToFen(START_POSITION) === START_FEN)
    console.assert(objToFen({}) === '8/8/8/8/8/8/8/8')
    console.assert(objToFen({a2: 'wP', 'b2': 'bP'}) === '8/8/8/8/8/8/Pp6/8')
  }

  function squeezeFenEmptySquares (fen) {
    return fen.replace(/11111111/g, '8')
              .replace(/1111111/g, '7')
              .replace(/111111/g, '6')
              .replace(/11111/g, '5')
              .replace(/1111/g, '4')
              .replace(/111/g, '3')
              .replace(/11/g, '2')
  }

  function expandFenEmptySquares (fen) {
    return fen.replace(/8/g, '11111111')
              .replace(/7/g, '1111111')
              .replace(/6/g, '111111')
              .replace(/5/g, '11111')
              .replace(/4/g, '1111')
              .replace(/3/g, '111')
              .replace(/2/g, '11')
  }

  // returns the distance between two squares
  function squareDistance (squareA, squareB) {
    var squareAArray = squareA.split('')
    var squareAx = COLUMNS.indexOf(squareAArray[0]) + 1
    var squareAy = parseInt(squareAArray[1], 10)

    var squareBArray = squareB.split('')
    var squareBx = COLUMNS.indexOf(squareBArray[0]) + 1
    var squareBy = parseInt(squareBArray[1], 10)

    var xDelta = Math.abs(squareAx - squareBx)
    var yDelta = Math.abs(squareAy - squareBy)

    if (xDelta >= yDelta) return xDelta
    return yDelta
  }

  // returns the square of the closest instance of piece
  // returns false if no instance of piece is found in position
  function findClosestPiece (position, piece, square) {
    // create array of closest squares from square
    var closestSquares = createRadius(square)

    // search through the position in order of distance for the piece
    for (var i = 0; i < closestSquares.length; i++) {
      var s = closestSquares[i]

      if (position.hasOwnProperty(s) && position[s] === piece) {
        return s
      }
    }

    return false
  }

  // returns an array of closest squares from square
  function createRadius (square) {
    var squares = []

    // calculate distance of all squares
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        var s = COLUMNS[i] + (j + 1)

        // skip the square we're starting from
        if (square === s) continue

        squares.push({
          square: s,
          distance: squareDistance(square, s)
        })
      }
    }

    // sort by distance
    squares.sort(function (a, b) {
      return a.distance - b.distance
    })

    // just return the square code
    var surroundingSquares = []
    for (i = 0; i < squares.length; i++) {
      surroundingSquares.push(squares[i].square)
    }

    return surroundingSquares
  }

  // ---------------------------------------------------------------------------
  // HTML
  // ---------------------------------------------------------------------------

  function buildContainerHTML (hasSparePieces) {
    var html = '<div class="{chessboard}">'

    if (hasSparePieces) {
      html += '<div class="{sparePieces} {sparePiecesTop}"></div>'
    }

    html += '<div class="{board}"></div>'

    if (hasSparePieces) {
      html += '<div class="{sparePieces} {sparePiecesBottom}"></div>'
    }

    html += '</div>'

    return interpolateTemplate(html, CSS)
  }

  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------

  function expandConfigShorthand (config) {
    if (config === 'start') {
      config = {position: deepCopy(START_POSITION)}
    } else if (validFen(config)) {
      config = {position: fenToObj(config)}
    } else if (validPositionObject(config)) {
      config = {position: deepCopy(config)}
    }

    // config must be an object
    if (!$.isPlainObject(config)) config = {}

    return config
  }

  // validate config / set default options
  function expandConfig (config) {
    // default for orientation is white
    if (config.orientation !== 'black') config.orientation = 'white'

    // default for showNotation is true
    if (config.showNotation !== false) config.showNotation = true

    // default for draggable is false
    if (config.draggable !== true) config.draggable = false

    // default for dropOffBoard is 'snapback'
    if (config.dropOffBoard !== 'trash') config.dropOffBoard = 'snapback'

    // default for sparePieces is false
    if (config.sparePieces !== true) config.sparePieces = false

    // draggable must be true if sparePieces is enabled
    if (config.sparePieces) config.draggable = true

    // default piece theme is wikipedia
    if (!config.hasOwnProperty('pieceTheme') ||
        (!isString(config.pieceTheme) && !isFunction(config.pieceTheme))) {
      config.pieceTheme = 'img/chesspieces/wikipedia/{piece}.png'
    }

    // animation speeds
    if (!validAnimationSpeed(config.appearSpeed)) config.appearSpeed = DEFAULT_APPEAR_SPEED
    if (!validAnimationSpeed(config.moveSpeed)) config.moveSpeed = DEFAULT_MOVE_SPEED
    if (!validAnimationSpeed(config.snapbackSpeed)) config.snapbackSpeed = DEFAULT_SNAPBACK_SPEED
    if (!validAnimationSpeed(config.snapSpeed)) config.snapSpeed = DEFAULT_SNAP_SPEED
    if (!validAnimationSpeed(config.trashSpeed)) config.trashSpeed = DEFAULT_TRASH_SPEED

    return config
  }

  // ---------------------------------------------------------------------------
  // Dependencies
  // ---------------------------------------------------------------------------

  // check for a compatible version of jQuery
  function checkJQuery () {
    if (!validJQueryVersion()) {
      var errorMsg = 'Chessboard Error 1005: Unable to find a valid version of jQuery. ' +
        'Please include jQuery ' + MINIMUM_JQUERY_VERSION + ' or higher on the page' +
        '\n\n' +
        'Exiting...'
      window.alert(errorMsg)
      return false
    }

    return true
  }

  // NOTE: this function returns either boolean false or the $container element
  function checkContainerArg (containerElOrString) {
    // convert containerEl to query selector if it is a string
    if (isString(containerElOrString) &&
        containerElOrString.charAt(0) !== '#') {
      containerElOrString = '#' + containerElOrString
    }

    // containerEl must be something that becomes a jQuery collection of size 1
    var $container = $(containerElOrString)
    if ($container.length !== 1) {
      var errorMsg = 'Chessboard Error 1003: ' +
        'The first argument to Chessboard() must be the ID of a DOM node, ' +
        'an ID query selector, or a single DOM node.' +
        '\n\n' +
        'Exiting...'
      window.alert(errorMsg)
      return false
    }

    return $container
  }

  // ---------------------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------------------

  function constructor (containerElOrString, cfg) {
    // first things first: check basic dependencies
    if (!checkJQuery()) return null
    var $container = checkContainerArg(containerElOrString)
    if (!$container) return null

    // ensure the config object is what we expect
    cfg = expandConfigShorthand(cfg)
    cfg = expandConfig(cfg)

    // DOM elements
    var $board = null
    var $draggedPieceEl = null
    var $sparePiecesTop = null
    var $sparePiecesBottom = null

    // constructor return object
    var widget = {}

    // -------------------------------------------------------------------------
    // Stateful
    // -------------------------------------------------------------------------

    var BOARD_BORDER_SIZE = 2
    var CURRENT_ORIENTATION = 'white'
    var CURRENT_POSITION = {}
    var squareSize
    var DRAGGED_PIECE
    var DRAGGED_PIECE_LOCATION
    var DRAGGED_PIECE_SOURCE
    var DRAGGING_A_PIECE = false
    var sparePiecesElsIds = {}
    var squareElsIds = {}
    var squareElsOffsets = {}

    // -------------------------------------------------------------------------
    // Validation / Errors
    // -------------------------------------------------------------------------

    function error (code, msg, obj) {
        // do nothing if showErrors is not set
      if (
          cfg.hasOwnProperty('showErrors') !== true ||
          cfg.showErrors === false
        ) {
        return
      }

      var errorText = 'Chessboard Error ' + code + ': ' + msg

        // print to console
      if (
          cfg.showErrors === 'console' &&
          typeof console === 'object' &&
          typeof console.log === 'function'
        ) {
        console.log(errorText)
        if (arguments.length >= 2) {
          console.log(obj)
        }
        return
      }

        // alert errors
      if (cfg.showErrors === 'alert') {
        if (obj) {
          errorText += '\n\n' + JSON.stringify(obj)
        }
        window.alert(errorText)
        return
      }

      // custom function
      if (isFunction(cfg.showErrors)) {
        cfg.showErrors(code, msg, obj)
      }
    }

    // TODO: rename this
    function expandConfig2 () {
      CURRENT_ORIENTATION = cfg.orientation

      // make sure position is valid
      if (cfg.hasOwnProperty('position')) {
        if (cfg.position === 'start') {
          CURRENT_POSITION = deepCopy(START_POSITION)
        } else if (validFen(cfg.position)) {
          CURRENT_POSITION = fenToObj(cfg.position)
        } else if (validPositionObject(cfg.position)) {
          CURRENT_POSITION = deepCopy(cfg.position)
        } else {
          error(
              7263,
              'Invalid value passed to config.position.',
              cfg.position
            )
        }
      }
    }

    // -------------------------------------------------------------------------
    // DOM Misc
    // -------------------------------------------------------------------------

    // calculates square size based on the width of the container
    // got a little CSS black magic here, so let me explain:
    // get the width of the container element (could be anything), reduce by 1 for
    // fudge factor, and then keep reducing until we find an exact mod 8 for
    // our square size
    function calculateSquareSize () {
      var containerWidth = parseInt($container.width(), 10)

      // defensive, prevent infinite loop
      if (!containerWidth || containerWidth <= 0) {
        return 0
      }

      // pad one pixel
      var boardWidth = containerWidth - 1

      while (boardWidth % 8 !== 0 && boardWidth > 0) {
        boardWidth = boardWidth - 1
      }

      return boardWidth / 8
    }

    // create random IDs for elements
    function createElIds () {
      // squares on the board
      for (var i = 0; i < COLUMNS.length; i++) {
        for (var j = 1; j <= 8; j++) {
          var square = COLUMNS[i] + j
          squareElsIds[square] = square + '-' + uuid()
        }
      }

      // spare pieces
      var pieces = 'KQRNBP'.split('')
      for (i = 0; i < pieces.length; i++) {
        var whitePiece = 'w' + pieces[i]
        var blackPiece = 'b' + pieces[i]
        sparePiecesElsIds[whitePiece] = whitePiece + '-' + uuid()
        sparePiecesElsIds[blackPiece] = blackPiece + '-' + uuid()
      }
    }

    // -------------------------------------------------------------------------
    // Markup Building
    // -------------------------------------------------------------------------

    function buildBoardHTML (orientation) {
      if (orientation !== 'black') {
        orientation = 'white'
      }

      var html = ''

      // algebraic notation / orientation
      var alpha = deepCopy(COLUMNS)
      var row = 8
      if (orientation === 'black') {
        alpha.reverse()
        row = 1
      }

      var squareColor = 'white'
      for (var i = 0; i < 8; i++) {
        html += '<div class="{row}">'
        for (var j = 0; j < 8; j++) {
          var square = alpha[j] + row

          html += '<div class="{square} ' + CSS[squareColor] + ' ' +
            'square-' + square + '" ' +
            'style="width: ' + squareSize + 'px; height: ' + squareSize + 'px" ' +
            'id="' + squareElsIds[square] + '" ' +
            'data-square="' + square + '">'

          if (cfg.showNotation) {
            // alpha notation
            if ((orientation === 'white' && row === 1) ||
                (orientation === 'black' && row === 8)) {
              html += '<div class="{notation} {alpha}">' + alpha[j] + '</div>'
            }

            // numeric notation
            if (j === 0) {
              html += '<div class="{notation} {numeric}">' + row + '</div>'
            }
          }

          html += '</div>' // end .square

          squareColor = (squareColor === 'white' ? 'black' : 'white')
        }
        html += '<div class="{clearfix}"></div></div>'

        squareColor = (squareColor === 'white' ? 'black' : 'white')

        if (orientation === 'white') {
          row = row - 1
        } else {
          row = row + 1
        }
      }

      return interpolateTemplate(html, CSS)
    }

    function buildPieceImgSrc (piece) {
      if (isFunction(cfg.pieceTheme)) {
        return cfg.pieceTheme(piece)
      }

      if (isString(cfg.pieceTheme)) {
        return cfg.pieceTheme.replace(/{piece}/g, piece)
      }

      // NOTE: this should never happen
      error(8272, 'Unable to build image source for cfg.pieceTheme.')
      return ''
    }

    function buildPiece (piece, hidden, id) {
      var html = '<img src="' + buildPieceImgSrc(piece) + '" '
      if (isString(id) && id !== '') {
        html += 'id="' + id + '" '
      }
      html +=
          'alt="" ' +
          'class="' +
          CSS.piece +
          '" ' +
          'data-piece="' +
          piece +
          '" ' +
          'style="width: ' +
          squareSize +
          'px;' +
          'height: ' +
          squareSize +
          'px;'
      if (hidden === true) {
        html += 'display:none;'
      }
      html += '" />'

      return html
    }

    function buildSparePieces (color) {
      var pieces = ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP']
      if (color === 'black') {
        pieces = ['bK', 'bQ', 'bR', 'bB', 'bN', 'bP']
      }

      var html = ''
      for (var i = 0; i < pieces.length; i++) {
        html += buildPiece(pieces[i], false, sparePiecesElsIds[pieces[i]])
      }

      return html
    }

    // -------------------------------------------------------------------------
    // Animations
    // -------------------------------------------------------------------------

    function animateSquareToSquare (src, dest, piece, completeFn) {
      // get information about the source and destination squares
      var srcSquareEl = $('#' + squareElsIds[src])
      var srcSquarePosition = srcSquareEl.offset()
      var destSquareEl = $('#' + squareElsIds[dest])
      var destSquarePosition = destSquareEl.offset()

      // create the animated piece and absolutely position it
      // over the source square
      var animatedPieceId = uuid()
      $('body').append(buildPiece(piece, true, animatedPieceId))
      var animatedPieceEl = $('#' + animatedPieceId)
      animatedPieceEl.css({
        display: '',
        position: 'absolute',
        top: srcSquarePosition.top,
        left: srcSquarePosition.left
      })

      // remove original piece from source square
      srcSquareEl.find('.' + CSS.piece).remove()

      function animationComplete () {
        // add the "real" piece to the destination square
        destSquareEl.append(buildPiece(piece))

        // remove the animated piece
        animatedPieceEl.remove()

        // run complete function
        if (isFunction(completeFn)) {
          completeFn()
        }
      }

      // animate the piece to the destination square
      var opts = {
        duration: cfg.moveSpeed,
        complete: animationComplete
      }
      animatedPieceEl.animate(destSquarePosition, opts)
    }

    function animateSparePieceToSquare (piece, dest, completeFn) {
      var srcOffset = $('#' + sparePiecesElsIds[piece]).offset()
      var destSquareEl = $('#' + squareElsIds[dest])
      var destOffset = destSquareEl.offset()

      // create the animate piece
      var pieceId = uuid()
      $('body').append(buildPiece(piece, true, pieceId))
      var animatedPieceEl = $('#' + pieceId)
      animatedPieceEl.css({
        display: '',
        position: 'absolute',
        left: srcOffset.left,
        top: srcOffset.top
      })

      // on complete
      function animationComplete () {
        // add the "real" piece to the destination square
        destSquareEl.find('.' + CSS.piece).remove()
        destSquareEl.append(buildPiece(piece))

        // remove the animated piece
        animatedPieceEl.remove()

        // run complete function
        if (isFunction(completeFn)) {
          completeFn()
        }
      }

      // animate the piece to the destination square
      var opts = {
        duration: cfg.moveSpeed,
        complete: animationComplete
      }
      animatedPieceEl.animate(destOffset, opts)
    }

    // execute an array of animations
    function doAnimations (a, oldPos, newPos) {
      if (a.length === 0) return

      var numFinished = 0
      function onFinish () {
        numFinished = numFinished + 1

        // exit if all the animations aren't finished
        if (numFinished !== a.length) return

        drawPositionInstant()

        // run their onMoveEnd function
        if (isFunction(cfg.onMoveEnd)) {
          cfg.onMoveEnd(deepCopy(oldPos), deepCopy(newPos))
        }
      }

      for (var i = 0; i < a.length; i++) {
        // clear a piece
        if (a[i].type === 'clear') {
          $('#' + squareElsIds[a[i].square] + ' .' + CSS.piece).fadeOut(
              cfg.trashSpeed,
              onFinish
            )
        }

        // add a piece (no spare pieces)
        if (a[i].type === 'add' && !cfg.sparePieces) {
          $('#' + squareElsIds[a[i].square])
            .append(buildPiece(a[i].piece, true))
            .find('.' + CSS.piece)
            .fadeIn(cfg.appearSpeed, onFinish)
        }

        // add a piece from a spare piece
        if (a[i].type === 'add' && cfg.sparePieces) {
          animateSparePieceToSquare(a[i].piece, a[i].square, onFinish)
        }

        // move a piece
        if (a[i].type === 'move') {
          animateSquareToSquare(
              a[i].source,
              a[i].destination,
              a[i].piece,
              onFinish
            )
        }
      }
    }

    // calculate an array of animations that need to happen in order to get
    // from pos1 to pos2
    function calculateAnimations (pos1, pos2) {
      // make copies of both
      pos1 = deepCopy(pos1)
      pos2 = deepCopy(pos2)

      var animations = []
      var squaresMovedTo = {}

      // remove pieces that are the same in both positions
      for (var i in pos2) {
        if (!pos2.hasOwnProperty(i)) continue

        if (pos1.hasOwnProperty(i) && pos1[i] === pos2[i]) {
          delete pos1[i]
          delete pos2[i]
        }
      }

      // find all the "move" animations
      for (i in pos2) {
        if (!pos2.hasOwnProperty(i)) continue

        var closestPiece = findClosestPiece(pos1, pos2[i], i)
        if (closestPiece) {
          animations.push({
            type: 'move',
            source: closestPiece,
            destination: i,
            piece: pos2[i]
          })

          delete pos1[closestPiece]
          delete pos2[i]
          squaresMovedTo[i] = true
        }
      }

      // add pieces to pos2
      for (i in pos2) {
        if (!pos2.hasOwnProperty(i)) continue

        animations.push({
          type: 'add',
          square: i,
          piece: pos2[i]
        })

        delete pos2[i]
      }

      // clear pieces from pos1
      for (i in pos1) {
        if (!pos1.hasOwnProperty(i)) continue

        // do not clear a piece if it is on a square that is the result
        // of a "move", ie: a piece capture
        if (squaresMovedTo.hasOwnProperty(i)) continue

        animations.push({
          type: 'clear',
          square: i,
          piece: pos1[i]
        })

        delete pos1[i]
      }

      return animations
    }

    // -------------------------------------------------------------------------
    // Control Flow
    // -------------------------------------------------------------------------

    function drawPositionInstant () {
      // clear the board
      $board.find('.' + CSS.piece).remove()

      // add the pieces
      for (var i in CURRENT_POSITION) {
        if (!CURRENT_POSITION.hasOwnProperty(i)) continue

        $('#' + squareElsIds[i]).append(buildPiece(CURRENT_POSITION[i]))
      }
    }

    function drawBoard () {
      $board.html(buildBoardHTML(CURRENT_ORIENTATION, squareSize, cfg.showNotation))
      drawPositionInstant()

      if (cfg.sparePieces) {
        if (CURRENT_ORIENTATION === 'white') {
          $sparePiecesTop.html(buildSparePieces('black'))
          $sparePiecesBottom.html(buildSparePieces('white'))
        } else {
          $sparePiecesTop.html(buildSparePieces('white'))
          $sparePiecesBottom.html(buildSparePieces('black'))
        }
      }
    }

    // given a position and a set of moves, return a new position
    // with the moves executed
    function calculatePositionFromMoves (position, moves) {
      position = deepCopy(position)

      for (var i in moves) {
        if (!moves.hasOwnProperty(i)) continue

        // skip the move if the position doesn't have a piece on the source square
        if (!position.hasOwnProperty(i)) continue

        var piece = position[i]
        delete position[i]
        position[moves[i]] = piece
      }

      return position
    }

    function setCurrentPosition (position) {
      var oldPos = deepCopy(CURRENT_POSITION)
      var newPos = deepCopy(position)
      var oldFen = objToFen(oldPos)
      var newFen = objToFen(newPos)

      // do nothing if no change in position
      if (oldFen === newFen) return

      // run their onChange function
      if (isFunction(cfg.onChange)) {
        cfg.onChange(oldPos, newPos)
      }

      // update state
      CURRENT_POSITION = position
    }

    function isXYOnSquare (x, y) {
      for (var i in squareElsOffsets) {
        if (!squareElsOffsets.hasOwnProperty(i)) continue

        var s = squareElsOffsets[i]
        if (x >= s.left &&
            x < s.left + squareSize &&
            y >= s.top &&
            y < s.top + squareSize) {
          return i
        }
      }

      return 'offboard'
    }

    // records the XY coords of every square into memory
    function captureSquareOffsets () {
      squareElsOffsets = {}

      for (var i in squareElsIds) {
        if (!squareElsIds.hasOwnProperty(i)) continue

        squareElsOffsets[i] = $('#' + squareElsIds[i]).offset()
      }
    }

    function removeSquareHighlights () {
      $board
        .find('.' + CSS.square)
        .removeClass(CSS.highlight1 + ' ' + CSS.highlight2)
    }

    function snapbackDraggedPiece () {
      // there is no "snapback" for spare pieces
      if (DRAGGED_PIECE_SOURCE === 'spare') {
        trashDraggedPiece()
        return
      }

      removeSquareHighlights()

      // animation complete
      function complete () {
        drawPositionInstant()
        $draggedPieceEl.css('display', 'none')

        // run their onSnapbackEnd function
        if (isFunction(cfg.onSnapbackEnd)) {
          cfg.onSnapbackEnd(
              DRAGGED_PIECE,
              DRAGGED_PIECE_SOURCE,
              deepCopy(CURRENT_POSITION),
              CURRENT_ORIENTATION
            )
        }
      }

      // get source square position
      var sourceSquarePosition = $('#' + squareElsIds[DRAGGED_PIECE_SOURCE]).offset()

      // animate the piece to the target square
      var opts = {
        duration: cfg.snapbackSpeed,
        complete: complete
      }
      $draggedPieceEl.animate(sourceSquarePosition, opts)

      // set state
      DRAGGING_A_PIECE = false
    }

    function trashDraggedPiece () {
      removeSquareHighlights()

      // remove the source piece
      var newPosition = deepCopy(CURRENT_POSITION)
      delete newPosition[DRAGGED_PIECE_SOURCE]
      setCurrentPosition(newPosition)

      // redraw the position
      drawPositionInstant()

      // hide the dragged piece
      $draggedPieceEl.fadeOut(cfg.trashSpeed)

      // set state
      DRAGGING_A_PIECE = false
    }

    function dropDraggedPieceOnSquare (square) {
      removeSquareHighlights()

      // update position
      var newPosition = deepCopy(CURRENT_POSITION)
      delete newPosition[DRAGGED_PIECE_SOURCE]
      newPosition[square] = DRAGGED_PIECE
      setCurrentPosition(newPosition)

      // get target square information
      var targetSquarePosition = $('#' + squareElsIds[square]).offset()

      // animation complete
      function onAnimationComplete () {
        drawPositionInstant()
        $draggedPieceEl.css('display', 'none')

        // execute their onSnapEnd function
        if (isFunction(cfg.onSnapEnd)) {
          cfg.onSnapEnd(DRAGGED_PIECE_SOURCE, square, DRAGGED_PIECE)
        }
      }

      // snap the piece to the target square
      var opts = {
        duration: cfg.snapSpeed,
        complete: onAnimationComplete
      }
      $draggedPieceEl.animate(targetSquarePosition, opts)

      // set state
      DRAGGING_A_PIECE = false
    }

    function beginDraggingPiece (source, piece, x, y) {
      // run their custom onDragStart function
      // their custom onDragStart function can cancel drag start
      if (isFunction(cfg.onDragStart) &&
          cfg.onDragStart(source, piece, deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION) === false) {
        return
      }

      // set state
      DRAGGING_A_PIECE = true
      DRAGGED_PIECE = piece
      DRAGGED_PIECE_SOURCE = source

      // if the piece came from spare pieces, location is offboard
      if (source === 'spare') {
        DRAGGED_PIECE_LOCATION = 'offboard'
      } else {
        DRAGGED_PIECE_LOCATION = source
      }

      // capture the x, y coords of all squares in memory
      captureSquareOffsets()

      // create the dragged piece
      $draggedPieceEl.attr('src', buildPieceImgSrc(piece)).css({
        display: '',
        position: 'absolute',
        left: x - squareSize / 2,
        top: y - squareSize / 2
      })

      if (source !== 'spare') {
        // highlight the source square and hide the piece
        $('#' + squareElsIds[source])
          .addClass(CSS.highlight1)
          .find('.' + CSS.piece)
          .css('display', 'none')
      }
    }

    function updateDraggedPiece (x, y) {
      // put the dragged piece over the mouse cursor
      $draggedPieceEl.css({
        left: x - squareSize / 2,
        top: y - squareSize / 2
      })

      // get location
      var location = isXYOnSquare(x, y)

      // do nothing if the location has not changed
      if (location === DRAGGED_PIECE_LOCATION) return

      // remove highlight from previous square
      if (validSquare(DRAGGED_PIECE_LOCATION)) {
        $('#' + squareElsIds[DRAGGED_PIECE_LOCATION]).removeClass(CSS.highlight2)
      }

      // add highlight to new square
      if (validSquare(location)) {
        $('#' + squareElsIds[location]).addClass(CSS.highlight2)
      }

      // run onDragMove
      if (isFunction(cfg.onDragMove)) {
        cfg.onDragMove(
            location,
            DRAGGED_PIECE_LOCATION,
            DRAGGED_PIECE_SOURCE,
            DRAGGED_PIECE,
            deepCopy(CURRENT_POSITION),
            CURRENT_ORIENTATION
          )
      }

      // update state
      DRAGGED_PIECE_LOCATION = location
    }

    function stopDraggedPiece (location) {
      // determine what the action should be
      var action = 'drop'
      if (location === 'offboard' && cfg.dropOffBoard === 'snapback') {
        action = 'snapback'
      }
      if (location === 'offboard' && cfg.dropOffBoard === 'trash') {
        action = 'trash'
      }

      // run their onDrop function, which can potentially change the drop action
      if (isFunction(cfg.onDrop)) {
        var newPosition = deepCopy(CURRENT_POSITION)

        // source piece is a spare piece and position is off the board
        // if (DRAGGED_PIECE_SOURCE === 'spare' && location === 'offboard') {...}
        // position has not changed; do nothing

        // source piece is a spare piece and position is on the board
        if (DRAGGED_PIECE_SOURCE === 'spare' && validSquare(location)) {
          // add the piece to the board
          newPosition[location] = DRAGGED_PIECE
        }

        // source piece was on the board and position is off the board
        if (validSquare(DRAGGED_PIECE_SOURCE) && location === 'offboard') {
          // remove the piece from the board
          delete newPosition[DRAGGED_PIECE_SOURCE]
        }

        // source piece was on the board and position is on the board
        if (validSquare(DRAGGED_PIECE_SOURCE) && validSquare(location)) {
          // move the piece
          delete newPosition[DRAGGED_PIECE_SOURCE]
          newPosition[location] = DRAGGED_PIECE
        }

        var oldPosition = deepCopy(CURRENT_POSITION)

        var result = cfg.onDrop(
            DRAGGED_PIECE_SOURCE,
            location,
            DRAGGED_PIECE,
            newPosition,
            oldPosition,
            CURRENT_ORIENTATION
          )
        if (result === 'snapback' || result === 'trash') {
          action = result
        }
      }

      // do it!
      if (action === 'snapback') {
        snapbackDraggedPiece()
      } else if (action === 'trash') {
        trashDraggedPiece()
      } else if (action === 'drop') {
        dropDraggedPieceOnSquare(location)
      }
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    // clear the board
    function clear (useAnimation) {
      widget.position({}, useAnimation)
    }
    widget.clear = clear

    // remove the widget from the page
    function destroy () {
      // remove markup
      $container.html('')
      $draggedPieceEl.remove()

      // remove event handlers
      $container.unbind()
    }
    widget.destroy = destroy

    // shorthand method to get the current FEN
    widget.fen = function () {
      return widget.position('fen')
    }

    // flip orientation
    function flip () {
      return widget.orientation('flip')
    }
    widget.flip = flip

    // TODO: write this, GitHub Issue #5
    // widget.highlight = function() {
    //
    // }

    // move pieces
    widget.move = function () {
      // no need to throw an error here; just do nothing
      if (arguments.length === 0) return

      var useAnimation = true

      // collect the moves into an object
      var moves = {}
      for (var i = 0; i < arguments.length; i++) {
        // any "false" to this function means no animations
        if (arguments[i] === false) {
          useAnimation = false
          continue
        }

        // skip invalid arguments
        if (!validMove(arguments[i])) {
          error(2826, 'Invalid move passed to the move method.', arguments[i])
          continue
        }

        var tmp = arguments[i].split('-')
        moves[tmp[0]] = tmp[1]
      }

      // calculate position from moves
      var newPos = calculatePositionFromMoves(CURRENT_POSITION, moves)

      // update the board
      widget.position(newPos, useAnimation)

      // return the new position object
      return newPos
    }

    widget.orientation = function (arg) {
      // no arguments, return the current orientation
      if (arguments.length === 0) {
        return CURRENT_ORIENTATION
      }

      // set to white or black
      if (arg === 'white' || arg === 'black') {
        CURRENT_ORIENTATION = arg
        drawBoard()
        return CURRENT_ORIENTATION
      }

      // flip orientation
      if (arg === 'flip') {
        CURRENT_ORIENTATION = CURRENT_ORIENTATION === 'white' ? 'black' : 'white'
        drawBoard()
        return CURRENT_ORIENTATION
      }

      error(5482, 'Invalid value passed to the orientation method.', arg)
    }

    widget.position = function (position, useAnimation) {
      // no arguments, return the current position
      if (arguments.length === 0) {
        return deepCopy(CURRENT_POSITION)
      }

      // get position as FEN
      if (isString(position) && position.toLowerCase() === 'fen') {
        return objToFen(CURRENT_POSITION)
      }

      // default for useAnimations is true
      if (useAnimation !== false) useAnimation = true

      // start position
      if (isString(position) && position.toLowerCase() === 'start') {
        position = deepCopy(START_POSITION)
      }

      // convert FEN to position object
      if (validFen(position)) {
        position = fenToObj(position)
      }

      // validate position object
      if (!validPositionObject(position)) {
        error(6482, 'Invalid value passed to the position method.', position)
        return
      }

      if (useAnimation) {
        // start the animations
        doAnimations(calculateAnimations(CURRENT_POSITION, position),
                     CURRENT_POSITION,
                     position)

        // set the new position
        setCurrentPosition(position)
      } else {
        // instant update
        setCurrentPosition(position)
        drawPositionInstant()
      }
    }

    function resize () {
      // calulate the new square size
      squareSize = calculateSquareSize()

      // set board width
      $board.css('width', squareSize * 8 + 'px')

      // set drag piece size
      $draggedPieceEl.css({
        height: squareSize,
        width: squareSize
      })

      // spare pieces
      if (cfg.sparePieces) {
        $container
          .find('.' + CSS.sparePieces)
          .css('paddingLeft', squareSize + BOARD_BORDER_SIZE + 'px')
      }

      // redraw the board
      drawBoard()
    }
    widget.resize = resize

    // set the starting position
    function start (useAnimation) {
      widget.position('start', useAnimation)
    }
    widget.start = start

    // -------------------------------------------------------------------------
    // Browser Events
    // -------------------------------------------------------------------------

    function stopDefault (evt) {
      evt.preventDefault()
    }

    function mousedownSquare (evt) {
       // do nothing if we're not draggable
      if (!cfg.draggable) return

      // do nothing if there is no piece on this square
      var square = $(this).attr('data-square')
      if (!validSquare(square)) return
      if (!CURRENT_POSITION.hasOwnProperty(square)) return

      beginDraggingPiece(square, CURRENT_POSITION[square], evt.pageX, evt.pageY)
    }

    function touchstartSquare (e) {
      // do nothing if we're not draggable
      if (!cfg.draggable) return

      // do nothing if there is no piece on this square
      var square = $(this).attr('data-square')
      if (!validSquare(square)) return
      if (!CURRENT_POSITION.hasOwnProperty(square)) return

      e = e.originalEvent
      beginDraggingPiece(
          square,
          CURRENT_POSITION[square],
          e.changedTouches[0].pageX,
          e.changedTouches[0].pageY
        )
    }

    function mousedownSparePiece (evt) {
      // do nothing if sparePieces is not enabled
      if (!cfg.sparePieces) return

      var piece = $(this).attr('data-piece')

      beginDraggingPiece('spare', piece, evt.pageX, evt.pageY)
    }

    function touchstartSparePiece (e) {
      // do nothing if sparePieces is not enabled
      if (!cfg.sparePieces) return

      var piece = $(this).attr('data-piece')

      e = e.originalEvent
      beginDraggingPiece(
          'spare',
          piece,
          e.changedTouches[0].pageX,
          e.changedTouches[0].pageY
        )
    }

    function mousemoveWindow (e) {
      // do nothing if we are not dragging a piece
      if (!DRAGGING_A_PIECE) return

      updateDraggedPiece(e.pageX, e.pageY)
    }

    function touchmoveWindow (e) {
      // do nothing if we are not dragging a piece
      if (!DRAGGING_A_PIECE) return

      // prevent screen from scrolling
      e.preventDefault()

      updateDraggedPiece(
          e.originalEvent.changedTouches[0].pageX,
          e.originalEvent.changedTouches[0].pageY
        )
    }

    function mouseupWindow (e) {
      // do nothing if we are not dragging a piece
      if (!DRAGGING_A_PIECE) return

      // get the location
      var location = isXYOnSquare(e.pageX, e.pageY)

      stopDraggedPiece(location)
    }

    function touchendWindow (e) {
      // do nothing if we are not dragging a piece
      if (!DRAGGING_A_PIECE) return

      // get the location
      var location = isXYOnSquare(e.originalEvent.changedTouches[0].pageX, e.originalEvent.changedTouches[0].pageY)

      stopDraggedPiece(location)
    }

    function mouseenterSquare (e) {
      // do not fire this event if we are dragging a piece
      // NOTE: this should never happen, but it's a safeguard
      if (DRAGGING_A_PIECE) return

      // exit if they did not provide a onMouseoverSquare function
      if (!isFunction(cfg.onMouseoverSquare)) return

      // get the square
      var square = $(e.currentTarget).attr('data-square')

      // NOTE: this should never happen; defensive
      if (!validSquare(square)) return

      // get the piece on this square
      var piece = false
      if (CURRENT_POSITION.hasOwnProperty(square)) {
        piece = CURRENT_POSITION[square]
      }

      // execute their function
      cfg.onMouseoverSquare(square, piece, deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION)
    }

    function mouseleaveSquare (e) {
      // do not fire this event if we are dragging a piece
      // NOTE: this should never happen, but it's a safeguard
      if (DRAGGING_A_PIECE !== false) return

      // exit if they did not provide an onMouseoutSquare function
      if (!isFunction(cfg.onMouseoutSquare)) return

      // get the square
      var square = $(e.currentTarget).attr('data-square')

      // NOTE: this should never happen; defensive
      if (!validSquare(square)) return

      // get the piece on this square
      var piece = false
      if (CURRENT_POSITION.hasOwnProperty(square)) {
        piece = CURRENT_POSITION[square]
      }

      // execute their function
      cfg.onMouseoutSquare(square, piece, deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION)
    }

    // ------------------------------------------------------------------------
    // Initialization
    // -----------------------------------------------------------------------

    function addEvents () {
      // prevent browser "image drag"
      $('body').on('mousedown mousemove', '.' + CSS.piece, stopDefault)

      // mouse drag pieces
      $board.on('mousedown', '.' + CSS.square, mousedownSquare)
      $container.on('mousedown', '.' + CSS.sparePieces + ' .' + CSS.piece, mousedownSparePiece)

      // mouse enter / leave square
      $board
        .on('mouseenter', '.' + CSS.square, mouseenterSquare)
        .on('mouseleave', '.' + CSS.square, mouseleaveSquare)

      // IE doesn't like the events on the window object, but other browsers
      // perform better that way
      if (isMSIE()) {
        // IE-specific prevent browser "image drag"
        document.ondragstart = function () {
          return false
        }

        $('body')
          .on('mousemove', mousemoveWindow)
          .on('mouseup', mouseupWindow)
      } else {
        $(window)
          .on('mousemove', mousemoveWindow)
          .on('mouseup', mouseupWindow)
      }

      // touch drag pieces
      if (isTouchDevice()) {
        $board.on('touchstart', '.' + CSS.square, touchstartSquare)
        $container.on('touchstart', '.' + CSS.sparePieces + ' .' + CSS.piece, touchstartSparePiece)
        $(window)
          .on('touchmove', touchmoveWindow)
          .on('touchend', touchendWindow)
      }
    }

    function initDOM () {
      // create unique IDs for all the elements we will create
      createElIds()

      // build board and save it in memory
      $container.html(buildContainerHTML(cfg.sparePieces))
      $board = $container.find('.' + CSS.board)

      if (cfg.sparePieces) {
        $sparePiecesTop = $container.find('.' + CSS.sparePiecesTop)
        $sparePiecesBottom = $container.find('.' + CSS.sparePiecesBottom)
      }

      // create the drag piece
      var draggedPieceId = uuid()
      $('body').append(buildPiece('wP', true, draggedPieceId))
      $draggedPieceEl = $('#' + draggedPieceId)

      // get the border size
      BOARD_BORDER_SIZE = parseInt($board.css('borderLeftWidth'), 10)

      // set the size and draw the board
      widget.resize()
    }

    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------

    initDOM()
    addEvents()

    // return the widget object
    return widget
  } // end constructor

  // TODO: do module exports here
  window['Chessboard'] = window['Chessboard'] || constructor

  // support legacy ChessBoard name
  window['ChessBoard'] = window['Chessboard']

  // expose util functions
  window['Chessboard']['fenToObj'] = fenToObj
  window['Chessboard']['objToFen'] = objToFen
})() // end anonymous wrapper
