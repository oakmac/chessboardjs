/* eslint-env browser */
(function () {
  const EXAMPLES = window.CHESSBOARD_EXAMPLES;
  const prettyPrint = window.prettyPrint;

  function htmlEscape(str) {
    return (str + '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&#x2F;')
      .replace(/`/g, '&#x60;');
  }

  function highlightGroupHeader(groupIdx) {
    /** @type {NodeListOf<HTMLDetailsElement>} */(document.querySelectorAll('#examplesNav details'))
      .forEach((x) => {
        x.open = false;
        x.classList.remove('active');
      });
    const details = /** @type {HTMLDetailsElement | null} */(document.getElementById('groupHeader-' + groupIdx));
    if (details != null) {
      details.classList.add('active');
      details.open = true;
    }
  }

  function highlightExampleLink(exampleId) {
    document.querySelectorAll('#examplesNav li').forEach(x => x.classList.remove('active'));
    document.getElementById('exampleLink-' + exampleId)?.classList.add('active');
  }

  function buildExampleBodyHTML(example, id) {
    const html = '<h2 class="hover-linkable">' +
      '<a class="hover-link" href="#' + id + '"></a>' +
      htmlEscape(example.name) +
      '</h2>' +
      '<p>' + example.description + '</p>' +
      '<div class="container-4e1ee">' + example.html + '</div>' +
      '<h4>JavaScript</h4>' +
      '<pre class="prettyprint">' + htmlEscape(example.jsStr) + '</pre>' +
      '<h4>HTML</h4>' +
      '<pre class="prettyprint">' + htmlEscape(example.html) + '</pre>' +
      '<p><a class="small-link-335ea" href="examples/' + id + '" target="_blank">View this example in new window.</a></p>';

    return html;
  }

  function showExample(exampleId) {
    const groupIdx = document.getElementById('exampleLink-' + exampleId)?.closest('ul')?.getAttribute('id')?.replace('groupContainer-', '');

    highlightGroupHeader(groupIdx);
    highlightExampleLink(exampleId);

    document.getElementById('exampleBodyContainer').innerHTML = buildExampleBodyHTML(EXAMPLES[exampleId], exampleId);
    EXAMPLES[exampleId].jsFn();

    prettyPrint();
  }

  function clickExampleNavLink(evt) {
    const exampleId = evt.target.getAttribute('id').replace('exampleLink-', '');
    if (!Object.prototype.hasOwnProperty.call(EXAMPLES, exampleId)) return;

    window.location.hash = exampleId;
    loadExampleFromHash();
  }

  function loadExampleFromHash() {
    let exampleId = parseInt(window.location.hash.replace('#', ''), 10);
    if (!Object.prototype.hasOwnProperty.call(EXAMPLES, exampleId)) {
      exampleId = 1000;
      window.location.hash = exampleId.toString();
    }
    showExample(exampleId);
  }

  const examplesNav = document.getElementById('examplesNav');
  examplesNav.onclick = (evt) => {
    if (evt.target) {
      if (evt.target.matches('li')) {
        clickExampleNavLink(evt);
      }
    }
  };
  loadExampleFromHash();
})();
