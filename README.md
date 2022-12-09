# chessboard.js [![npm](https://img.shields.io/npm/v/@chrisoakman/chessboardjs.svg)](https://www.npmjs.com/package/@chrisoakman/chessboardjs) [![MIT License](https://img.shields.io/npm/l/@chrisoakman/chessboardjs)](https://github.com/oakmac/chessboardjs/blob/master/LICENSE.md)

> **NOTE:** chessboard.js can be found on npm as `@chrisoakman/chessboardjs`

chessboard.js is a JavaScript chessboard component. It depends on [jQuery] v3.4.1 (or higher).

Please see [chessboardjs.com] for documentation and examples.

## Project Status (Dec 2022)

I am currently focusing my efforts on [chessboard2].

[chessboard2]:https://github.com/oakmac/chessboard2

## What is chessboard.js?

chessboard.js is a standalone JavaScript Chess Board. It is designed to be "just
a board" and expose a powerful API so that it can be used in different ways.
Here's a non-exhaustive list of things you can do with chessboard.js:

- Use chessboard.js to show game positions alongside your expert commentary.
- Use chessboard.js to have a tactics website where users have to guess the best
  move.
- Integrate chessboard.js and [chess.js] with a PGN database and allow people to
  search and playback games (see [Example 5000])
- Build a chess server and have users play their games out using the
  chessboard.js board.

chessboard.js is flexible enough to handle any of these situations with relative
ease.

## What can chessboard.js **not** do?

The scope of chessboard.js is limited to "just a board." This is intentional and
makes chessboard.js flexible for building a variety of chess-related
applications.

To be specific, chessboard.js does not understand anything about how the game of
chess is played: how a knight moves, whose turn is it, is White in check?, etc.

Fortunately, the [chess.js] library deals with exactly this sort of problem and
plays nicely with chessboard.js's flexible API. Some examples of chessboard.js
combined with chess.js: [Example 5000], [Example 5001], [Example 5002]

## Docs and Examples

- Docs - <https://chessboardjs.com/docs>
- Examples - <https://chessboardjs.com/examples>

## Developer Tools

```sh
# create a build in the build/ directory
npm run build

# re-build the website
npm run website
```

## License

[MIT License](LICENSE.md)

[jQuery]:https://jquery.com/
[chessboardjs.com]:https://chessboardjs.com
[chess.js]:https://github.com/jhlywa/chess.js
[Example 5000]:https://chessboardjs.com/examples#5000
[Example 5001]:https://chessboardjs.com/examples#5001
[Example 5002]:https://chessboardjs.com/examples#5002
