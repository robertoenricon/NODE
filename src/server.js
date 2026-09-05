// Importa o módulo HTTP nativo do Node. O prefixo 'node:' deixa explícito que é um módulo interno (não um pacote do node_modules) — evita ambiguidade e é
// levemente mais rápido de resolver.
import http from 'node:http';
import { createBufferExample } from './buffer/buffer-example.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const users = []

// createServer cria o servidor e recebe uma função que o Node chama UMA VEZ PARA CADA requisição que chegar. Ela recebe dois objetos:
//   req -> o que o cliente enviou (método, url, headers, corpo)
//   res -> o canal por onde você devolve a resposta
const server = http.createServer((req, res) => {
  const { method, url } = req

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
    users.push({
      id: 1,
      name: 'Roberto Enrico',
      email: 'roberto.enrico@example.com',
    })

    res.setHeader('Content-Type', 'application/json')
    res.writeHead(201)

    return res.end(JSON.stringify({
      status: 'Criado com sucesso',
      datetime: new Date().toISOString()
    }))
  }

  if (method === 'GET' && url === '/health') {
    return res
      .setHeader('Content-type', 'application/json')
      .end(JSON.stringify({ status: 'ok', datetime: new Date().toISOString() }))
  }

  // Se chegou até aqui, nenhuma rota bateu. 404 = "Not Found".
  return res.writeHead(404).end()
})

// Toda aplicação HTTP no Node precisa chamar listen para começar a aceitar requisições.
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ${HOST} ouvindo na porta ${PORT}`);
});
