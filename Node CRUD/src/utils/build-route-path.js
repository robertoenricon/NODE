// Traduz um caminho legível ('/users/:id') para a RegExp que o roteador sabe comparar.
// Sem isso, a rota teria que ser escrita à mão como /^\/users\/(?<id>[^\/]+)$/ dentro do
// routes.js — difícil de ler e fácil de errar uma barra.
export function buildRoutePath(path) {
  // Procura cada ':algumaCoisa' no caminho e captura SÓ o nome (o 'id' de ':id').
  // A flag g é obrigatória no replaceAll com RegExp e faz valer para '/users/:id/posts/:postId'.
  const routeParametersRegex = /:([a-zA-Z]+)/g;

  // Troca ':id' por um grupo NOMEADO: '(?<id>[^/]+)'.
  //   (?<id>...) -> o que casar aqui fica guardado com o nome 'id'
  //   [^/]+      -> um ou mais caracteres que não sejam barra (o parâmetro termina no próximo '/')
  // O $1 é o que o grupo de captura do routeParametersRegex pegou: o nome do parâmetro.
  const pathWithParams = path.replaceAll(routeParametersRegex, '(?<$1>[^/]+)');

  // ^ e $ ancoram a expressão: a URL precisa casar do começo ao fim.
  // Sem as âncoras, '/users' casaria com '/api/users/qualquer-coisa' — a rota errada atenderia.
  return new RegExp(`^${pathWithParams}$`);
}
