/*
var flashRow = function(id) {
  var el = $(document.getElementById(id));
  var bgColor = el.css('background-color');
  el.css('background-color', '#ffff99')
    .animate({backgroundColor: bgColor}, 2000);
};

var isRow = function(id) {
  return id.search(/\:/) !== -1;
};

var clickAnchor = function(e) {
  var id = $(this).attr('href').replace(/docs#/, '');
  if (isRow(id) === true) {
    flashRow(id);
  }
};

var init = function() {
  $('body').on('click', 'a', clickAnchor);

  // give it just a smidge more time to load
  setTimeout(function() {
    if (isRow(window.location.hash) === true) {
      flashRow(window.location.hash.replace('#', ''));
    }
  }, 150);
};

$(document).ready(init);
*/