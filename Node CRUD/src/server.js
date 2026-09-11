// Importa o módulo HTTP nativo do Node. O prefixo 'node:' deixa explícito que é um módulo interno (não um pacote do node_modules) — evita ambiguidade e é levemente mais rápido de resolver.
import http from 'node:http';

// Rotas
import { routes } from './routes.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// createServer cria o servidor e recebe uma função que o Node chama UMA VEZ PARA CADA requisição que chegar. Ela recebe dois objetos:
//   req -> o que o cliente enviou (método, url, headers, corpo)
//   res -> o canal por onde você devolve a resposta
// O handler é async porque um handler de rota pode ser assíncrono (a /stream espera o stream terminar).
const server = http.createServer(async (req, res) => {
  const { method, url } = req

  try {

    // find devolve a PRIMEIRA rota cujo método e caminho batem, ou undefined se não achar.
    // path virou RegExp: test devolve true/false para "essa URL casa com essa rota?".
    const route = routes.find(
      route => route.method === method && route.path.test(url)
    )

    if (route) {
      const matched = url.match(route.path)
      req.params = matched.groups ?? {}

      return route.handler(req, res)
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
