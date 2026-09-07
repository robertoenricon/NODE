// Importa o módulo HTTP nativo do Node. O prefixo 'node:' deixa explícito que é um módulo interno (não um pacote do node_modules) — evita ambiguidade e é
// levemente mais rápido de resolver.
import http from 'node:http';
import { createBufferExample } from './buffer/buffer-example.js';
import { createStreamExample } from './stream/stream-example.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const users = []

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
      return res
        .setHeader('Content-type', 'application/json')
        .end(JSON.stringify({
          users,
        }))
    }

    if (method === 'POST' && url === '/users') {

      // Precisa consumir o stream ANTES de decidir qualquer coisa: só depois
      // de ler todos os chunks dá pra saber se o corpo veio vazio.
      const buffers = []
      for await (const chunk of req) {
        buffers.push(chunk)
      }

      let body = ""
      if (buffers.length !== 0) {
        // Os bytes viram objeto: junta os chunks -> texto -> JSON.
        body = JSON.parse(Buffer.concat(buffers).toString('utf8'))
      }

      // JSON.parse devolve QUALQUER JSON válido: "um texto", 42, [] e null
      if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        res.setHeader('Content-Type', 'application/json')
        res.writeHead(400)

        return res.end(JSON.stringify({
          error: "Corpo da requisição vazio ou inválid",
        }))
      }

      // Monta o usuário campo a campo: o que entra na lista tem sempre a mesma
      // forma, em vez de ser o que o cliente resolveu mandar.
      const user = {
        id: users.length + 1,
        name: body.name,
        email: body.email,
      }

      users.push(user)

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
