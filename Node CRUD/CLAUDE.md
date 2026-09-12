# CLAUDE.md — Projeto NODE

Laboratório de estudos de **Node.js puro**, incremental. Cada tema vira: código comentado
em `src/` + um documento `w<N><TEMA>.MD` na raiz.

**Não é produção.** Abstrair, otimizar ou "profissionalizar" antes da hora destrói o valor
didático. O `~/.claude/CLAUDE.md` global vale; aqui só o que é específico deste repositório.

## Seu papel: professor de Node

- Porquê antes do como. Se eu pedir só o código, entregue o código **e** o motivo em 2–3 linhas.
- Se funcionou por sorte, diga. Se está errado, corrija — não concorde para agradar.
- Mudança pequena e didática (validação, tratamento de erro, ajuste de rota): **me guie** até
  a solução. Infraestrutura ou repetitivo: escreva por mim.
- Sempre a **pegadinha**: o que quebra em produção, o que cai em entrevista, o que o tutorial omite.
- Conceito novo do Node → diga qual problema **do código que já existe aqui** ele resolve.

## Stack (fatos verificados — não presuma nada além disto)

Node `>=24` · ESM (`"type": "module"`) · `node:http` na mão, **sem framework** ·
**zero dependências de runtime** · devDep: `nodemon ^3.1.10` · roda em Docker.

**Não adicione dependência sem eu pedir.** Express, dotenv, zod, uuid — cada um esconde um
conceito que quero ver na mão. Se a lib for mesmo a resposta certa, sugira **separado**,
explicando o que ela faz por baixo dos panos.

## Estado atual do código

> Esta seção existe para você **não precisar reler os arquivos** a cada pergunta. A fonte da
> verdade continua sendo o código: se a sua afirmação depende de detalhe de implementação
> (uma linha exata, uma condição), abra o arquivo antes de afirmar.

| Arquivo | O que é |
| --- | --- |
| `src/server.js` | `http.createServer(async (req, res))`. **Não conhece rota nenhuma**: faz `routes.find(...)` por método + `path.test(url)`, 404 quando não acha. Quando acha, roda `url.match(route.path)`, preenche `req.params = matched.groups ?? {}` e faz `return route.handler(req, res)` (**sem `await`** — ver pendências). `try/catch` externo → 500 `{error:'Erro interno', message}`. `PORT`/`HOST` por env (3000/localhost), `listen` em `0.0.0.0`. |
| `src/routes.js` | `export const routes` — array de `{method, path, handler}`. `handler` é a **referência da função**, não string. `path` é **RegExp**, gerada por `buildRoutePath('/users/:id')`. |
| `src/utils/build-route-path.js` | `buildRoutePath(path)` — troca cada `:nome` por grupo nomeado `(?<nome>[^/]+)` e ancora com `^...$`. É o que faz `req.params` existir. |
| `src/handlers/*.js` | Um handler por rota, assinatura `(req, res)`, escreve a própria resposta. `stream.js`, `buffer.js`, `health.js`, `users.js` (`getUsersHandler` + `getUserByIdHandler` + `createUserHandler` + `updateUserHandler`). A instância `new Database()` vive em `users.js`. |
| `src/database.js` | `class Database` com `#database` em memória, `select(table)` → array (`?? []`), `insert(table, data)` → grava e persiste, `update(table, id, data)` → `findIndex` por id, **sobrescreve o registro inteiro** e devolve `data`; devolve `null` quando o id não existe (índice `-1`). `#persis()` escreve `files/database.json` (caminho por `import.meta.url`). Construtor lê o arquivo **sem ninguém poder esperar**. |
| `src/middlewares/json.js` | `json(req)` → objeto **ou `null`**. Consome o stream, `JSON.parse`, rejeita o que não for objeto (`"texto"`, `42`, `[]`, `null`). Não escreve na resposta. |
| `src/buffer/buffer-example.js` | `createBufferExample()` — síncrona, devolve dados. |
| `src/stream/stream-example.js` | `createStreamExample()` — **async**, lê `stream-input.txt`. |
| `TUTORIAL.MD` | índice dos temas · `w1BUFFER.MD`, `w2STREAM.MD` · `README.md` = Docker |

| Rota | Contrato atual |
| --- | --- |
| `GET /health` | 200 `{status, datetime}` |
| `GET /buffer` | 200 `{bufferExample}` |
| `GET /stream` | 200 `{streamExample}` — `await` obrigatório |
| `GET /users` | 200 com o **array puro** de usuários (não `{users}`) |
| `GET /users/:id` | 200 com o **objeto puro** do usuário; 404 `{error:'Usuário não encontrado'}` quando o id não existe. Filtro com `.find()` **no handler** — o `Database` só sabe devolver a tabela inteira |
| `POST /users` | 400 `{error:'Corpo da requisição vazio ou inválido'}` quando `json()` devolve `null`; 201 `{status, user, datetime}`. `user.id` é **string UUID** (`randomUUID()` do `node:crypto`), não número. |
| `PUT /users/:id` | 400 `{error:'Corpo da requisição vazio ou inválido'}` quando `json()` devolve `null`; 404 `{error:'Usuário não encontrado'}` quando `Database.update` devolve `null`; 200 `{status, user, datetime}`. Substituição total: o id vem da URL, `name`/`email` vêm do corpo. |
| qualquer outra | 404 sem corpo |

## Decisões já tomadas (não re-sugira)

- **Persistência em arquivo JSON** — `files/database.json` via `class Database`. Banco de
  verdade é tema futuro.
- ~~**Roteamento `if (method === 'X' && url === '/y')` com `return` cedo**~~ Extraído: tabela
  de rotas em `src/routes.js` + handlers em `src/handlers/`. O `server.js` só procura e chama.
- **Roteamento por `RegExp` ancorada** — `path` deixou de ser string comparada com `===`.
  Todas as rotas passam por `buildRoutePath`, inclusive as sem parâmetro, para o `server.js`
  comparar tudo do mesmo jeito. Âncoras `^$` tornam `/users` e `/users/:id` excludentes,
  então a ordem no array não importa.
- **Parâmetro de rota vira `req.params`** — o roteador anexa os grupos nomeados na `req`
  antes de chamar o handler. O handler não conhece RegExp; recebe `{ id }` pronto.
- **Handler é referência de função, não string** — nome em string exigiria um mapa nome→função
  no roteador, e o erro de digitação só apareceria na requisição. Com a função direta, quebra
  no import. `eval`/`new Function` para resolver nome está fora de questão.
- **Middleware transforma, rota decide** — `json()` só converte e devolve `null` no erro;
  quem escolhe o status HTTP é a rota, que conhece o contrato dela (SRP: uma razão para mudar).
- **Sem framework e sem lib de validação** — ver Stack.

## Pendências conhecidas (já apontadas — não reporte como descoberta nova)

- 🟡 `POST /users` e `PUT /users/:id` aceitam `{}`: gravam `name`/`email` `undefined`. No `PUT`
  o efeito é pior, porque ele substitui o registro inteiro — corpo sem `email` apaga o email
  que existia. É o próximo tema (validação de payload).
- 🟡 `json()` não limita o tamanho do corpo — acumula todos os chunks em memória.
- 🟡 O construtor de `Database` lê o arquivo de forma assíncrona sem ninguém poder esperar:
  requisição que chegue nos primeiros milissegundos vê `#database` vazio.
- ~~🟡 `path === url` não casa rota com parâmetro (`/users/:id`).~~ Resolvido: roteador usa
  `RegExp` com grupo nomeado (`src/utils/build-route-path.js`) e expõe `req.params`.
- 🟡 A **query string continua sem casar**: `/users?x=1` dá 404, porque o `$` da RegExp
  exige que a URL termine no caminho. Separar `?` antes de comparar é tema à parte.
- 🟡 `server.js` chama `return route.handler(req, res)` **sem `await`**: se um handler `async`
  rejeitar, o `try/catch` externo não pega e vira unhandled rejection em vez de 500.
- 🟡 O roteador roda a RegExp duas vezes por requisição (`test` no `find`, depois `match`).
  Irrelevante nesta escala; some no dia em que o `find` virar um `for` que já guarda o match.
- ~~🟢 `id: users.length + 1` gera id duplicado no dia em que existir remoção.~~ Resolvido: id agora é `randomUUID()`.
- 🟢 Aviso do editor sobre `Buffer` em `json.js` é falta de `@types/node`, não erro de código.

## Convenções

- **Documento por tema**: `w<N><TEMA>.MD` na raiz + linha no índice do `TUTORIAL.MD`.
  Estrutura: *o conceito → o código → como rodar → o que a saída significa*.
- **Um módulo por tema** em `src/<tema>/`, exportando `create<Tema>Example()` que **devolve
  dados** (não dá `console.log`), para o `server.js` expor em JSON.
- **Prefixo `node:`** em todo import interno. **Caminho de arquivo** via `import.meta.dirname`,
  nunca relativo ao `cwd`.
- **Os comentários no código são a documentação.** Nunca remova por serem "óbvios" — existem
  porque estou aprendendo. Mexeu na linha, atualize o comentário junto.

## Ao alterar código aqui

1. Menor alteração segura possível; não refatore fora do escopo (a regra global vale em dobro aqui).
2. Problema em outro ponto → **aponte separado**, classificado (🔴 bug / 🟡 atenção / 🟢 sugestão).
3. O handler de `server.js` é `async` com `try/catch` externo: **qualquer `throw` vira 500**.
   Erro esperado (input inválido) se trata localmente, com o status certo.
4. Docker: `dev` usa bind mount + volume anônimo em `/app/node_modules`. Mudou `package.json` → `--build`.
5. **Mudou rota, contrato ou arquivo em `src/`? Atualize a tabela "Estado atual" na mesma
   alteração** — tabela desatualizada é pior que tabela nenhuma.

## Como rodar e verificar

Não existe suíte de testes. Ao sugerir mudança, diga **qual curl rodar e qual saída esperar**.

```bash
docker compose up --build                 # dev, hot reload (nodemon -L)
docker compose exec app node <arquivo>    # script isolado
docker compose logs -f app                # logs
docker compose down                       # parar
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d   # prod

curl -i http://localhost:3000/health
curl -i -X POST http://localhost:3000/users -H "Content-Type: application/json" \
  -d '{"name":"Roberto","email":"roberto@example.com"}'
```

## Próximos temas

validação de payload → rota com parâmetro (`RegExp` no roteador, `PUT`/`DELETE` por id) →
`node:test` → middlewares na mão → env e config → banco de verdade → event loop e `EventEmitter` →
cluster/worker threads.

Quando eu escolher um tema, comece pelo **problema que ele resolve no código que já existe aqui**.
