import { streamHandler } from './handlers/stream.js';
import { bufferHandler } from './handlers/buffer.js';
import { getUsersHandler, getUserByIdHandler, createUserHandler } from './handlers/users.js';
import { healthHandler } from './handlers/health.js';

// Converte o caminho escrito à mão na RegExp que o server.js compara com a URL.
import { buildRoutePath } from './utils/build-route-path.js';

// O handler é a referência da função
// O path deixou de ser string: agora é RegExp, porque '/users/:id' precisa casar um trecho
// variável da URL. Rotas sem parâmetro passam pelo mesmo buildRoutePath só para todas
// serem comparadas do mesmo jeito (o server.js não precisa saber de dois formatos).
export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/stream'),
    handler: streamHandler
  },
  {
    method: 'GET',
    path: buildRoutePath('/buffer'),
    handler: bufferHandler
  },
  {
    method: 'GET',
    path: buildRoutePath('/users'),
    handler: getUsersHandler
  },
  {
    method: 'GET',
    path: buildRoutePath('/users/:id'),
    handler: getUserByIdHandler
  },
  {
    method: 'POST',
    path: buildRoutePath('/users'),
    handler: createUserHandler
  },
  {
    method: 'GET',
    path: buildRoutePath('/health'),
    handler: healthHandler
  },
];
