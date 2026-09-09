import { createBufferExample } from '../buffer/buffer-example.js';

// createBufferExample é síncrona, então este handler não precisa ser async. O roteador
// dá await em qualquer handler, e await num valor comum simplesmente resolve — handler
// sync e async convivem sem o server.js precisar diferenciar.
export function bufferHandler(req, res) {
  const bufferExample = createBufferExample()

  return res
    .setHeader('Content-type', 'application/json')
    .end(JSON.stringify({
      bufferExample,
    }))
}
