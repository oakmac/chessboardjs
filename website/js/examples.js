;(function () {
  var $ = window.jQuery

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

  function highlightGroupHeader (groupIndex) {
    $('div#examples_list_container h4').removeClass('active')
    $('h4#group_header_' + groupIndex).addClass('active')
  }

  function highlightExample (id) {
    $('div#examples_list_container li').removeClass('active')
    $('li#example_' + id).addClass('active')
  }

  function showExample (number) {
    var groupIndex = parseInt($('li#example_' + number).parent('ul').attr('id').replace('group_container_', ''), 10)

    $('ul#group_container_' + groupIndex).css('display', '')
    highlightGroupHeader(groupIndex)
    highlightExample(number)

    $('#example_name').html(examples[number].name)
    $('#example_single_page_link').attr('href', 'examples/' + number)
    $('#example_desc_container').html(examples[number].desc)
    $('#example_html_container').html(examples[number].html)
    $('#example_js_container').html('<pre class="prettyprint">' + examples[number].jsStr + '</pre>')
    $('#example_show_html_container').html('<pre class="prettyprint">' + htmlEscape(examples[number].html) + '</pre>')
    examples[number].jsFn()
    prettyPrint()
  }

  function clickExample () {
    var number = parseInt($(this).attr('id').replace('example_', ''), 10)
    if (!examples.hasOwnProperty(number)) return

    window.location.hash = number
    loadExampleFromHash()
  }

  function loadExampleFromHash () {
    var number = parseInt(window.location.hash.replace('#', ''), 10)
    if (!examples.hasOwnProperty(number)) {
      number = 1000
      window.location.hash = number
    }
    showExample(number)
  }

  function clickGroupHeader () {
    var groupIndex = parseInt($(this).attr('id').replace('group_header_', ''), 10)
    var examplesEl = $('ul#group_container_' + groupIndex)
    if (examplesEl.css('display') === 'none') {
      examplesEl.slideDown('fast')
    } else {
      examplesEl.slideUp('fast')
    }
  }

  function init () {
    $('#examples_list_container').on('click', 'li', clickExample)
    $('#examples_list_container').on('click', 'h4', clickGroupHeader)
    loadExampleFromHash()
  }

  $(document).ready(init)
})()
