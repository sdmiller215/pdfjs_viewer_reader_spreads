/* jshint esversion: 6 */

function renderPDF(url, canvasContainer, options) {
    options = options || {scale: 1};
    var thisPdf = null,
        currPg = 1,
        displayInSpreads = false;

    function showPrevPage() {
        if (currPg <= 1) {
            return;
        }
        if (displayInSpreads) {
            currPg -= 2;
        } else {
            currPg -= 1;
        }
        canvasContainer.innerHTML = '';
        renderPages(thisPdf);
    }

    function showNextPage() {
        if (currPg >= thisPdf.numPages) {
            return;
        }
        if (displayInSpreads) {
            currPg += 2;
        } else {
            currPg += 1;
        }
        canvasContainer.innerHTML = '';
        renderPages(thisPdf);
    }

    // Update the "page x of y" counter in the top-bar
    function showCurrPg() {
        document.getElementById('page-num').innerHTML = currPg;
        document.getElementById('page-count').innerHTML = thisPdf.numPages;
    }

    // Find the current page's opposite in a reader spread. The return is an
    // array of pages to be rendered.
    function setRenderRange(currPg) {
        if (displayInSpreads) {
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
        showCurrPg();
    }

    function renderPages(pdfDoc) {
        thisPdf = pdfDoc;
        // Determine whether or not to display as single page(s) or as reader
        // spreads
        if (pdfDoc.numPages > 3) {
            displayInSpreads = true;
        }
        renderRange = setRenderRange(currPg);
        function renderThis(num) {
            if (num >= 1 && num <= pdfDoc.numPages) {
                return pdfDoc.getPage(num).then(renderPage);
            }
        }
        renderRange.map(renderThis);
    }

    pdfjsLib.disableWorker = true;
    pdfjsLib.getDocument(url).promise.then(renderPages);

    // Add event listeners to the previous and next buttons
    document
        .querySelector('#prev-page')
        .addEventListener('click', showPrevPage);
    document
        .querySelector('#next-page')
        .addEventListener('click', showNextPage);
}

renderPDF('docs/pdf.pdf', document.getElementById('doc-container'));
