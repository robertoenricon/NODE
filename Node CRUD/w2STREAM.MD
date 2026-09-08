# Stream

Arquivos: `src/stream/stream-example.js`, `src/stream/stream-input.txt`

```bash
docker compose exec app node src/stream/stream-example.js
```

## O conceito

Buffer resolve "como representar bytes". **Stream** resolve o problema seguinte: *e quando os bytes são grandes demais para caberem na memória de uma vez?*

Um stream processa dados **em pedaços (chunks)**, conforme eles chegam. Ler um arquivo de 2 GB com `readFile` significa 2 GB de RAM; ler com stream significa alguns KB por vez, quantas vezes for preciso. Por isso streams estão em toda parte: arquivos grandes, upload, download, respostas HTTP.

Os três tipos que importam:

| Tipo | Papel | Exemplo |
| --- | --- | --- |
| **Readable** | produz dados | `createReadStream` |
| **Writable** | consome dados | `createWriteStream` |
| **Transform** | recebe, modifica e repassa | `uppercase` |

## O pipeline

```js
readStream
  .pipe(uppercase)
  .pipe(writeStream)
```

`pipe()` é uma "mangueira": conecta a saída de um stream na entrada do próximo. Lê-se da esquerda para a direita — *arquivo → transforma em maiúsculas → grava no outro arquivo*. Em nenhum momento o arquivo inteiro existe na memória.

Além de encanar, o `pipe()` cuida de **backpressure**: se o destino escreve mais devagar do que a origem lê, ele pausa a leitura automaticamente. Sem isso, um arquivo grande lido rápido demais encheria a memória mesmo usando streams.

## O Transform

```js
const uppercase = new Transform({
  transform(chunk, encoding, callback) {
    const transformedChunk = chunk.toString().toUpperCase()
    callback(null, transformedChunk)
  },
})
```

A função `transform` é chamada **uma vez por chunk**. O `callback(null, resultado)` significa "terminei este pedaço, aqui está o resultado" — o primeiro argumento é o erro (`null` = deu certo), o segundo é o que segue adiante no pipe. Enquanto você não chamar o callback, o stream fica parado esperando; é assim que ele respeita o seu ritmo.

## Os caminhos dos arquivos

```js
const inputFile = join(import.meta.dirname, 'stream-input.txt')
```

`import.meta.dirname` é a pasta do **próprio arquivo**. Sem isso, um caminho como `'src/stream-input.txt'` é resolvido a partir do diretório de onde você rodou o comando (o *cwd*), e o script quebra com `ENOENT` se você rodar de outro lugar. Com `import.meta.dirname`, funciona de qualquer lugar.

## A saída, e a pegadinha do Buffer

```
Chunk recebido:
<Buffer 6f 6c 61 20 6e 6f 64 65 0a 73 74 72 ... 55 more bytes>
Arquivo criado: /app/src/stream/stream-output.txt
```

Resultado em `src/stream/stream-output.txt`:

```
OLA NODE
STREAMS TRABALHAM COM DADOS EM PEDACOS
ISSO EVITA CARREGAR ARQUIVOS GRANDES INTEIROS NA MEMORIA
```

---