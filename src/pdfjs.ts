import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api'

export { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api'

export interface GetPdfDocumentParams {
  url?: string
}
// Why? this is for SSR(Server Side Rendering), because pdfjs-dist is not working on SSR. In next.js, it would over limited server memory.
const initPdfJs = (typeof window !== 'undefined' &&
  import('pdfjs-dist').then(({ getDocument, version, GlobalWorkerOptions }) => {
    GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`
    return ({ url }: GetPdfDocumentParams) =>
      getDocument({
        url,
        cMapUrl: `https://unpkg.com/pdfjs-dist@${version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${version}/standard_fonts`,
      }).promise
  })) as Promise<({ url }: GetPdfDocumentParams) => Promise<PDFDocumentProxy>>

// Why? resolve promise
export const getDocument = (params: GetPdfDocumentParams) => initPdfJs.then((fn) => fn(params))

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
