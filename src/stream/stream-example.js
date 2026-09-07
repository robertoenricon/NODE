
// Streams permitem trabalhar com dados em pedacos, sem carregar tudo na memoria.
// Isso e util para arquivos grandes, uploads, downloads e respostas HTTP.

// **Stream** é o mecanismo que entrega os dados aos poucos.

import { createReadStream, createWriteStream } from 'node:fs'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { join } from 'node:path'

// import.meta.dirname = pasta deste arquivo, entao o script roda de qualquer cwd
const inputFile = join(import.meta.dirname, 'stream-input.txt')
const outputFile = join(import.meta.dirname, 'stream-output.txt')

// O stream entrega os chunks AO LONGO DO TEMPO, entao esta funcao e async:
// quem chamar precisa dar await para ter o resultado pronto .
export async function createStreamExample() {
  const chunks = []

  const uppercase = new Transform({
    transform(chunk, encoding, callback) {
      // Em vez de console.log, guardamos o que aconteceu para devolver na resposta
      chunks.push({
        bytes: chunk.length,
        preview: chunk.toString('utf8'),
      })

      const transformedChunk = chunk.toString('utf8').toUpperCase()

      callback(null, transformedChunk)
    },
  })

  // highWaterMark = tamanho maximo de cada pedaco. O padrao e 64 KB, e como o
  // arquivo e pequeno sairia um chunk so; 32 bytes deixa o fatiamento visivel.
  const readStream = createReadStream(inputFile, { highWaterMark: 32 })
  const writeStream = createWriteStream(outputFile)

  // pipeline faz o mesmo que .pipe().pipe(), mas avisa quando termina e propaga
  // erro de qualquer etapa. Com .pipe() um erro no meio do caminho fica sem dono.
  await pipeline(readStream, uppercase, writeStream)

  return {
    inputFile,
    outputFile,
    totalChunks: chunks.length,
    chunks,
  }
}

// Rodando direto (node src/stream/stream-example.js)? executa e mostra o resultado.
// Importado pelo server? nada disso roda - so a funcao fica disponivel.
if (process.argv[1] === import.meta.filename) {
  const result = await createStreamExample()

  console.log(result)
  console.log(`Arquivo criado: ${result.outputFile}`)
}
