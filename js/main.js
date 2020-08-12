/* jshint esversion: 6 */
/*
const url = 'docs/pdf.pdf';

let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumIsPending = null;

const scale = 1.5,
  canvas = document.querySelector('#pdf-render'),
  ctx = canvas.getContext('2d');

// Render the page
const renderPage = num => {
  pageIsRendering = true;

    // Get page
  pdfDoc.getPage(num).then(page => {
      // Set scale
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
      canvasContext: ctx,
      viewport
    };

    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });

      // Output current page
    document.querySelector('#page-num').textContent = num;
  });
};

// Check for pages rendering
const queueRenderPage = num => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

// Show Prev Page
const showPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};

// Show Next Page
const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};

// Get Document
pdfjsLib
  .getDocument(url)
  .promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;

    document.querySelector('#page-count').textContent = pdfDoc.numPages;

    renderPage(pageNum);
  })
  .catch(err => {
      // Display error
    const div = document.createElement('div');
    div.className = 'error';
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, canvas);
// Remove top bar
    document.querySelector('.top-bar').style.display = 'none';
  });
*/

let currPg = 1,
    hasSpreads = true,
    renderRange = [currPg];
// Button Events
// document.querySelector('#prev-page').addEventListener('click', showPrevPage);
// document.querySelector('#next-page').addEventListener('click', showNextPage);
document
    .querySelector('#prev-page')
    .addEventListener('click', logThis('prev-page'));
document
    .querySelector('#next-page')
    .addEventListener('click', logThis('next-page'));

function logThis(someString) {
    return () => console.log(someString);
}

function renderPDF(url, canvasContainer, options) {
    options = options || {scale: 1};

    function setRenderRange(currPg) {
        if (hasSpreads) {
            if (currPg % 2 === 1) {
                return [currPg - 1, currPg];
            }
            if (currPg % 2 === 0) {
                return [currPg, currPg + 1];
            }
        }
        return [currPg];
    }

    function renderPage(page) {
        var viewport = page.getViewport({scale: options.scale});
        var wrapper = document.createElement('div');
        wrapper.className = 'canvas-wrapper';
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        wrapper.appendChild(canvas);
        canvasContainer.appendChild(wrapper);

        page.render(renderContext);
    }

    function renderPages(pdfDoc) {
        console.log('pageNum: ' + pdfDoc.numPages);
        console.log('currPg: ' + currPg);
        console.log('spreadRange: ', setRenderRange(currPg));
        renderRange = setRenderRange(currPg);
        // for (var num = 1; num <= pdfDoc.numPages; num++)
        //     pdfDoc.getPage(num).then(renderPage);
        function renderThis(num) {
            console.log('xxx: ', num);
            if (num >= 1 && num <= pdfDoc.numPages) {
                console.log('yyy: ', num);
                return pdfDoc.getPage(num).then(renderPage);
            }
        }
        renderRange.map(renderThis);
    }

    pdfjsLib.disableWorker = true;
    pdfjsLib.getDocument(url).promise.then(renderPages);
}

renderPDF('docs/pdf.pdf', document.getElementById('doc-container'));
