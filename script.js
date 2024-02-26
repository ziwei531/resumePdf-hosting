// credits to https://github.com/ankur2194/custom-html5-pdf-viewer-mobile-compatible

const url = "./pdf/resume.pdf";
const pdfjsLib = window["pdfjs-dist/build/pdf"];
pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.2.2/pdf.worker.js";

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5;

const renderPage = (num, canvas) => {
    let ctx = canvas.getContext("2d");
    pageRendering = true;

    // fetch the page
    pdfDoc.getPage(num).then((page) => {
        let viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // render PDF page into canvas context
        let renderContext = {
            canvasContext: ctx,
            viewport: viewport,
        };
        let renderTask = page.render(renderContext);

        // wait for rendering to finish
        renderTask.promise.then(() => {
            pageRendering = false;
            if (pageNumPending !== null) {
                // New page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });
};

pdfjsLib.getDocument(url).promise.then((pdfDoc_) => {
    pdfDoc = pdfDoc_;

    const pages = parseInt(pdfDoc.numPages);

    let canvasHtml = "";
    for (let i = 0; i < pages; i++) {
        canvasHtml += `<canvas id="canvas_${i}"></canvas>`;
    }

    document.getElementById("canvases").innerHTML = canvasHtml;

    for (let i = 0; i < pages; i++) {
        let canvas = document.getElementById(`canvas_${i}`);
        renderPage(i + 1, canvas);
    }
});
