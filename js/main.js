/* jshint esversion: 6 */

var pdfObj = {
    currPg: 1,
    pgCount: 1,
    pgWidth: 612,
    pgHeight: 792,
    scale: 1,
    displayInSpreads: false,
    pgNumInputField: document.getElementById('pg-num'),
    pgTotalElement: document.getElementById('page-count'),
    docContainer: document.getElementById('doc-container'),
    topBarElement: document.getElementById('top-bar'),

    // Display the previous page or spread
    showPrevPage: function() {
        // if (pdfObj.currPg <= 1) {
        //     return;
        // }
        if (pdfObj.displayInSpreads) {
            pdfObj.currPg -= 2;
        } else {
            pdfObj.currPg -= 1;
        }
        if (pdfObj.currPg < 1) {
            pdfObj.currPg = 1;
        }
        pdfObj.canvasContainer.innerHTML = '';
        pdfObj.renderPages();
    },

    // Display the next page or spread
    showNextPage: function() {
        // if (pdfObj.currPg >= pdfObj.pgCount) {
        //     return;
        // }
        if (pdfObj.displayInSpreads) {
            pdfObj.currPg += 2;
        } else {
            pdfObj.currPg += 1;
        }
        if (pdfObj.currPg > pdfObj.pgCount) {
            pdfObj.currPg = pdfObj.pgCount;
        }
        pdfObj.canvasContainer.innerHTML = '';
        pdfObj.renderPages();
    },

    // Display page 1
    showFirstPage: function() {
        if (pdfObj.currPg == 1) {
            return;
        }
        pdfObj.currPg = 1;
        pdfObj.canvasContainer.innerHTML = '';
        pdfObj.renderPages();
    },

    // Display the last page
    showLastPage: function() {
        if (pdfObj.currPg == pdfObj.pgCount) {
            return;
        }
        pdfObj.currPg = pdfObj.pgCount;
        pdfObj.canvasContainer.innerHTML = '';
        pdfObj.renderPages();
    },

    // Dipsplay page x. Where x is input from a text field
    jumpToPg: function(key) {
        if (key.keyCode == 13) {
            var newPgNum = parseInt(key.target.value);
            if (key.target.value < 1) {
                newPgNum = 1;
            }
            if (key.target.value > pdfObj.pgCount) {
                newPgNum = pdfObj.pgCount;
            }
            pdfObj.currPg = newPgNum;
            pdfObj.canvasContainer.innerHTML = '';
            pdfObj.renderPages();
        }
    },

    // Update the "page x of y" counter in the top-bar
    showCurrPg: function() {
        pdfObj.pgNumInputField.value = '';
        pdfObj.pgNumInputField.placeholder = pdfObj.currPg;
        pdfObj.pgTotalElement.innerHTML = pdfObj.pgCount;
    },

    // Zoom in on current page or spread
    scaleUp: function() {
        pdfObj.scale = pdfObj.scale + 0.25;
        pdfObj.canvasContainer.innerHTML = '';
        pdfObj.renderPages();
    },

    // Zoom out current page or spread
    scaleDown: function() {
        pdfObj.scale = pdfObj.scale - 0.25;
        pdfObj.canvasContainer.innerHTML = '';
        pdfObj.renderPages();
    },

    // Re size the pdf to fit in within the display
    fitWindow: function() {
        pdfObj.setInitialScale();
        pdfObj.canvasContainer.innerHTML = '';
        pdfObj.renderPages();
    },

    // Determine which page will get displayed with the current page
    setRenderRange: function() {
        if (pdfObj.displayInSpreads) {
            if (pdfObj.pgCount == 2) {
                return [1, 2];
            }
            if (pdfObj.currPg % 2 === 1) {
                return [pdfObj.currPg - 1, pdfObj.currPg];
            }
            if (pdfObj.currPg % 2 === 0) {
                return [pdfObj.currPg, pdfObj.currPg + 1];
            }
        }
        return [pdfObj.currPg];
    },

    renderPage: function(page) {
        var viewport = page.getViewport({scale: pdfObj.scale});
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
        pdfObj.canvasContainer.appendChild(wrapper);

        page.render(renderContext);
        pdfObj.showCurrPg();
    },

    renderPages: function() {
        if (!pdfObj.displayInSpreads) {
            pdfObj.docContainer.style.justifyContent = 'center';
        }
        renderRange = pdfObj.setRenderRange();
        renderRange.map((num) => {
            if (num >= 1 && num <= pdfObj.pgCount) {
                return pdfObj.pdfDoc.getPage(num).then(pdfObj.renderPage);
            }
        });
    },

    // Compares the window size to the pdf page size and calculates the scale
    // size that will fill the window. It is assumed that all pdf pages are the
    // same size
    setInitialScale: function() {
        var topBarHeight = pdfObj.topBarElement.clientHeight;
        var fullWidthScaleFactor = window.innerWidth / pdfObj.pgWidth;
        if (pdfObj.pgCount > 1) {
            fullWidthScaleFactor = window.innerWidth / (pdfObj.pgWidth * 2);
        }
        var pdfViewHeight = window.innerHeight - topBarHeight;
        var fullHeightScaleFactor = pdfViewHeight / pdfObj.pgHeight;
        if (fullWidthScaleFactor * pdfObj.pgHeight > window.innerHeight) {
            pdfObj.scale = fullHeightScaleFactor;
        } else {
            pdfObj.scale = fullWidthScaleFactor;
        }
    },

    initRender: function(pdfjsDoc) {
        pdfObj.pdfDoc = pdfjsDoc;
        pdfObj.pgCount = pdfjsDoc.numPages;
        // Determine whether or not to display as a single page or as reader
        // spreads
        if (pdfObj.pgCount > 1) {
            pdfObj.displayInSpreads = true;
        }
        pdfjsDoc
            .getPage(1)
            .then((pdfPg1) => {
                pdfObj.pgWidth = pdfPg1._pageInfo.view[2];
                pdfObj.pgHeight = pdfPg1._pageInfo.view[3];
            })
            .then(pdfObj.setInitialScale)
            .then(pdfObj.renderPages);
    },

    // renderPDF is the main method in this object. Think of it as a constructor
    // function
    renderPDF: function renderPDF(url, canvasContainer) {
        pdfObj.canvasContainer = canvasContainer;
        pdfjsLib.disableWorker = true;
        pdfjsLib.getDocument(url).promise.then(pdfObj.initRender);
    }
};

pdfObj.renderPDF('docs/pdf.pdf', document.getElementById('doc-container'));

// Add event listeners to the page changing control elements
document
    .querySelector('#first-page')
    .addEventListener('click', pdfObj.showFirstPage);
document
    .querySelector('#last-page')
    .addEventListener('click', pdfObj.showLastPage);
document
    .querySelector('#prev-page')
    .addEventListener('click', pdfObj.showPrevPage);
document
    .querySelector('#next-page')
    .addEventListener('click', pdfObj.showNextPage);
document.querySelector('#pg-num').addEventListener('keyup', pdfObj.jumpToPg);

// Add event listeners to page scaling control elements
document.querySelector('#scale-up').addEventListener('click', pdfObj.scaleUp);
document
    .querySelector('#scale-down')
    .addEventListener('click', pdfObj.scaleDown);
document
    .querySelector('#fit-window')
    .addEventListener('click', pdfObj.fitWindow);
