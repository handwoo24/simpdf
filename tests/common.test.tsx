import * as React from 'react'
import { render } from '@testing-library/react'

import 'jest-canvas-mock'

import { Doc } from '../src'

describe('Common render', () => {
  it('renders without crashing', () => {
    const url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf'
    render(<Doc url={url} />)
  })
})
