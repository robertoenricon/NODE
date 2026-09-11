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

// Lista todos os usuários
export function getUsersHandler(req, res) {
  // const {name, email} = database.select('users')
  const users = database.select('users')

  return res
    .setHeader('Content-type', 'application/json')
    .end(JSON.stringify(users))
}

// Lista um usuário pelo ID
export function getUserByIdHandler(req, res) {
  // req.params é preenchido pelo server.js com os grupos nomeados da RegExp da rota.
  // Para '/users/:id', o único parâmetro é o id — e ele chega SEMPRE como string.
  const { id } = req.params

  // O filtro vive aqui, não no Database: a classe só sabe devolver a tabela inteira.
  // find para no primeiro que casar e devolve undefined quando não acha nenhum.
  const user = database.select('users').find(userId => userId.id === id)

  // Id que não existe é erro do cliente, não do servidor: 404, não 500.
  // Trata localmente porque um throw aqui cairia no catch do server.js e viraria 500.
  if (!user) {
    res.setHeader('Content-Type', 'application/json')
    res.writeHead(404)

    return res.end(JSON.stringify({
      error: 'Usuário não encontrado',
    }))
  }

  // 200 é o padrão, não precisa de writeHead.
  return res
    .setHeader('Content-Type', 'application/json')
    .end(JSON.stringify(user))
}

// Cria um novo usuário
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
