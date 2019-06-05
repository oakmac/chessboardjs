;(function () {
  var $ = window.jQuery
  var EXAMPLES = window.CHESSBOARD_EXAMPLES
  var prettyPrint = window.prettyPrint

  function htmlEscape (str) {
    return (str + '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&#x2F;')
      .replace(/`/g, '&#x60;')
  }

  function highlightGroupHeader (groupIdx) {
    $('#examplesNav h4').removeClass('active')
    $('#groupHeader-' + groupIdx).addClass('active')
  }

  function highlightExampleLink (exampleId) {
    $('#examplesNav li').removeClass('active')
    $('#exampleLink-' + exampleId).addClass('active')
  }

  function buildExampleBodyHTML (example, id) {
    var html = '<h2 class="hover-linkable">' +
        '<a class="hover-link" href="#' + id + '"></a>' +
        htmlEscape(example.name) +
      '</h2>' +
      '<p>' + example.description + '</p>' +
      '<div class="container-4e1ee">' + example.html + '</div>' +
      '<h4>JavaScript</h4>' +
      '<pre class="prettyprint">' + htmlEscape(example.jsStr) + '</pre>' +
      '<h4>HTML</h4>' +
      '<pre class="prettyprint">' + htmlEscape(example.html) + '</pre>' +
      '<p><a class="small-link-335ea" href="examples/' + id + '" target="_blank">View this example in new window.</a></p>'

    return html
  }

  function showExample (exampleId) {
    var groupIdx = $('#exampleLink-' + exampleId).parent('ul').attr('id').replace('groupContainer-', '')

    $('#groupContainer-' + groupIdx).css('display', '')
    highlightGroupHeader(groupIdx)
    highlightExampleLink(exampleId)

    $('#exampleBodyContainer').html(buildExampleBodyHTML(EXAMPLES[exampleId], exampleId))
    EXAMPLES[exampleId].jsFn()

    prettyPrint()
  }

  function clickExampleNavLink () {
    var exampleId = $(this).attr('id').replace('exampleLink-', '')
    if (!EXAMPLES.hasOwnProperty(exampleId)) return

    window.location.hash = exampleId
    loadExampleFromHash()
  }

  function loadExampleFromHash () {
    var exampleId = parseInt(window.location.hash.replace('#', ''), 10)
    if (!EXAMPLES.hasOwnProperty(exampleId)) {
      exampleId = 1000
      window.location.hash = exampleId
    }
    showExample(exampleId)
  }

  function clickGroupHeader () {
    var groupIdx = $(this).attr('id').replace('groupHeader-', '')
    var $examplesList = $('#groupContainer-' + groupIdx)
    if ($examplesList.css('display') === 'none') {
      $examplesList.slideDown('fast')
    } else {
      $examplesList.slideUp('fast')
    }
  }

  function init () {
    $('#examplesNav').on('click', 'li', clickExampleNavLink)
    $('#examplesNav').on('click', 'h4', clickGroupHeader)
    loadExampleFromHash()
  }

  $(document).ready(init)
})()
