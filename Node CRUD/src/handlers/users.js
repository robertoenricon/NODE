// randomUUID gera um identificador único a partir de aleatoriedade criptográfica.
import { randomUUID } from 'node:crypto';

// Persistencia de dados
import { Database } from '../database.js';

// Middlewares
import { json } from '../middlewares/json.js';

// A instância mora aqui porque é este módulo que usa o banco. Um módulo ESM é avaliado
// UMA única vez e fica em cache: quem importar users.js de outro lugar recebe esta mesma
// instância, não um banco novo.
const database = new Database()

export function getUsersHandler(req, res) {
  // const {name, email} = database.select('users')
  const users = database.select('users')

  return res
    .setHeader('Content-type', 'application/json')
    .end(JSON.stringify(users))
}

export async function createUserHandler(req, res) {

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
