// Importa o módulo HTTP nativo do Node. O prefixo 'node:' deixa explícito que é um módulo interno (não um pacote do node_modules) — evita ambiguidade e é
// levemente mais rápido de resolver.
import http from 'node:http';

// randomUUID gera um identificador único a partir de aleatoriedade criptográfica.
import { randomUUID } from 'node:crypto';

import { createBufferExample } from './buffer/buffer-example.js';
import { createStreamExample } from './stream/stream-example.js';

// Persistencia de dados
import { Database } from './database.js';

// Middlewares
import { json } from './middlewares/json.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const database = new Database()

// createServer cria o servidor e recebe uma função que o Node chama UMA VEZ PARA CADA requisição que chegar. Ela recebe dois objetos:
//   req -> o que o cliente enviou (método, url, headers, corpo)
//   res -> o canal por onde você devolve a resposta
//   async -> permite que essa função use await dentro dela
// O handler é async porque a rota /stream espera o stream terminar.
const server = http.createServer(async (req, res) => {
  const { method, url } = req

  try {

    if (method === 'GET' && url === '/stream') {
      // await: o stream entrega os chunks ao longo do tempo, não no ato da chamada.
      // Sem o await, o JSON.stringify receberia uma Promise e devolveria {}.
      const streamExample = await createStreamExample()

      return res
        .setHeader('Content-type', 'application/json')
        .end(JSON.stringify({
          streamExample,
        }))
    }

    if (method === 'GET' && url === '/buffer') {
      const bufferExample = createBufferExample()

      return res
        .setHeader('Content-type', 'application/json')
        .end(JSON.stringify({
          bufferExample,
        }))
    }

    if (method === 'GET' && url === '/users') {
      // const {name, email} = database.select('users')
      const users = database.select('users')

      return res
        .setHeader('Content-type', 'application/json')
        .end(JSON.stringify(users))
    }

    if (method === 'POST' && url === '/users') {

      // Aguardar o consumo do stream e a conversão para JSON antes de continuar.
      // pois eu tenho async, com await dentro dela, então, preciso chamar o json() com await, senão o body vai ser uma Promise e não o objeto que eu quero.
      const body = await json(req)

      if (body === null) {
        res.setHeader('Content-Type', 'application/json')
        res.writeHead(400)

        return res.end(JSON.stringify({
          error: 'Corpo da requisição vazio ou inválido',
        }))
      }

      const user = {
        // O UUID não depende do que já está gravado: dispensa ler a tabela e calcular
        // "o maior id + 1". Id sequencial volta a repetir no dia em que existir remoção
        // (apagar o 3 de [1,2,3] faz o próximo ser 3 de novo) — com UUID isso não acontece.
        id: randomUUID(),
        name: body.name,
        email: body.email,
      }

      database.insert('users', user)

      res.setHeader('Content-Type', 'application/json')
      res.writeHead(201)

      // Devolver o recurso criado poupa o cliente de um GET só para saber o id.
      return res.end(JSON.stringify({
        status: 'Criado com sucesso',
        user,
        datetime: new Date().toISOString()
      }))
    }

    if (method === 'GET' && url === '/health') {
      return res
        .setHeader('Content-type', 'application/json')
        .end(JSON.stringify({ status: 'ok', datetime: new Date().toISOString() }))
    }

    // 404 = "Not Found".
    return res.writeHead(404).end()

  } catch (error) {
    console.error('Erro na requisição:', error)

    res.setHeader('Content-Type', 'application/json')
    res.writeHead(500)

    return res.end(JSON.stringify({
      error: 'Erro interno',
      message: error.message,
    }))
  }
})

// Toda aplicação HTTP no Node precisa chamar listen para começar a aceitar requisições.
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ${HOST} ouvindo na porta ${PORT}`);
});
