<?php
$page_title = 'Home';
$active_nav_tab = 'Home';
include(APP_PATH . 'pages/header.php');
$releases = ChessBoard::getReleases();
$mostRecentVersion = $releases[0]['version'];
?>

<h1>ChessBoardJS is a JavaScript Chess Board Widget</h1>

<hr />

<div class="section">
  <h2>Examples</h2>
  <div style="width: 400px; float: left; margin: 15px 0 0 30px;">
    <div id="board1"></div>
    <input type="button" value="Start" id="startBtn" class="btn" />
    <input type="button" value="Clear" id="clearBtn" class="btn" />
  </div>
  <div style="width: 400px; float: right; margin: 15px 30px 0 0;">
    <h3 id="playerTop">Deep Blue</h3>
    <div id="board2"></div>
    <h3 id="playerBottom">Kasparov</h3>
    <select id="gameSelect">
      <option value="1996-1">1996 Game 1 - Deep Blue vs Kasparov (1 - 0)</option>
      <option value="1996-2">1996 Game 2 - Kasparov vs Deep Blue (1 - 0)</option>
      <option value="1996-3">1996 Game 3 - Deep Blue vs Kasparov (&frac12; - &frac12;)</option>
      <option value="1996-4">1996 Game 4 - Kasparov vs Deep Blue (&frac12; - &frac12;)</option>
      <option value="1996-5">1996 Game 5 - Deep Blue vs Kasparov (0 - 1)</option>
      <option value="1996-6">1996 Game 6 - Kasparov vs Deep Blue (1 - 0)</option>
      <option value="1997-1">1997 Game 1 - Kasparov vs Deep Blue (1 - 0)</option>
      <option value="1997-2">1997 Game 2 - Deep Blue vs Kasparov (1 - 0)</option>
      <option value="1997-3">1997 Game 3 - Kasparov vs Deep Blue (&frac12; - &frac12;)</option>
      <option value="1997-4">1997 Game 4 - Deep Blue vs Kasparov (&frac12; - &frac12;)</option>
      <option value="1997-5">1997 Game 5 - Kasparov vs Deep Blue (&frac12; - &frac12;)</option>
      <option value="1997-6">1997 Game 6 - Deep Blue vs Kasparov (1 - 0)</option>
    </select>
    <input type="button" class="btn" value="&larr; Prev" id="prevBtn" />
    <input type="button" class="btn" value="Next &rarr;" id="nextBtn" />
    <button class="btn" id="playBtn">Play &#9658;</button>
    <button class="btn" id="pauseBtn" style="display:none">Pause <span style="margin-right: -4px">&#10074;</span>&#10074;</button>
    <button class="btn" id="flipBtn">Flip</button>
  </div>
  <div class="clear"></div>
</div>

<!--
<div class="section">
<h2>Usage</h2>
<h4>Code:</h4>
<pre class="prettyprint">
&lt;div id="search_bar"&gt;&lt;/div&gt;
&lt;script src="jquery.js"&gt;&lt;/script&gt;
&lt;script src="autocomplete.js"&gt;&lt;/script&gt;
&lt;script&gt;
var widget = new AutoComplete('search_bar', ['Apple', 'Banana', 'Orange']);
&lt;/script&gt;
</pre>
<h4>Result:</h4>
<div id="search_bar"></div>
</div>
-->

<hr />

<div class="section">
<h2>Get It</h2>
<a class="button large radius" href="releases/<?php echo $mostRecentVersion; ?>/autocomplete-<?php echo $mostRecentVersion; ?>.zip" style="line-height: 22px">
  Download Most Recent Version<br />
  <small style="font-weight: normal; font-size: 12px">v<?php echo $mostRecentVersion; ?></small>
</a>
</div>

<script src="js/json3.min.js"></script>
<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/chessboard.js"></script>
<script>
(function() {
var board1, board2, currentGame, moveIndex;

var deepBlueGames = {
  '1996-1': {
    white: 'Deep Blue',
    black: 'Kasparov',
    moves: ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR","rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR","rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR","rnbqkbnr/pp1ppppp/8/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR","rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR","rnbqkbnr/pp2pppp/8/2pP4/8/2P5/PP1P1PPP/RNBQKBNR","rnb1kbnr/pp2pppp/8/2pq4/8/2P5/PP1P1PPP/RNBQKBNR","rnb1kbnr/pp2pppp/8/2pq4/3P4/2P5/PP3PPP/RNBQKBNR","rnb1kb1r/pp2pppp/5n2/2pq4/3P4/2P5/PP3PPP/RNBQKBNR","rnb1kb1r/pp2pppp/5n2/2pq4/3P4/2P2N2/PP3PPP/RNBQKB1R","rn2kb1r/pp2pppp/5n2/2pq4/3P2b1/2P2N2/PP3PPP/RNBQKB1R","rn2kb1r/pp2pppp/5n2/2pq4/3P2b1/2P2N2/PP2BPPP/RNBQK2R","rn2kb1r/pp3ppp/4pn2/2pq4/3P2b1/2P2N2/PP2BPPP/RNBQK2R","rn2kb1r/pp3ppp/4pn2/2pq4/3P2b1/2P2N1P/PP2BPP1/RNBQK2R","rn2kb1r/pp3ppp/4pn2/2pq3b/3P4/2P2N1P/PP2BPP1/RNBQK2R","rn2kb1r/pp3ppp/4pn2/2pq3b/3P4/2P2N1P/PP2BPP1/RNBQ1RK1","r3kb1r/pp3ppp/2n1pn2/2pq3b/3P4/2P2N1P/PP2BPP1/RNBQ1RK1","r3kb1r/pp3ppp/2n1pn2/2pq3b/3P4/2P1BN1P/PP2BPP1/RN1Q1RK1","r3kb1r/pp3ppp/2n1pn2/3q3b/3p4/2P1BN1P/PP2BPP1/RN1Q1RK1","r3kb1r/pp3ppp/2n1pn2/3q3b/3P4/4BN1P/PP2BPP1/RN1Q1RK1","r3k2r/pp3ppp/2n1pn2/3q3b/1b1P4/4BN1P/PP2BPP1/RN1Q1RK1","r3k2r/pp3ppp/2n1pn2/3q3b/1b1P4/P3BN1P/1P2BPP1/RN1Q1RK1","r3k2r/pp3ppp/2n1pn2/b2q3b/3P4/P3BN1P/1P2BPP1/RN1Q1RK1","r3k2r/pp3ppp/2n1pn2/b2q3b/3P4/P1N1BN1P/1P2BPP1/R2Q1RK1","r3k2r/pp3ppp/2nqpn2/b6b/3P4/P1N1BN1P/1P2BPP1/R2Q1RK1","r3k2r/pp3ppp/2nqpn2/bN5b/3P4/P3BN1P/1P2BPP1/R2Q1RK1","r3k2r/pp2qppp/2n1pn2/bN5b/3P4/P3BN1P/1P2BPP1/R2Q1RK1","r3k2r/pp2qppp/2n1pn2/bN2N2b/3P4/P3B2P/1P2BPP1/R2Q1RK1","r3k2r/pp2qppp/2n1pn2/bN2N3/3P4/P3B2P/1P2bPP1/R2Q1RK1","r3k2r/pp2qppp/2n1pn2/bN2N3/3P4/P3B2P/1P2QPP1/R4RK1","r4rk1/pp2qppp/2n1pn2/bN2N3/3P4/P3B2P/1P2QPP1/R4RK1","r4rk1/pp2qppp/2n1pn2/bN2N3/3P4/P3B2P/1P2QPP1/2R2RK1","2r2rk1/pp2qppp/2n1pn2/bN2N3/3P4/P3B2P/1P2QPP1/2R2RK1","2r2rk1/pp2qppp/2n1pn2/bN2N1B1/3P4/P6P/1P2QPP1/2R2RK1","2r2rk1/pp2qppp/1bn1pn2/1N2N1B1/3P4/P6P/1P2QPP1/2R2RK1","2r2rk1/pp2qppp/1bn1pB2/1N2N3/3P4/P6P/1P2QPP1/2R2RK1","2r2rk1/pp2qp1p/1bn1pp2/1N2N3/3P4/P6P/1P2QPP1/2R2RK1","2r2rk1/pp2qp1p/1bn1pp2/1N6/2NP4/P6P/1P2QPP1/2R2RK1","2rr2k1/pp2qp1p/1bn1pp2/1N6/2NP4/P6P/1P2QPP1/2R2RK1","2rr2k1/pp2qp1p/1Nn1pp2/1N6/3P4/P6P/1P2QPP1/2R2RK1","2rr2k1/1p2qp1p/1pn1pp2/1N6/3P4/P6P/1P2QPP1/2R2RK1","2rr2k1/1p2qp1p/1pn1pp2/1N6/3P4/P6P/1P2QPP1/2RR2K1","2rr2k1/1p2qp1p/1pn1p3/1N3p2/3P4/P6P/1P2QPP1/2RR2K1","2rr2k1/1p2qp1p/1pn1p3/1N3p2/3P4/P3Q2P/1P3PP1/2RR2K1","2rr2k1/1p3p1p/1pn1pq2/1N3p2/3P4/P3Q2P/1P3PP1/2RR2K1","2rr2k1/1p3p1p/1pn1pq2/1N1P1p2/8/P3Q2P/1P3PP1/2RR2K1","2r3k1/1p3p1p/1pn1pq2/1N1r1p2/8/P3Q2P/1P3PP1/2RR2K1","2r3k1/1p3p1p/1pn1pq2/1N1R1p2/8/P3Q2P/1P3PP1/2R3K1","2r3k1/1p3p1p/1pn2q2/1N1p1p2/8/P3Q2P/1P3PP1/2R3K1","2r3k1/1p3p1p/1pn2q2/1N1p1p2/8/PP2Q2P/5PP1/2R3K1","2r4k/1p3p1p/1pn2q2/1N1p1p2/8/PP2Q2P/5PP1/2R3K1","2r4k/1p3p1p/1Qn2q2/1N1p1p2/8/PP5P/5PP1/2R3K1","6rk/1p3p1p/1Qn2q2/1N1p1p2/8/PP5P/5PP1/2R3K1","6rk/1p3p1p/2n2q2/1NQp1p2/8/PP5P/5PP1/2R3K1","6rk/1p3p1p/2n2q2/1NQ2p2/3p4/PP5P/5PP1/2R3K1","6rk/1p3p1p/2nN1q2/2Q2p2/3p4/PP5P/5PP1/2R3K1","6rk/1p3p1p/2nN1q2/2Q5/3p1p2/PP5P/5PP1/2R3K1","6rk/1N3p1p/2n2q2/2Q5/3p1p2/PP5P/5PP1/2R3K1","6rk/1N3p1p/5q2/2Q1n3/3p1p2/PP5P/5PP1/2R3K1","6rk/1N3p1p/5q2/3Qn3/3p1p2/PP5P/5PP1/2R3K1","6rk/1N3p1p/5q2/3Qn3/3p4/PP3p1P/5PP1/2R3K1","6rk/1N3p1p/5q2/3Qn3/3p4/PP3pPP/5P2/2R3K1","6rk/1N3p1p/5q2/3Q4/3p4/PP1n1pPP/5P2/2R3K1","6rk/1NR2p1p/5q2/3Q4/3p4/PP1n1pPP/5P2/6K1","4r2k/1NR2p1p/5q2/3Q4/3p4/PP1n1pPP/5P2/6K1","4r2k/2R2p1p/3N1q2/3Q4/3p4/PP1n1pPP/5P2/6K1","7k/2R2p1p/3N1q2/3Q4/3p4/PP1n1pPP/5P2/4r1K1","7k/2R2p1p/3N1q2/3Q4/3p4/PP1n1pPP/5P1K/4r3","7k/2R2p1p/3N1q2/3Q4/3p4/PP3pPP/5n1K/4r3","7k/2R2N1p/5q2/3Q4/3p4/PP3pPP/5n1K/4r3","8/2R2Nkp/5q2/3Q4/3p4/PP3pPP/5n1K/4r3","8/2R3kp/5q2/3Q2N1/3p4/PP3pPP/5n1K/4r3","8/2R4p/5q1k/3Q2N1/3p4/PP3pPP/5n1K/4r3","8/7R/5q1k/3Q2N1/3p4/PP3pPP/5n1K/4r3"]
  },    
  '1996-2': ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR","rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R","rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKB1R","rnbqkbnr/ppp1pppp/8/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R","rnbqkbnr/ppp2ppp/4p3/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R","rnbqkbnr/ppp2ppp/4p3/3p4/3P4/5NP1/PPP1PP1P/RNBQKB1R","rnbqkbnr/pp3ppp/4p3/2pp4/3P4/5NP1/PPP1PP1P/RNBQKB1R","rnbqkbnr/pp3ppp/4p3/2pp4/3P4/5NP1/PPP1PPBP/RNBQK2R","r1bqkbnr/pp3ppp/2n1p3/2pp4/3P4/5NP1/PPP1PPBP/RNBQK2R","r1bqkbnr/pp3ppp/2n1p3/2pp4/3P4/5NP1/PPP1PPBP/RNBQ1RK1","r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P4/5NP1/PPP1PPBP/RNBQ1RK1","r1bqkb1r/pp3ppp/2n1pn2/2pp4/2PP4/5NP1/PP2PPBP/RNBQ1RK1","r1bqkb1r/pp3ppp/2n1pn2/2p5/2pP4/5NP1/PP2PPBP/RNBQ1RK1","r1bqkb1r/pp3ppp/2n1pn2/2p1N3/2pP4/6P1/PP2PPBP/RNBQ1RK1","r2qkb1r/pp1b1ppp/2n1pn2/2p1N3/2pP4/6P1/PP2PPBP/RNBQ1RK1","r2qkb1r/pp1b1ppp/2n1pn2/2p1N3/2pP4/N5P1/PP2PPBP/R1BQ1RK1","r2qkb1r/pp1b1ppp/2n1pn2/4N3/2pp4/N5P1/PP2PPBP/R1BQ1RK1","r2qkb1r/pp1b1ppp/2n1pn2/4N3/2Np4/6P1/PP2PPBP/R1BQ1RK1","r2qk2r/pp1b1ppp/2n1pn2/2b1N3/2Np4/6P1/PP2PPBP/R1BQ1RK1","r2qk2r/pp1b1ppp/2n1pn2/2b1N3/2Np4/1Q4P1/PP2PPBP/R1B2RK1","r2q1rk1/pp1b1ppp/2n1pn2/2b1N3/2Np4/1Q4P1/PP2PPBP/R1B2RK1","r2q1rk1/pQ1b1ppp/2n1pn2/2b1N3/2Np4/6P1/PP2PPBP/R1B2RK1","r2q1rk1/pQ1b1ppp/4pn2/2b1n3/2Np4/6P1/PP2PPBP/R1B2RK1","r2q1rk1/pQ1b1ppp/4pn2/2b1N3/3p4/6P1/PP2PPBP/R1B2RK1","1r1q1rk1/pQ1b1ppp/4pn2/2b1N3/3p4/6P1/PP2PPBP/R1B2RK1","1r1q1rk1/p2b1ppp/4pn2/2b1N3/3p4/5QP1/PP2PPBP/R1B2RK1","1r1q1rk1/p2b1ppp/3bpn2/4N3/3p4/5QP1/PP2PPBP/R1B2RK1","1r1q1rk1/p2b1ppp/2Nbpn2/8/3p4/5QP1/PP2PPBP/R1B2RK1","1r1q1rk1/p4ppp/2bbpn2/8/3p4/5QP1/PP2PPBP/R1B2RK1","1r1q1rk1/p4ppp/2Qbpn2/8/3p4/6P1/PP2PPBP/R1B2RK1","1r1q1rk1/p4ppp/2Qb1n2/4p3/3p4/6P1/PP2PPBP/R1B2RK1","1r1q1rk1/p4ppp/2Qb1n2/4p3/3p4/6P1/PP2PPBP/1RB2RK1","3q1rk1/p4ppp/1rQb1n2/4p3/3p4/6P1/PP2PPBP/1RB2RK1","3q1rk1/p4ppp/1r1b1n2/4p3/Q2p4/6P1/PP2PPBP/1RB2RK1","1q3rk1/p4ppp/1r1b1n2/4p3/Q2p4/6P1/PP2PPBP/1RB2RK1","1q3rk1/p4ppp/1r1b1n2/4p1B1/Q2p4/6P1/PP2PPBP/1R3RK1","1q3rk1/p3bppp/1r3n2/4p1B1/Q2p4/6P1/PP2PPBP/1R3RK1","1q3rk1/p3bppp/1r3n2/4p1B1/QP1p4/6P1/P3PPBP/1R3RK1","1q3rk1/p4ppp/1r3n2/4p1B1/Qb1p4/6P1/P3PPBP/1R3RK1","1q3rk1/p4ppp/1r3B2/4p3/Qb1p4/6P1/P3PPBP/1R3RK1","1q3rk1/p4p1p/1r3p2/4p3/Qb1p4/6P1/P3PPBP/1R3RK1","1q3rk1/p2Q1p1p/1r3p2/4p3/1b1p4/6P1/P3PPBP/1R3RK1","2q2rk1/p2Q1p1p/1r3p2/4p3/1b1p4/6P1/P3PPBP/1R3RK1","2q2rk1/Q4p1p/1r3p2/4p3/1b1p4/6P1/P3PPBP/1R3RK1","1rq2rk1/Q4p1p/5p2/4p3/1b1p4/6P1/P3PPBP/1R3RK1","1rq2rk1/5p1p/5p2/4p3/Qb1p4/6P1/P3PPBP/1R3RK1","1rq2rk1/5p1p/5p2/4p3/Q2p4/2b3P1/P3PPBP/1R3RK1","1Rq2rk1/5p1p/5p2/4p3/Q2p4/2b3P1/P3PPBP/5RK1","1q3rk1/5p1p/5p2/4p3/Q2p4/2b3P1/P3PPBP/5RK1","1q3rk1/5p1p/5p2/4p3/Q2pB3/2b3P1/P3PP1P/5RK1","5rk1/2q2p1p/5p2/4p3/Q2pB3/2b3P1/P3PP1P/5RK1","5rk1/2q2p1p/Q4p2/4p3/3pB3/2b3P1/P3PP1P/5RK1","5r2/2q2pkp/Q4p2/4p3/3pB3/2b3P1/P3PP1P/5RK1","5r2/2q2pkp/5p2/4p3/3pB3/2bQ2P1/P3PP1P/5RK1","1r6/2q2pkp/5p2/4p3/3pB3/2bQ2P1/P3PP1P/5RK1","1r6/2q2pkB/5p2/4p3/3p4/2bQ2P1/P3PP1P/5RK1","8/2q2pkB/5p2/4p3/3p4/2bQ2P1/Pr2PP1P/5RK1","8/2q2pk1/5p2/4p3/3pB3/2bQ2P1/Pr2PP1P/5RK1","8/2q2pk1/5p2/4p3/3pB3/2bQ2P1/r3PP1P/5RK1","8/2q2pk1/5p2/4p3/3pB2P/2bQ2P1/r3PP2/5RK1","2q5/5pk1/5p2/4p3/3pB2P/2bQ2P1/r3PP2/5RK1","2q5/5pk1/5p2/4p3/3pB2P/2b2QP1/r3PP2/5RK1","2q5/5pk1/5p2/4p3/3pB2P/2b2QP1/4PP2/r4RK1","2q5/5pk1/5p2/4p3/3pB2P/2b2QP1/4PP2/R5K1","2q5/5pk1/5p2/4p3/3pB2P/5QP1/4PP2/b5K1","2q5/5pk1/5p2/4p2Q/3pB2P/6P1/4PP2/b5K1","7q/5pk1/5p2/4p2Q/3pB2P/6P1/4PP2/b5K1","7q/5pk1/5p2/4p3/3pB1QP/6P1/4PP2/b5K1","5k1q/5p2/5p2/4p3/3pB1QP/6P1/4PP2/b5K1","2Q2k1q/5p2/5p2/4p3/3pB2P/6P1/4PP2/b5K1","2Q4q/5pk1/5p2/4p3/3pB2P/6P1/4PP2/b5K1","7q/5pk1/5p2/4p3/3pB1QP/6P1/4PP2/b5K1","5k1q/5p2/5p2/4p3/3pB1QP/6P1/4PP2/b5K1","5k1q/5p2/5p2/3Bp3/3p2QP/6P1/4PP2/b5K1","7q/4kp2/5p2/3Bp3/3p2QP/6P1/4PP2/b5K1","7q/4kp2/2B2p2/4p3/3p2QP/6P1/4PP2/b5K1","5k1q/5p2/2B2p2/4p3/3p2QP/6P1/4PP2/b5K1","5k1q/5p2/5p2/3Bp3/3p2QP/6P1/4PP2/b5K1","7q/4kp2/5p2/3Bp3/3p2QP/6P1/4PP2/b5K1","7q/4kp2/5p2/3Bp3/3p3P/5QP1/4PP2/b5K1","7q/4kp2/5p2/3Bp3/3p3P/2b2QP1/4PP2/6K1","7q/4kp2/5p2/4p3/2Bp3P/2b2QP1/4PP2/6K1","2q5/4kp2/5p2/4p3/2Bp3P/2b2QP1/4PP2/6K1","2q5/4kp2/5p2/3Qp3/2Bp3P/2b3P1/4PP2/6K1","8/4kp2/4qp2/3Qp3/2Bp3P/2b3P1/4PP2/6K1","8/4kp2/4qp2/1Q2p3/2Bp3P/2b3P1/4PP2/6K1","8/3qkp2/5p2/1Q2p3/2Bp3P/2b3P1/4PP2/6K1","8/3qkp2/5p2/2Q1p3/2Bp3P/2b3P1/4PP2/6K1","8/4kp2/3q1p2/2Q1p3/2Bp3P/2b3P1/4PP2/6K1","8/Q3kp2/3q1p2/4p3/2Bp3P/2b3P1/4PP2/6K1","8/Q2qkp2/5p2/4p3/2Bp3P/2b3P1/4PP2/6K1","Q7/3qkp2/5p2/4p3/2Bp3P/2b3P1/4PP2/6K1","Q7/2q1kp2/5p2/4p3/2Bp3P/2b3P1/4PP2/6K1","8/2q1kp2/5p2/4p3/2Bp3P/Q1b3P1/4PP2/6K1","8/4kp2/3q1p2/4p3/2Bp3P/Q1b3P1/4PP2/6K1","8/4kp2/3q1p2/4p3/2Bp3P/2b3P1/Q3PP2/6K1","8/4kp2/3q4/4pp2/2Bp3P/2b3P1/Q3PP2/6K1","8/4kB2/3q4/4pp2/3p3P/2b3P1/Q3PP2/6K1","8/4kB2/3q4/5p2/3pp2P/2b3P1/Q3PP2/6K1","8/4k3/3q4/5p1B/3pp2P/2b3P1/Q3PP2/6K1","8/4k3/5q2/5p1B/3pp2P/2b3P1/Q3PP2/6K1","8/4k3/5q2/5p1B/3pp2P/Q1b3P1/4PP2/6K1","8/3k4/5q2/5p1B/3pp2P/Q1b3P1/4PP2/6K1","8/Q2k4/5q2/5p1B/3pp2P/2b3P1/4PP2/6K1","3k4/Q7/5q2/5p1B/3pp2P/2b3P1/4PP2/6K1","1Q1k4/8/5q2/5p1B/3pp2P/2b3P1/4PP2/6K1","1Q6/3k4/5q2/5p1B/3pp2P/2b3P1/4PP2/6K1","1Q2B3/3k4/5q2/5p2/3pp2P/2b3P1/4PP2/6K1","1Q2B3/4k3/5q2/5p2/3pp2P/2b3P1/4PP2/6K1","1Q6/4k3/5q2/1B3p2/3pp2P/2b3P1/4PP2/6K1","1Q6/4k3/5q2/1B3p2/3pp2P/6P1/3bPP2/6K1","8/2Q1k3/5q2/1B3p2/3pp2P/6P1/3bPP2/6K1","5k2/2Q5/5q2/1B3p2/3pp2P/6P1/3bPP2/6K1","5k2/2Q5/5q2/5p2/2Bpp2P/6P1/3bPP2/6K1","5k2/2Q5/5q2/5p2/2Bpp2P/2b3P1/4PP2/6K1","5k2/2Q5/5q2/5p2/2Bpp2P/2b3P1/4PPK1/8","5k2/2Q5/5q2/5p2/2Bpp2P/6P1/4PPK1/4b3","5k2/2Q5/5q2/5p2/2Bpp2P/6P1/4PP2/4bK2","5k2/2Q5/5q2/5p2/2Bpp2P/2b3P1/4PP2/5K2","5k2/2Q5/5q2/5p2/2BppP1P/2b3P1/4P3/5K2","5k2/2Q5/5q2/5p2/2Bp3P/2b2pP1/4P3/5K2","5k2/2Q5/5q2/5p2/2Bp3P/2b2PP1/8/5K2","5k2/2Q5/5q2/5p2/2Bp3P/5PP1/3b4/5K2","5k2/2Q5/5q2/5p2/2Bp1P1P/6P1/3b4/5K2","4k3/2Q5/5q2/5p2/2Bp1P1P/6P1/3b4/5K2","2Q1k3/8/5q2/5p2/2Bp1P1P/6P1/3b4/5K2","2Q5/4k3/5q2/5p2/2Bp1P1P/6P1/3b4/5K2","8/4k3/5q2/2Q2p2/2Bp1P1P/6P1/3b4/5K2","3k4/8/5q2/2Q2p2/2Bp1P1P/6P1/3b4/5K2","3k4/8/5q2/2Q2p2/3p1P1P/3B2P1/3b4/5K2","3k4/8/5q2/2Q2p2/3p1P1P/3Bb1P1/8/5K2","3k4/8/5q2/5Q2/3p1P1P/3Bb1P1/8/5K2","3k4/8/2q5/5Q2/3p1P1P/3Bb1P1/8/5K2","3k1Q2/8/2q5/8/3p1P1P/3Bb1P1/8/5K2","5Q2/2k5/2q5/8/3p1P1P/3Bb1P1/8/5K2","8/2k1Q3/2q5/8/3p1P1P/3Bb1P1/8/5K2","2k5/4Q3/2q5/8/3p1P1P/3Bb1P1/8/5K2","2k5/4Q3/2q5/5B2/3p1P1P/4b1P1/8/5K2","1k6/4Q3/2q5/5B2/3p1P1P/4b1P1/8/5K2","1k1Q4/8/2q5/5B2/3p1P1P/4b1P1/8/5K2","3Q4/1k6/2q5/5B2/3p1P1P/4b1P1/8/5K2","8/1k1Q4/2q5/5B2/3p1P1P/4b1P1/8/5K2","8/1k1q4/8/5B2/3p1P1P/4b1P1/8/5K2","8/1k1B4/8/8/3p1P1P/4b1P1/8/5K2","8/2kB4/8/8/3p1P1P/4b1P1/8/5K2","8/2k5/8/1B6/3p1P1P/4b1P1/8/5K2"],
  '1996-3': ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR","rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR","rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR","rnbqkbnr/pp1ppppp/8/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR","rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR","rnbqkbnr/pp2pppp/8/2pP4/8/2P5/PP1P1PPP/RNBQKBNR","rnb1kbnr/pp2pppp/8/2pq4/8/2P5/PP1P1PPP/RNBQKBNR","rnb1kbnr/pp2pppp/8/2pq4/3P4/2P5/PP3PPP/RNBQKBNR","rnb1kb1r/pp2pppp/5n2/2pq4/3P4/2P5/PP3PPP/RNBQKBNR","rnb1kb1r/pp2pppp/5n2/2pq4/3P4/2P2N2/PP3PPP/RNBQKB1R","rn2kb1r/pp2pppp/5n2/2pq4/3P2b1/2P2N2/PP3PPP/RNBQKB1R","rn2kb1r/pp2pppp/5n2/2pq4/3P2b1/2P2N2/PP2BPPP/RNBQK2R","rn2kb1r/pp3ppp/4pn2/2pq4/3P2b1/2P2N2/PP2BPPP/RNBQK2R","rn2kb1r/pp3ppp/4pn2/2pq4/3P2b1/2P2N2/PP2BPPP/RNBQ1RK1","r3kb1r/pp3ppp/2n1pn2/2pq4/3P2b1/2P2N2/PP2BPPP/RNBQ1RK1","r3kb1r/pp3ppp/2n1pn2/2pq4/3P2b1/2P1BN2/PP2BPPP/RN1Q1RK1","r3kb1r/pp3ppp/2n1pn2/3q4/3p2b1/2P1BN2/PP2BPPP/RN1Q1RK1","r3kb1r/pp3ppp/2n1pn2/3q4/3P2b1/4BN2/PP2BPPP/RN1Q1RK1","r3k2r/pp3ppp/2n1pn2/3q4/1b1P2b1/4BN2/PP2BPPP/RN1Q1RK1","r3k2r/pp3ppp/2n1pn2/3q4/1b1P2b1/P3BN2/1P2BPPP/RN1Q1RK1","r3k2r/pp3ppp/2n1pn2/b2q4/3P2b1/P3BN2/1P2BPPP/RN1Q1RK1","r3k2r/pp3ppp/2n1pn2/b2q4/3P2b1/P1N1BN2/1P2BPPP/R2Q1RK1","r3k2r/pp3ppp/2nqpn2/b7/3P2b1/P1N1BN2/1P2BPPP/R2Q1RK1","r3k2r/pp3ppp/2nqpn2/b3N3/3P2b1/P1N1B3/1P2BPPP/R2Q1RK1","r3k2r/pp3ppp/2nqpn2/b3N3/3P4/P1N1B3/1P2bPPP/R2Q1RK1","r3k2r/pp3ppp/2nqpn2/b3N3/3P4/P1N1B3/1P2QPPP/R4RK1","r3k2r/pp3ppp/2nqpn2/4N3/3P4/P1b1B3/1P2QPPP/R4RK1","r3k2r/pp3ppp/2nqpn2/4N3/3P4/P1P1B3/4QPPP/R4RK1","r3k2r/pp3ppp/3qpn2/4n3/3P4/P1P1B3/4QPPP/R4RK1","r3k2r/pp3ppp/3qpn2/4n3/3P1B2/P1P5/4QPPP/R4RK1","r3k2r/pp3ppp/3qpn2/8/3P1B2/P1P2n2/4QPPP/R4RK1","r3k2r/pp3ppp/3qpn2/8/3P1B2/P1P2Q2/5PPP/R4RK1","r3k2r/pp3ppp/4pn2/3q4/3P1B2/P1P2Q2/5PPP/R4RK1","r3k2r/pp3ppp/4pn2/3q4/3P1B2/P1PQ4/5PPP/R4RK1","2r1k2r/pp3ppp/4pn2/3q4/3P1B2/P1PQ4/5PPP/R4RK1","2r1k2r/pp3ppp/4pn2/3q4/3P1B2/P1PQ4/5PPP/R1R3K1","2r1k2r/pp3ppp/4pn2/8/2qP1B2/P1PQ4/5PPP/R1R3K1","2r1k2r/pp3ppp/4pn2/8/2QP1B2/P1P5/5PPP/R1R3K1","4k2r/pp3ppp/4pn2/8/2rP1B2/P1P5/5PPP/R1R3K1","4k2r/pp3ppp/4pn2/8/2rP1B2/P1P5/5PPP/RR4K1","4k2r/p4ppp/1p2pn2/8/2rP1B2/P1P5/5PPP/RR4K1","1B2k2r/p4ppp/1p2pn2/8/2rP4/P1P5/5PPP/RR4K1","1B2k2r/p4ppp/1p2pn2/8/r2P4/P1P5/5PPP/RR4K1","1B2k2r/p4ppp/1p2pn2/8/rR1P4/P1P5/5PPP/R5K1","1B2k2r/p4ppp/1p2pn2/r7/1R1P4/P1P5/5PPP/R5K1","1B2k2r/p4ppp/1p2pn2/r7/2RP4/P1P5/5PPP/R5K1","1B3rk1/p4ppp/1p2pn2/r7/2RP4/P1P5/5PPP/R5K1","5rk1/p4ppp/1p1Bpn2/r7/2RP4/P1P5/5PPP/R5K1","r5k1/p4ppp/1p1Bpn2/r7/2RP4/P1P5/5PPP/R5K1","r5k1/p4ppp/1pRBpn2/r7/3P4/P1P5/5PPP/R5K1","r5k1/p4ppp/2RBpn2/rp6/3P4/P1P5/5PPP/R5K1","r5k1/p4ppp/2RBpn2/rp6/3P4/P1P5/5PPP/R4K2","r5k1/p4ppp/2RBpn2/1p6/r2P4/P1P5/5PPP/R4K2","r5k1/p4ppp/2RBpn2/1p6/r2P4/P1P5/5PPP/1R3K2","r5k1/5ppp/p1RBpn2/1p6/r2P4/P1P5/5PPP/1R3K2","r5k1/5ppp/p1RBpn2/1p6/r2P4/P1P5/4KPPP/1R6","r5k1/5pp1/p1RBpn2/1p5p/r2P4/P1P5/4KPPP/1R6","r5k1/5pp1/p1RBpn2/1p5p/r2P4/P1PK4/5PPP/1R6","3r2k1/5pp1/p1RBpn2/1p5p/r2P4/P1PK4/5PPP/1R6","3r2k1/4Bpp1/p1R1pn2/1p5p/r2P4/P1PK4/5PPP/1R6","6k1/3rBpp1/p1R1pn2/1p5p/r2P4/P1PK4/5PPP/1R6","6k1/3r1pp1/p1R1pB2/1p5p/r2P4/P1PK4/5PPP/1R6","6k1/3r1p2/p1R1pp2/1p5p/r2P4/P1PK4/5PPP/1R6","6k1/3r1p2/p1R1pp2/1p5p/r2P4/PRPK4/5PPP/8","8/3r1pk1/p1R1pp2/1p5p/r2P4/PRPK4/5PPP/8","8/3r1pk1/p1R1pp2/1p5p/r2P4/PRP1K3/5PPP/8","8/3r1pk1/p1R2p2/1p2p2p/r2P4/PRP1K3/5PPP/8","8/3r1pk1/p1R2p2/1p2p2p/r2P4/PRP1K1P1/5P1P/8","8/3r1pk1/p1R2p2/1p5p/r2p4/PRP1K1P1/5P1P/8","8/3r1pk1/p1R2p2/1p5p/r2P4/PR2K1P1/5P1P/8","8/4rpk1/p1R2p2/1p5p/r2P4/PR2K1P1/5P1P/8","8/4rpk1/p1R2p2/1p5p/r2P4/PR3KP1/5P1P/8","8/3r1pk1/p1R2p2/1p5p/r2P4/PR3KP1/5P1P/8","8/3r1pk1/p1R2p2/1p5p/r2P4/P2R1KP1/5P1P/8","8/3r1pk1/p1R2p2/1p5p/3r4/P2R1KP1/5P1P/8","8/3r1pk1/p1R2p2/1p5p/3R4/P4KP1/5P1P/8","8/5pk1/p1R2p2/1p5p/3r4/P4KP1/5P1P/8","8/5pk1/R4p2/1p5p/3r4/P4KP1/5P1P/8","8/5pk1/R4p2/7p/1p1r4/P4KP1/5P1P/8"],
  '1996-4': ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR","rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R","rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKB1R","rnbqkbnr/ppp1pppp/8/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R","rnbqkbnr/pp2pppp/2p5/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R","rnbqkbnr/pp2pppp/2p5/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R","rnbqkbnr/pp3ppp/2p1p3/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R","rnbqkbnr/pp3ppp/2p1p3/3p4/2PP4/5N2/PP1NPPPP/R1BQKB1R","rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/5N2/PP1NPPPP/R1BQKB1R","rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/4PN2/PP1N1PPP/R1BQKB1R","r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/4PN2/PP1N1PPP/R1BQKB1R","r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/3BPN2/PP1N1PPP/R1BQK2R","r1bqk2r/pp1n1ppp/2pbpn2/3p4/2PP4/3BPN2/PP1N1PPP/R1BQK2R","r1bqk2r/pp1n1ppp/2pbpn2/3p4/2PPP3/3B1N2/PP1N1PPP/R1BQK2R","r1bqk2r/pp1n1ppp/2pbpn2/8/2PPp3/3B1N2/PP1N1PPP/R1BQK2R","r1bqk2r/pp1n1ppp/2pbpn2/8/2PPN3/3B1N2/PP3PPP/R1BQK2R","r1bqk2r/pp1n1ppp/2pbp3/8/2PPn3/3B1N2/PP3PPP/R1BQK2R","r1bqk2r/pp1n1ppp/2pbp3/8/2PPB3/5N2/PP3PPP/R1BQK2R","r1bq1rk1/pp1n1ppp/2pbp3/8/2PPB3/5N2/PP3PPP/R1BQK2R","r1bq1rk1/pp1n1ppp/2pbp3/8/2PPB3/5N2/PP3PPP/R1BQ1RK1","r1bq1rk1/pp1n1pp1/2pbp2p/8/2PPB3/5N2/PP3PPP/R1BQ1RK1","r1bq1rk1/pp1n1pp1/2pbp2p/8/2PP4/5N2/PPB2PPP/R1BQ1RK1","r1bq1rk1/pp1n1pp1/2pb3p/4p3/2PP4/5N2/PPB2PPP/R1BQ1RK1","r1bq1rk1/pp1n1pp1/2pb3p/4p3/2PP4/5N2/PPB2PPP/R1BQR1K1","r1bq1rk1/pp1n1pp1/2pb3p/8/2Pp4/5N2/PPB2PPP/R1BQR1K1","r1bq1rk1/pp1n1pp1/2pb3p/8/2PQ4/5N2/PPB2PPP/R1B1R1K1","r1bq1rk1/pp1n1pp1/2p4p/2b5/2PQ4/5N2/PPB2PPP/R1B1R1K1","r1bq1rk1/pp1n1pp1/2p4p/2b5/2P5/2Q2N2/PPB2PPP/R1B1R1K1","r1bq1rk1/1p1n1pp1/2p4p/p1b5/2P5/2Q2N2/PPB2PPP/R1B1R1K1","r1bq1rk1/1p1n1pp1/2p4p/p1b5/2P5/P1Q2N2/1PB2PPP/R1B1R1K1","r1bq1rk1/1p3pp1/2p2n1p/p1b5/2P5/P1Q2N2/1PB2PPP/R1B1R1K1","r1bq1rk1/1p3pp1/2p2n1p/p1b5/2P5/P1Q1BN2/1PB2PPP/R3R1K1","r1bq1rk1/1p3pp1/2p2n1p/p7/2P5/P1Q1bN2/1PB2PPP/R3R1K1","r1bq1rk1/1p3pp1/2p2n1p/p7/2P5/P1Q1RN2/1PB2PPP/R5K1","r2q1rk1/1p3pp1/2p2n1p/p7/2P3b1/P1Q1RN2/1PB2PPP/R5K1","r2q1rk1/1p3pp1/2p2n1p/p3N3/2P3b1/P1Q1R3/1PB2PPP/R5K1","r2qr1k1/1p3pp1/2p2n1p/p3N3/2P3b1/P1Q1R3/1PB2PPP/R5K1","r2qr1k1/1p3pp1/2p2n1p/p3N3/2P3b1/P1Q1R3/1PB2PPP/4R1K1","r2qr1k1/1p3pp1/2p1bn1p/p3N3/2P5/P1Q1R3/1PB2PPP/4R1K1","r2qr1k1/1p3pp1/2p1bn1p/p3N3/2P2P2/P1Q1R3/1PB3PP/4R1K1","r1q1r1k1/1p3pp1/2p1bn1p/p3N3/2P2P2/P1Q1R3/1PB3PP/4R1K1","r1q1r1k1/1p3pp1/2p1bn1p/p3N3/2P2P2/P1Q1R2P/1PB3P1/4R1K1","r1q1r1k1/5pp1/2p1bn1p/pp2N3/2P2P2/P1Q1R2P/1PB3P1/4R1K1","r1q1r1k1/5pp1/2p1bn1p/pp2NP2/2P5/P1Q1R2P/1PB3P1/4R1K1","r1q1r1k1/5pp1/2p2n1p/pp2NP2/2b5/P1Q1R2P/1PB3P1/4R1K1","r1q1r1k1/5pp1/2p2n1p/pp3P2/2N5/P1Q1R2P/1PB3P1/4R1K1","r1q1r1k1/5pp1/2p2n1p/p4P2/2p5/P1Q1R2P/1PB3P1/4R1K1","r1q1R1k1/5pp1/2p2n1p/p4P2/2p5/P1Q4P/1PB3P1/4R1K1","r1q1n1k1/5pp1/2p4p/p4P2/2p5/P1Q4P/1PB3P1/4R1K1","r1q1n1k1/5pp1/2p4p/p4P2/2p1R3/P1Q4P/1PB3P1/6K1","r1q3k1/5pp1/2p2n1p/p4P2/2p1R3/P1Q4P/1PB3P1/6K1","r1q3k1/5pp1/2p2n1p/p4P2/2R5/P1Q4P/1PB3P1/6K1","r1q3k1/5pp1/2p4p/p2n1P2/2R5/P1Q4P/1PB3P1/6K1","r1q3k1/5pp1/2p4p/p2nQP2/2R5/P6P/1PB3P1/6K1","r5k1/3q1pp1/2p4p/p2nQP2/2R5/P6P/1PB3P1/6K1","r5k1/3q1pp1/2p4p/p2nQP2/6R1/P6P/1PB3P1/6K1","r5k1/3q2p1/2p2p1p/p2nQP2/6R1/P6P/1PB3P1/6K1","r5k1/3q2p1/2p2p1p/p2n1P2/3Q2R1/P6P/1PB3P1/6K1","r7/3q2pk/2p2p1p/p2n1P2/3Q2R1/P6P/1PB3P1/6K1","r7/3q2pk/2p2p1p/p2n1P2/3QR3/P6P/1PB3P1/6K1","3r4/3q2pk/2p2p1p/p2n1P2/3QR3/P6P/1PB3P1/6K1","3r4/3q2pk/2p2p1p/p2n1P2/3QR3/P6P/1PB3P1/7K","3r4/2q3pk/2p2p1p/p2n1P2/3QR3/P6P/1PB3P1/7K","3r4/2q3pk/2p2p1p/p2n1P2/4R3/P6P/1PB2QP1/7K","1q1r4/6pk/2p2p1p/p2n1P2/4R3/P6P/1PB2QP1/7K","1q1r4/6pk/2p2p1p/p2n1P2/B3R3/P6P/1P3QP1/7K","1q1r4/6pk/5p1p/p1pn1P2/B3R3/P6P/1P3QP1/7K","1q1r4/6pk/2B2p1p/p1pn1P2/4R3/P6P/1P3QP1/7K","1q1r4/6pk/2B2p1p/p2n1P2/2p1R3/P6P/1P3QP1/7K","1q1r4/6pk/2B2p1p/p2n1P2/2R5/P6P/1P3QP1/7K","1q1r4/6pk/2B2p1p/p4P2/1nR5/P6P/1P3QP1/7K","1q1r4/6pk/5p1p/p4P2/1nR5/P4B1P/1P3QP1/7K","1q1r4/6pk/5p1p/p4P2/2R5/P2n1B1P/1P3QP1/7K","1q1r4/6pk/5p1p/p4P2/2R4Q/P2n1B1P/1P4P1/7K","3r4/6pk/5p1p/p4P2/2R4Q/P2n1B1P/1q4P1/7K","3r4/6pk/5p1p/p4P2/2R5/P2n1BQP/1q4P1/7K","3r4/6pk/5p1p/p4P2/2R5/q2n1BQP/6P1/7K","3r4/2R3pk/5p1p/p4P2/8/q2n1BQP/6P1/7K","3r1q2/2R3pk/5p1p/p4P2/8/3n1BQP/6P1/7K","3r1q2/R5pk/5p1p/p4P2/8/3n1BQP/6P1/7K","3r1q2/R5pk/5p1p/p3nP2/8/5BQP/6P1/7K","3r1q2/6pk/5p1p/R3nP2/8/5BQP/6P1/7K","3r4/5qpk/5p1p/R3nP2/8/5BQP/6P1/7K","3r4/5qpk/5p1p/4RP2/8/5BQP/6P1/7K","3r4/5qpk/7p/4pP2/8/5BQP/6P1/7K","3r4/5qpk/7p/4QP2/8/5B1P/6P1/7K","4r3/5qpk/7p/4QP2/8/5B1P/6P1/7K","4r3/5qpk/7p/5P2/5Q2/5B1P/6P1/7K","4r3/6pk/5q1p/5P2/5Q2/5B1P/6P1/7K","4r3/6pk/5q1p/5P1B/5Q2/7P/6P1/7K","5r2/6pk/5q1p/5P1B/5Q2/7P/6P1/7K","5r2/6pk/5qBp/5P2/5Q2/7P/6P1/7K","5r1k/6p1/5qBp/5P2/5Q2/7P/6P1/7K","5r1k/2Q3p1/5qBp/5P2/8/7P/6P1/7K","5r1k/2Q3p1/6Bp/5P2/3q4/7P/6P1/7K","5r1k/2Q3p1/6Bp/5P2/3q4/7P/6PK/8","r6k/2Q3p1/6Bp/5P2/3q4/7P/6PK/8","r6k/2Q3p1/7p/5P1B/3q4/7P/6PK/8","r6k/2Q3p1/5q1p/5P1B/8/7P/6PK/8","r6k/2Q3p1/5qBp/5P2/8/7P/6PK/8","6rk/2Q3p1/5qBp/5P2/8/7P/6PK/8"],
  '1996-5': ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR","rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR","rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR","rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R","rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R","rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R","r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R","r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R","r1bqkb1r/pppp1ppp/2n2n2/8/3pP3/2N2N2/PPP2PPP/R1BQKB1R","r1bqkb1r/pppp1ppp/2n2n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R","r1bqk2r/pppp1ppp/2n2n2/8/1b1NP3/2N5/PPP2PPP/R1BQKB1R","r1bqk2r/pppp1ppp/2N2n2/8/1b2P3/2N5/PPP2PPP/R1BQKB1R","r1bqk2r/p1pp1ppp/2p2n2/8/1b2P3/2N5/PPP2PPP/R1BQKB1R","r1bqk2r/p1pp1ppp/2p2n2/8/1b2P3/2NB4/PPP2PPP/R1BQK2R","r1bqk2r/p1p2ppp/2p2n2/3p4/1b2P3/2NB4/PPP2PPP/R1BQK2R","r1bqk2r/p1p2ppp/2p2n2/3P4/1b6/2NB4/PPP2PPP/R1BQK2R","r1bqk2r/p1p2ppp/5n2/3p4/1b6/2NB4/PPP2PPP/R1BQK2R","r1bqk2r/p1p2ppp/5n2/3p4/1b6/2NB4/PPP2PPP/R1BQ1RK1","r1bq1rk1/p1p2ppp/5n2/3p4/1b6/2NB4/PPP2PPP/R1BQ1RK1","r1bq1rk1/p1p2ppp/5n2/3p2B1/1b6/2NB4/PPP2PPP/R2Q1RK1","r1bq1rk1/p4ppp/2p2n2/3p2B1/1b6/2NB4/PPP2PPP/R2Q1RK1","r1bq1rk1/p4ppp/2p2n2/3p2B1/1b6/2NB1Q2/PPP2PPP/R4RK1","r1bq1rk1/p3bppp/2p2n2/3p2B1/8/2NB1Q2/PPP2PPP/R4RK1","r1bq1rk1/p3bppp/2p2n2/3p2B1/8/2NB1Q2/PPP2PPP/4RRK1","r1bqr1k1/p3bppp/2p2n2/3p2B1/8/2NB1Q2/PPP2PPP/4RRK1","r1bqr1k1/p3bppp/2p2n2/3p2B1/8/3B1Q2/PPP1NPPP/4RRK1","r1bqr1k1/p3bpp1/2p2n1p/3p2B1/8/3B1Q2/PPP1NPPP/4RRK1","r1bqr1k1/p3bpp1/2p2n1p/3p4/5B2/3B1Q2/PPP1NPPP/4RRK1","r1bqr1k1/p4pp1/2pb1n1p/3p4/5B2/3B1Q2/PPP1NPPP/4RRK1","r1bqr1k1/p4pp1/2pb1n1p/3p4/3N1B2/3B1Q2/PPP2PPP/4RRK1","r2qr1k1/p4pp1/2pb1n1p/3p4/3N1Bb1/3B1Q2/PPP2PPP/4RRK1","r2qr1k1/p4pp1/2pb1n1p/3p4/3N1Bb1/3B2Q1/PPP2PPP/4RRK1","r2qr1k1/p4pp1/2p2n1p/3p4/3N1bb1/3B2Q1/PPP2PPP/4RRK1","r2qr1k1/p4pp1/2p2n1p/3p4/3N1Qb1/3B4/PPP2PPP/4RRK1","r3r1k1/p4pp1/1qp2n1p/3p4/3N1Qb1/3B4/PPP2PPP/4RRK1","r3r1k1/p4pp1/1qp2n1p/3p4/2PN1Qb1/3B4/PP3PPP/4RRK1","r3r1k1/p2b1pp1/1qp2n1p/3p4/2PN1Q2/3B4/PP3PPP/4RRK1","r3r1k1/p2b1pp1/1qp2n1p/3P4/3N1Q2/3B4/PP3PPP/4RRK1","r3r1k1/p2b1pp1/1q3n1p/3p4/3N1Q2/3B4/PP3PPP/4RRK1","r3R1k1/p2b1pp1/1q3n1p/3p4/3N1Q2/3B4/PP3PPP/5RK1","4r1k1/p2b1pp1/1q3n1p/3p4/3N1Q2/3B4/PP3PPP/5RK1","4r1k1/p2b1pp1/1q3n1p/3p4/3N4/3B4/PP1Q1PPP/5RK1","4r1k1/p2b1pp1/1q5p/3p4/3Nn3/3B4/PP1Q1PPP/5RK1","4r1k1/p2b1pp1/1q5p/3p4/3NB3/8/PP1Q1PPP/5RK1","4r1k1/p2b1pp1/1q5p/8/3Np3/8/PP1Q1PPP/5RK1","4r1k1/p2b1pp1/1q5p/8/3Np3/1P6/P2Q1PPP/5RK1","3r2k1/p2b1pp1/1q5p/8/3Np3/1P6/P2Q1PPP/5RK1","3r2k1/p2b1pp1/1q5p/8/3Np3/1PQ5/P4PPP/5RK1","3r2k1/p2b2p1/1q5p/5p2/3Np3/1PQ5/P4PPP/5RK1","3r2k1/p2b2p1/1q5p/5p2/3Np3/1PQ5/P4PPP/3R2K1","3r2k1/p5p1/1q2b2p/5p2/3Np3/1PQ5/P4PPP/3R2K1","3r2k1/p5p1/1q2b2p/5p2/3Np3/1P2Q3/P4PPP/3R2K1","3r2k1/p4bp1/1q5p/5p2/3Np3/1P2Q3/P4PPP/3R2K1","3r2k1/p4bp1/1q5p/5p2/3Np3/1PQ5/P4PPP/3R2K1","3r2k1/p4bp1/1q5p/8/3Npp2/1PQ5/P4PPP/3R2K1","3r2k1/p4bp1/1q5p/8/3Npp2/1PQ5/P2R1PPP/6K1","3r2k1/p4bp1/5q1p/8/3Npp2/1PQ5/P2R1PPP/6K1","3r2k1/p4bp1/5q1p/8/3Npp2/1PQ3P1/P2R1P1P/6K1","6k1/p4bp1/5q1p/3r4/3Npp2/1PQ3P1/P2R1P1P/6K1","6k1/p4bp1/5q1p/3r4/3Npp2/PPQ3P1/3R1P1P/6K1","8/p4bpk/5q1p/3r4/3Npp2/PPQ3P1/3R1P1P/6K1","8/p4bpk/5q1p/3r4/3Npp2/PPQ3P1/3R1PKP/8","8/p4bpk/7p/3rq3/3Npp2/PPQ3P1/3R1PKP/8","8/p4bpk/7p/3rq3/3Npp2/PPQ2PP1/3R2KP/8","8/p4bpk/7p/3rq3/3N1p2/PPQ1pPP1/3R2KP/8","8/p4bpk/7p/3rq3/3N1p2/PPQRpPP1/6KP/8","8/p4bpk/7p/3rq3/3N1p2/PPQR1PP1/4p1KP/8","8/p4bpk/7p/3rq3/3N1P2/PPQR1P2/4p1KP/8","8/p4bpk/7p/3rq3/3N1P2/PPQR1P2/6KP/4q3","8/p4bpk/7p/3rP3/3N4/PPQR1P2/6KP/4q3","8/p4bpk/7p/3rP3/3N4/PPqR1P2/6KP/8","8/p4bpk/7p/3rP3/3N4/PPR2P2/6KP/8","8/p4bpk/7p/4P3/3r4/PPR2P2/6KP/8","8/p4bpk/7p/4P3/1P1r4/P1R2P2/6KP/8","8/p5pk/7p/4P3/1Pbr4/P1R2P2/6KP/8","8/p5pk/7p/4P3/1Pbr4/P1R2P2/5K1P/8","8/p6k/7p/4P1p1/1Pbr4/P1R2P2/5K1P/8","8/p6k/7p/4P1p1/1Pbr4/P3RP2/5K1P/8","8/p6k/4b2p/4P1p1/1P1r4/P3RP2/5K1P/8","8/p6k/4b2p/4P1p1/1P1r4/P1R2P2/5K1P/8","8/p6k/7p/4P1p1/1Pbr4/P1R2P2/5K1P/8","8/p6k/7p/4P1p1/1Pbr4/P3RP2/5K1P/8","8/p6k/7p/4P1p1/1Pb5/P3RP2/3r1K1P/8","8/p6k/7p/4P1p1/1Pb5/P3RP2/3r3P/4K3","8/p6k/7p/4P1p1/1Pb5/P2rRP2/7P/4K3","8/p6k/7p/4P1p1/1Pb5/P2rRP2/5K1P/8","8/p7/6kp/4P1p1/1Pb5/P2rRP2/5K1P/8","8/p7/6kp/4P1p1/1Pb5/P2R1P2/5K1P/8","8/p7/6kp/4P1p1/1P6/P2b1P2/5K1P/8","8/p7/6kp/4P1p1/1P6/P2bKP2/7P/8","8/p7/6kp/4P1p1/1P6/P3KP2/2b4P/8","8/p7/6kp/4P1p1/1P1K4/P4P2/2b4P/8","8/p7/7p/4Pkp1/1P1K4/P4P2/2b4P/8","8/p7/7p/3KPkp1/1P6/P4P2/2b4P/8","8/p7/8/3KPkpp/1P6/P4P2/2b4P/8"],
  '1996-6': ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR","rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R","rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKB1R","rnbqkbnr/ppp1pppp/8/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R","rnbqkbnr/pp2pppp/2p5/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R","rnbqkbnr/pp2pppp/2p5/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R","rnbqkbnr/pp3ppp/2p1p3/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R","rnbqkbnr/pp3ppp/2p1p3/3p4/2PP4/5N2/PP1NPPPP/R1BQKB1R","rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/5N2/PP1NPPPP/R1BQKB1R","rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/4PN2/PP1N1PPP/R1BQKB1R","rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/4PN2/PP1N1PPP/R1BQKB1R","rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/1P2PN2/P2N1PPP/R1BQKB1R","r1bqkb1r/pp3ppp/2n1pn2/2pp4/2PP4/1P2PN2/P2N1PPP/R1BQKB1R","r1bqkb1r/pp3ppp/2n1pn2/2pp4/2PP4/1P2PN2/PB1N1PPP/R2QKB1R","r1bqkb1r/pp3ppp/2n1pn2/3p4/2Pp4/1P2PN2/PB1N1PPP/R2QKB1R","r1bqkb1r/pp3ppp/2n1pn2/3p4/2PP4/1P3N2/PB1N1PPP/R2QKB1R","r1bqk2r/pp2bppp/2n1pn2/3p4/2PP4/1P3N2/PB1N1PPP/R2QKB1R","r1bqk2r/pp2bppp/2n1pn2/3p4/2PP4/1P3N2/PB1N1PPP/2RQKB1R","r1bq1rk1/pp2bppp/2n1pn2/3p4/2PP4/1P3N2/PB1N1PPP/2RQKB1R","r1bq1rk1/pp2bppp/2n1pn2/3p4/2PP4/1P1B1N2/PB1N1PPP/2RQK2R","r2q1rk1/pp1bbppp/2n1pn2/3p4/2PP4/1P1B1N2/PB1N1PPP/2RQK2R","r2q1rk1/pp1bbppp/2n1pn2/3p4/2PP4/1P1B1N2/PB1N1PPP/2RQ1RK1","r2q1rk1/pp1bbppp/2n1p3/3p3n/2PP4/1P1B1N2/PB1N1PPP/2RQ1RK1","r2q1rk1/pp1bbppp/2n1p3/3p3n/2PP4/1P1B1N2/PB1N1PPP/2RQR1K1","r2q1rk1/pp1bbppp/2n1p3/3p4/2PP1n2/1P1B1N2/PB1N1PPP/2RQR1K1","r2q1rk1/pp1bbppp/2n1p3/3p4/2PP1n2/1P3N2/PB1N1PPP/1BRQR1K1","r2q1rk1/pp1b1ppp/2nbp3/3p4/2PP1n2/1P3N2/PB1N1PPP/1BRQR1K1","r2q1rk1/pp1b1ppp/2nbp3/3p4/2PP1n2/1P3NP1/PB1N1P1P/1BRQR1K1","r2q1rk1/pp1b1ppp/2nbp1n1/3p4/2PP4/1P3NP1/PB1N1P1P/1BRQR1K1","r2q1rk1/pp1b1ppp/2nbp1n1/3pN3/2PP4/1P4P1/PB1N1P1P/1BRQR1K1","2rq1rk1/pp1b1ppp/2nbp1n1/3pN3/2PP4/1P4P1/PB1N1P1P/1BRQR1K1","2rq1rk1/pp1N1ppp/2nbp1n1/3p4/2PP4/1P4P1/PB1N1P1P/1BRQR1K1","2r2rk1/pp1q1ppp/2nbp1n1/3p4/2PP4/1P4P1/PB1N1P1P/1BRQR1K1","2r2rk1/pp1q1ppp/2nbp1n1/3p4/2PP4/1P3NP1/PB3P1P/1BRQR1K1","2r2rk1/pp1q1ppp/2n1p1n1/3p4/1bPP4/1P3NP1/PB3P1P/1BRQR1K1","2r2rk1/pp1q1ppp/2n1p1n1/3p4/1bPP4/1P2RNP1/PB3P1P/1BRQ2K1","2rr2k1/pp1q1ppp/2n1p1n1/3p4/1bPP4/1P2RNP1/PB3P1P/1BRQ2K1","2rr2k1/pp1q1ppp/2n1p1n1/3p4/1bPP3P/1P2RNP1/PB3P2/1BRQ2K1","2rr2k1/pp1qnppp/2n1p3/3p4/1bPP3P/1P2RNP1/PB3P2/1BRQ2K1","2rr2k1/pp1qnppp/2n1p3/3p4/1bPP3P/PP2RNP1/1B3P2/1BRQ2K1","2rr2k1/pp1qnppp/2n1p3/b2p4/2PP3P/PP2RNP1/1B3P2/1BRQ2K1","2rr2k1/pp1qnppp/2n1p3/b2p4/1PPP3P/P3RNP1/1B3P2/1BRQ2K1","2rr2k1/ppbqnppp/2n1p3/3p4/1PPP3P/P3RNP1/1B3P2/1BRQ2K1","2rr2k1/ppbqnppp/2n1p3/2Pp4/1P1P3P/P3RNP1/1B3P2/1BRQ2K1","2r1r1k1/ppbqnppp/2n1p3/2Pp4/1P1P3P/P3RNP1/1B3P2/1BRQ2K1","2r1r1k1/ppbqnppp/2n1p3/2Pp4/1P1P3P/P2QRNP1/1B3P2/1BR3K1","2r1r1k1/ppbqnp1p/2n1p1p1/2Pp4/1P1P3P/P2QRNP1/1B3P2/1BR3K1","2r1r1k1/ppbqnp1p/2n1p1p1/2Pp4/1P1P3P/P2Q1NP1/1B2RP2/1BR3K1","2r1r1k1/ppbq1p1p/2n1p1p1/2Pp1n2/1P1P3P/P2Q1NP1/1B2RP2/1BR3K1","2r1r1k1/ppbq1p1p/2n1p1p1/2Pp1n2/1P1P3P/P1BQ1NP1/4RP2/1BR3K1","2r1r1k1/ppbq1p2/2n1p1p1/2Pp1n1p/1P1P3P/P1BQ1NP1/4RP2/1BR3K1","2r1r1k1/ppbq1p2/2n1p1p1/1PPp1n1p/3P3P/P1BQ1NP1/4RP2/1BR3K1","2r1r1k1/ppbqnp2/4p1p1/1PPp1n1p/3P3P/P1BQ1NP1/4RP2/1BR3K1","2r1r1k1/ppbqnp2/4p1p1/1PPp1n1p/3P3P/P2Q1NP1/3BRP2/1BR3K1","2r1r3/ppbqnpk1/4p1p1/1PPp1n1p/3P3P/P2Q1NP1/3BRP2/1BR3K1","2r1r3/ppbqnpk1/4p1p1/1PPp1n1p/P2P3P/3Q1NP1/3BRP2/1BR3K1","r3r3/ppbqnpk1/4p1p1/1PPp1n1p/P2P3P/3Q1NP1/3BRP2/1BR3K1","r3r3/ppbqnpk1/4p1p1/PPPp1n1p/3P3P/3Q1NP1/3BRP2/1BR3K1","r3r3/1pbqnpk1/p3p1p1/PPPp1n1p/3P3P/3Q1NP1/3BRP2/1BR3K1","r3r3/1pbqnpk1/pP2p1p1/P1Pp1n1p/3P3P/3Q1NP1/3BRP2/1BR3K1","rb2r3/1p1qnpk1/pP2p1p1/P1Pp1n1p/3P3P/3Q1NP1/3BRP2/1BR3K1","rb2r3/1p1qnpk1/pP2p1p1/P1Pp1n1p/3P3P/3Q1NP1/2BBRP2/2R3K1","rb2r3/1p1q1pk1/pPn1p1p1/P1Pp1n1p/3P3P/3Q1NP1/2BBRP2/2R3K1","rb2r3/1p1q1pk1/pPn1p1p1/P1Pp1n1p/B2P3P/3Q1NP1/3BRP2/2R3K1","rb6/1p1qrpk1/pPn1p1p1/P1Pp1n1p/B2P3P/3Q1NP1/3BRP2/2R3K1","rb6/1p1qrpk1/pPn1p1p1/P1Pp1n1p/B2P3P/2BQ1NP1/4RP2/2R3K1","rb6/1p1qrpk1/pP2p1p1/P1Ppnn1p/B2P3P/2BQ1NP1/4RP2/2R3K1","rb6/1p1qrpk1/pP2p1p1/P1PpPn1p/B6P/2BQ1NP1/4RP2/2R3K1","rb6/1p2rpk1/pP2p1p1/P1PpPn1p/q6P/2BQ1NP1/4RP2/2R3K1","rb6/1p2rpk1/pP2p1p1/P1PpPn1p/q2N3P/2BQ2P1/4RP2/2R3K1","rb6/1p2rpk1/pP2p1p1/P1PpP2p/q2n3P/2BQ2P1/4RP2/2R3K1","rb6/1p2rpk1/pP2p1p1/P1PpP2p/q2Q3P/2B3P1/4RP2/2R3K1","rb6/1p1qrpk1/pP2p1p1/P1PpP2p/3Q3P/2B3P1/4RP2/2R3K1","rb6/1p1qrpk1/pP2p1p1/P1PpP2p/3Q3P/6P1/3BRP2/2R3K1","rb2r3/1p1q1pk1/pP2p1p1/P1PpP2p/3Q3P/6P1/3BRP2/2R3K1","rb2r3/1p1q1pk1/pP2p1p1/P1PpP1Bp/3Q3P/6P1/4RP2/2R3K1","rbr5/1p1q1pk1/pP2p1p1/P1PpP1Bp/3Q3P/6P1/4RP2/2R3K1","rbr5/1p1q1pk1/pP2pBp1/P1PpP2p/3Q3P/6P1/4RP2/2R3K1","rbr5/1p1q1p1k/pP2pBp1/P1PpP2p/3Q3P/6P1/4RP2/2R3K1","rbr5/1p1q1p1k/pPP1pBp1/P2pP2p/3Q3P/6P1/4RP2/2R3K1","rbr5/3q1p1k/pPp1pBp1/P2pP2p/3Q3P/6P1/4RP2/2R3K1","rbr5/3q1p1k/pPp1pBp1/P1QpP2p/7P/6P1/4RP2/2R3K1","rbr5/3q1p2/pPp1pBpk/P1QpP2p/7P/6P1/4RP2/2R3K1","rbr5/3q1p2/pPp1pBpk/P1QpP2p/7P/6P1/1R3P2/2R3K1","rbr5/1q3p2/pPp1pBpk/P1QpP2p/7P/6P1/1R3P2/2R3K1","rbr5/1q3p2/pPp1pBpk/P1QpP2p/1R5P/6P1/5P2/2R3K1"],
  '1997-1': true
};

/*
var board2InitialPosition = {
  b7: 'bK',
  c2: 'wR',
  d6: 'wK'
};

var moves = [
  'b7-b8',
  'd6-d7',
  'b8-b7',
  'c2-b2',
  'b7-a8',
  'd7-c7',
  'a8-a7',
  'b2-a2'
];

var index = 0;
var nextMove = function() {
  board2.move(moves[index]);
  index++;
  if (index === (moves.length + 1)) {
    index = 0;
    window.setTimeout(function() {
      board2.position(board2InitialPosition);
      window.setTimeout(nextMove, 750);
    }, 3000);
  }
  else {
    window.setTimeout(nextMove, 750);
  }
};
*/

var changeGameSelect = function() {
  currentGame = $('#gameSelect').val();
  moveIndex = 0;
  board2.position(deepBlueGames[currentGame][moveIndex]);
};

var clickPrevBtn = function() {
  if (moveIndex === 0) return;

  moveIndex--;
  board2.position(deepBlueGames[currentGame][moveIndex]);
};

var clickNextBtn = function() {
  if ((moveIndex+1) >= deepBlueGames[currentGame].length) return;

  moveIndex++;
  board2.position(deepBlueGames[currentGame][moveIndex]);
};

var clickPlayBtn = function() {

};

var clickPauseBtn = function() {

};

var clickFlipBtn = function() {
  board2.flip();
};

var addEvents = function() {
  $('#startBtn').on('click', board1.start);
  $('#clearBtn').on('click', board1.clear);

  $('#gameSelect').on('change', changeGameSelect);
  $('#prevBtn').on('click', clickPrevBtn);
  $('#nextBtn').on('click', clickNextBtn);
  $('#playBtn').on('click', clickPlayBtn);
  $('#pauseBtn').on('click', clickPauseBtn);
  $('#flipBtn').on('click', clickFlipBtn);
};

var init = function() {
  board1 = new ChessBoard('board1', {
    position: 'start',
    dropOffBoard: 'trash',
    sparePieces: true
  });
  board2 = new ChessBoard('board2');

  addEvents();

  changeGameSelect();
};
$(document).ready(init);

})();
</script>

<?php
include(APP_PATH . 'pages/footer.php');
?>