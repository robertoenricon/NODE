
// Streams permitem trabalhar com dados em pedacos, sem carregar tudo na memoria.
// Isso e util para arquivos grandes, uploads, downloads e respostas HTTP.

// **Stream** é o mecanismo que entrega os dados aos poucos.

import { createReadStream, createWriteStream } from 'node:fs'
import { Transform } from 'node:stream'
import { join } from 'node:path'

// import.meta.dirname = pasta deste arquivo, entao o script roda de qualquer cwd
const inputFile = join(import.meta.dirname, 'stream-input.txt')
const outputFile = join(import.meta.dirname, 'stream-output.txt')

const uppercase = new Transform({
  transform(chunk, encoding, callback) {
    console.log('Chunk recebido:')
    console.log(chunk)

    const transformedChunk = chunk.toString().toUpperCase()

    callback(null, transformedChunk)
  },
})

const readStream = createReadStream(inputFile, { encoding: 'utf8' })
const writeStream = createWriteStream(outputFile)

readStream
  .pipe(uppercase)
  .pipe(writeStream)
  .on('finish', () => {
    console.log(`Arquivo criado: ${outputFile}`)
  })
