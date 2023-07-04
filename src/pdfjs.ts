import type { PDFDocumentProxy, PDFPageProxy, DocumentInitParameters } from 'pdfjs-dist/types/src/display/api'
import { GlobalWorkerOptions, getDocument as initDocument, version } from 'pdfjs-dist'

export type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api'
export type DocumentParameters = Omit<DocumentInitParameters, 'cMapUrl' | 'cMapPacked' | 'standardFontDataUrl'>

export const initPDFWorker = () => {
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`
  return
}

export const getDocument = (params: DocumentParameters) =>
  initDocument({
    ...params,
    cMapUrl: `https://unpkg.com/pdfjs-dist@${version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${version}/standard_fonts`,
  }).promise

export const getViewportCanvas = async (page: PDFPageProxy, scale: number): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement('canvas')
  const viewport = page.getViewport({ scale })
  const canvasContext = canvas.getContext('2d')
  canvas.height = viewport.height
  canvas.width = viewport.width
  if (!canvasContext) throw new Error('canvas context is not loaded')
  const renderContext = { canvasContext, viewport }
  await page.render(renderContext).promise
  return canvas
}

export const renderPage = async (
  canvas: HTMLCanvasElement | null,
  pdf: PDFDocumentProxy | undefined,
  pageNumber: number,
  scale: number,
  width: number | undefined,
): Promise<void> => {
  pdf?.getPage(pageNumber).then(async (page) => {
    const viewportCanvas = await getViewportCanvas(page, scale)
    const context = canvas?.getContext('2d')
    if (!context || !canvas) throw new Error('canvas context is not loaded')
    canvas.height = viewportCanvas.height
    canvas.width = viewportCanvas.width
    canvas.style.width = (width || viewportCanvas.width) + 'px'
    context.drawImage(viewportCanvas, 0, 0)
  })
}
