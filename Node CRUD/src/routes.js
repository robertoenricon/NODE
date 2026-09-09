import { streamHandler } from './handlers/stream.js';
import { bufferHandler } from './handlers/buffer.js';
import { getUsersHandler, createUserHandler } from './handlers/users.js';
import { healthHandler } from './handlers/health.js';

// O handler é a referência da função
export const routes = [
  {
    method: 'GET',
    path: '/stream',
    handler: streamHandler
  },
  {
    method: 'GET',
    path: '/buffer',
    handler: bufferHandler
  },
  {
    method: 'GET',
    path: '/users',
    handler: getUsersHandler
  },
  {
    method: 'POST',
    path: '/users',
    handler: createUserHandler
  },
  {
    method: 'GET',
    path: '/health',
    handler: healthHandler
  },
];
