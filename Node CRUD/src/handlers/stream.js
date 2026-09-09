import { createStreamExample } from '../stream/stream-example.js';

// Todo handler tem a mesma assinatura (req, res) e é ele quem escreve a resposta.
// Esse contrato único é o que permite ao server.js chamar qualquer rota sem saber
// qual é: ele conhece o formato do handler, não as rotas.
export async function streamHandler(req, res) {
  // await: o stream entrega os chunks ao longo do tempo, não no ato da chamada.
  // Sem o await, o JSON.stringify receberia uma Promise e devolveria {}.
  const streamExample = await createStreamExample()

  return res
    .setHeader('Content-type', 'application/json')
    .end(JSON.stringify({
      streamExample,
    }))
}
