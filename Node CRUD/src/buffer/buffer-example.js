// --------- BUFFER ---------

// Buffer representa dados binarios em memoria.
//**Buffer** é o formato de cada pedaço entregue.

export function createBufferExample() {
  const text = 'Ola Node'
  const buffer = Buffer.from(text, 'utf8')

  const chunk1 = Buffer.from('{"name":"Roberto",')
  const chunk2 = Buffer.from('"email":"roberto@example.com"}')
  const fullBody = Buffer.concat([chunk1, chunk2])

  return {
    originalText: text,
    buffer,
    bytes: [...buffer],
    textFromBuffer: buffer.toString('utf8'),
    bodyFromChunks: fullBody.toString('utf8'),
    userFromChunks: JSON.parse(fullBody.toString('utf8')),
  }
}