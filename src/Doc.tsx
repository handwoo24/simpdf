import type { CSSProperties, FC } from 'react'
import type { GetDocumentParams, PDFDocumentProxy } from './pdfjs'
import React from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { getDocument, renderPage } from './pdfjs'

export interface DocProps extends GetDocumentParams {
  pageNumber?: number
  onLoad?: (doc: PDFDocumentProxy) => void
  style?: CSSProperties
  scale?: number
}

const Doc: FC<DocProps> = ({ url, pageNumber = 1, onLoad, scale = 1, style }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nextCanvasRef = useRef<HTMLCanvasElement>(null)
  const measureRef = useRef<number>()

  const render = useCallback(
    (pageNumber: number, canvas: HTMLCanvasElement | null) => {
      if (!containerRef.current || !canvasRef.current || !nextCanvasRef.current) return
      const containerStyle = window.getComputedStyle(containerRef.current)
      const containerWidth = parseFloat(containerStyle.width)
      if (!measureRef.current) {
        measureRef.current = containerWidth / 2
      }
      const width = measureRef.current ?? containerWidth / 2
      renderPage(canvas, pdf, pageNumber, scale, width)
    },
    [pdf, scale],
  )

  const clear = useCallback((canvas: HTMLCanvasElement | null) => {
    const context = canvas?.getContext('2d')
    if (!canvas || !context) throw new Error('canvas is not defined')
    context.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  useEffect(() => {
    getDocument({ url }).then((doc) => {
      setPdf(doc)
      if (onLoad) onLoad(doc)
    })
  }, [onLoad, url])

  useEffect(() => {
    if (!pageNumber || !pdf) return
    render(pageNumber, canvasRef.current)
  }, [render, pageNumber, pdf, clear])

  return <canvas ref={canvasRef} style={{ flex: 1, border: 'none', width: '100%', ...style }} />
}

export default Doc
