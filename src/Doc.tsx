import type { CSSProperties, FC } from 'react'
import type { DocumentParameters, PDFDocumentProxy } from './pdfjs'
import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { getDocument, renderPage } from './pdfjs'

export interface DocProps extends DocumentParameters {
  pageNumber?: number
  onLoad?: (doc: PDFDocumentProxy) => void
  style?: CSSProperties
  scale?: number
  width?: number
}

const Doc: FC<DocProps> = ({ pageNumber = 1, scale = 1, onLoad, style, url, width }) => {
  const [pdf, setPdf] = useState<PDFDocumentProxy>()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    getDocument({ url }).then((doc) => {
      setPdf(doc)
      onLoad?.(doc)
    })
  }, [url, onLoad])

  useEffect(() => {
    if (!pageNumber || !pdf || !canvasRef.current) return
    renderPage(canvasRef.current, pdf, pageNumber, scale, width)
  }, [pageNumber, pdf, scale, width])

  return <canvas ref={canvasRef} style={{ flex: 1, border: 'none', width: '100%', ...style }} />
}

export default Doc
