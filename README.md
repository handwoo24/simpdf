### A simple pdf component to render react

### Example
```ts
import { initPDFWorker, Doc } from "simpdf"

initPDFWorker()

const Render = () => {
  return <Doc url={"example.pdf"} scale={2} width={500} pageNumber={1} />
}

export default Render
```