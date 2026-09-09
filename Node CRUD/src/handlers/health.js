// req não é usado aqui, mas continua na assinatura: o roteador chama todo handler do
// mesmo jeito, então a forma da função é igual mesmo quando a rota ignora a requisição.
export function healthHandler(req, res) {
  return res
    .setHeader('Content-type', 'application/json')
    .end(JSON.stringify({ status: 'ok', datetime: new Date().toISOString() }))
}
