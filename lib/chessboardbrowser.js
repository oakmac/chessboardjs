// chessboard.js v@VERSION
// https://github.com/oakmac/chessboardjs/
//
// Portion Copyright (c) 2019, Chris Oakman
// Portion Copyright (c) 2022, Miika Tuominen
// Released under the MIT license
// https://github.com/oakmac/chessboardjs/blob/master/LICENSE.md

;(function () {
  'use strict'

  const $ = window['jQuery']

  INSERTSOURCE

  // TODO: do module exports here
  window['Chessboard'] = constructor

  // support legacy ChessBoard name
  window['ChessBoard'] = window['Chessboard']

  // expose util functions
  window['Chessboard']['fenToObj'] = fenToObj
  window['Chessboard']['objToFen'] = objToFen
})() // end anonymous wrapper
