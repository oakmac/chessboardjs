import assert from 'node:assert'
import test from 'node:test'

import { interpolateTemplate, objToFen, START_FEN, START_POSITION, validFen, validPieceCode, validPositionObject, validSquare } from './chessboard.js'

test('interpolateTemplate', () => {
  assert.equal(interpolateTemplate('abc', { a: 'x' }), 'abc')
  assert.equal(interpolateTemplate('{a}bc', {}), '{a}bc')
  assert.equal(interpolateTemplate('{a}bc', { p: 'q' }), '{a}bc')
  assert.equal(interpolateTemplate('{a}bc', { a: 'x' }), 'xbc')
  assert.equal(interpolateTemplate('{a}bc{a}bc', { a: 'x' }), 'xbcxbc')
  assert.equal(interpolateTemplate('{a}{a}{b}', { a: 'x', b: 'y' }), 'xxy')
})

test('objToFen', () => {
  assert.equal(objToFen(START_POSITION), START_FEN)
  assert.equal(objToFen({}), '8/8/8/8/8/8/8/8')
  assert.equal(objToFen({ a2: 'wP', b2: 'bP' }), '8/8/8/8/8/8/Pp6/8')
})

test('validSquare', () => {
  assert.ok(validSquare('a1'))
  assert.ok(validSquare('e2'))
  assert.ok(!validSquare('D2'))
  assert.ok(!validSquare('g9'))
  assert.ok(!validSquare('a'))
  assert.ok(!validSquare(true))
  assert.ok(!validSquare(null))
  assert.ok(!validSquare({}))
})

test('validPieceCode', () => {
  assert.ok(validPieceCode('bP'))
  assert.ok(validPieceCode('bK'))
  assert.ok(validPieceCode('wK'))
  assert.ok(validPieceCode('wR'))
  assert.ok(!validPieceCode('WR'))
  assert.ok(!validPieceCode('Wr'))
  assert.ok(!validPieceCode('a'))
  assert.ok(!validPieceCode(true))
  assert.ok(!validPieceCode(null))
  assert.ok(!validPieceCode({}))
})

test('validFen', () => {
  assert.ok(validFen(START_FEN))
  assert.ok(validFen('8/8/8/8/8/8/8/8'))
  assert.ok(validFen('r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R'))
  assert.ok(validFen('3r3r/1p4pp/2nb1k2/pP3p2/8/PB2PN2/p4PPP/R4RK1 b - - 0 1'))
  assert.ok(!validFen('3r3z/1p4pp/2nb1k2/pP3p2/8/PB2PN2/p4PPP/R4RK1 b - - 0 1'))
  assert.ok(!validFen('anbqkbnr/8/8/8/8/8/PPPPPPPP/8'))
  assert.ok(!validFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/'))
  assert.ok(!validFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBN'))
  assert.ok(!validFen('888888/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'))
  assert.ok(!validFen('888888/pppppppp/74/8/8/8/PPPPPPPP/RNBQKBNR'))
  assert.ok(!validFen({}))
})

test('validPositionObject', () => {
  assert.ok(validPositionObject(START_POSITION))
  assert.ok(validPositionObject({}))
  assert.ok(validPositionObject({ e2: 'wP' }))
  assert.ok(validPositionObject({ e2: 'wP', d2: 'wP' }))
  assert.ok(!validPositionObject({ e2: 'BP' }))
  assert.ok(!validPositionObject({ y2: 'wP' }))
  assert.ok(!validPositionObject(null))
  assert.ok(!validPositionObject('start'))
  assert.ok(!validPositionObject(START_FEN))
})
