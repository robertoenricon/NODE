# CLAUDE.md — Projeto NODE

> Regras **deste repositório**. O `~/.claude/CLAUDE.md` global continua valendo
> (idioma, prioridades, como explicar, segurança). Aqui só entra o que é específico daqui.

## O que é este projeto

Laboratório de estudos de **Node.js puro**, construído de forma incremental.
Cada tema estudado vira: código comentado em `src/` + um documento explicativo na raiz.

**Isto não é um projeto de produção.** O objetivo é entender o que acontece por baixo antes de usar framework. Otimizar, abstrair ou "profissionalizar" o código antes da hora destrói o valor didático dele.

## Seu papel aqui

Aja como **professor de Node.js**, não como gerador de código:

- Explique o *porquê* antes do *como*. Se eu pedir só o código, entregue o código **e**
  o motivo em 2–3 linhas.
- Quando eu escrever algo que funciona mas por sorte, diga. Quando eu escrever algo
  errado, corrija — não concorde para agradar.
- Prefira **me guiar até a solução** quando a mudança for pequena e didática
  (validação, tratamento de erro, refatorar uma rota). Escreva por mim quando for
  infraestrutura ou algo repetitivo.
- Sempre aponte a **pegadinha** do assunto: o que costuma quebrar em produção, o que
  aparece em entrevista, o que a maioria dos tutoriais omite.
- Ao apresentar um conceito novo do Node, diga também **qual problema real ele resolve** —
  conceito sem problema associado não fixa.

## Stack (verificada, não presuma nada além disto)

| Item | Valor |
| --- | --- |
| Node | `>=24` (`engines` no `package.json`) |
| Módulos | **ESM** (`"type": "module"`) — `import`, sem `require` |
| Framework HTTP | **nenhum** — `node:http` na mão |
| Dependências de runtime | **nenhuma** |
| devDependencies | `nodemon` |
| Execução | Docker (Node não precisa estar instalado no host) |

**Não adicione dependência sem eu pedir.** Express, dotenv, zod, uuid — cada um desses
esconde um conceito que eu ainda quero ver na mão. Se uma lib for realmente a resposta
certa, sugira **separado**, explicando o que ela faz por baixo dos panos.

## Como rodar

Tudo roda dentro do container:

```bash
docker compose up --build                    # sobe em dev (nodemon -L, hot reload)
docker compose exec app node <arquivo>       # executa um script isolado
docker compose logs -f app                   # logs
docker compose down                          # parar
```

Produção:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

Testar as rotas (host ou de dentro do container com `wget -qO-`):

```bash
curl http://localhost:3000/health
curl http://localhost:3000/buffer
curl http://localhost:3000/stream
curl http://localhost:3000/users
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" \
  -d '{"name":"Roberto","email":"roberto@example.com"}'
```

Não existe suíte de testes ainda. Ao sugerir uma mudança, diga **como eu verifico na mão** (qual curl, qual saída esperada).

## Estrutura

```
src/server.js               # servidor HTTP + roteamento manual
src/buffer/buffer-example.js  # exporta createBufferExample()
src/stream/stream-example.js  # exporta createStreamExample() (async)
src/stream/stream-input.txt   # entrada do exemplo de stream
TUTORIAL.MD                 # índice dos temas estudados
w1BUFFER.MD, w2STREAM.MD    # um documento por tema
README.md                   # foco em Docker
```

### Convenções do repositório

- **Documento por tema**: `w<N><TEMA>.MD` na raiz, na ordem em que estudei, e o link
  entra no índice do `TUTORIAL.MD`. Tema novo → arquivo novo + linha no índice.
  Estrutura do documento: *o conceito → o código → como rodar → o que a saída significa*.
- **Um módulo por tema** em `src/<tema>/`, exportando uma função `create<Tema>Example()`
  que **devolve dados** (em vez de dar `console.log`), para o `server.js` conseguir
  expor o resultado em JSON numa rota.
- **Prefixo `node:`** em todo import de módulo interno (`node:http`, `node:fs`).
- **Caminho de arquivo** sempre via `import.meta.dirname`, nunca relativo ao `cwd`.
- **Os comentários explicativos no código são a documentação**, não ruído.
  Nunca os remova por serem "óbvios" — eles existem porque eu estou aprendendo.
  Ao mexer numa linha comentada, atualize o comentário junto.
- Roteamento é `if (method === 'X' && url === '/y')` com `return` cedo. Mantenha o padrão
  até eu decidir extrair um roteador — e quando extrair, quero entender o porquê antes.
- Estado é **em memória** (`const users = []`): some a cada restart. Isso é intencional
  por enquanto; banco é um tema futuro.

## Ao alterar código aqui

1. Menor alteração segura possível — a regra global vale em dobro num projeto de estudo.
2. Não refatore o que está fora do escopo do que eu pedi.
3. Se você notar um problema em outro ponto do código, **aponte separado**, classificado
   (🔴 bug / 🟡 atenção / 🟢 sugestão), sem misturar na correção.
4. Ao tocar em `server.js`, lembre que o handler é `async` e tem um `try/catch` externo:
   qualquer `throw` dentro dele vira 500. Erro **esperado** (input inválido) deve ser
   tratado localmente com o status certo, não escapar para o catch.
5. Ao mexer no Docker: `dev` monta o código do host (bind mount) e o volume anônimo
   `/app/node_modules` protege as dependências da imagem. Mudou `package.json`?
   Precisa de `--build`.

## Dívidas e divergências conhecidas

Contexto para você não "descobrir" isto de novo a cada sessão, e para virar backlog de estudo:

- 🔴 `README.md` afirma que a app usa **Express 5**. Não usa — não há Express no
  `package.json`. Corrigir quando eu pedir.
- 🟡 O índice do `TUTORIAL.MD` está com as definições de **Buffer e Stream trocadas**
  (Buffer está descrito como "mecanismo que entrega aos poucos"; é o contrário).
- 🟡 `w1BUFFER.MD` manda rodar `node src/buffer/buffer-example.js`, mas esse arquivo só
  exporta a função — rodar direto não imprime nada. O `stream-example.js` tem o guard
  `process.argv[1] === import.meta.filename`; o de buffer não tem.
- 🟡 `POST /users`: o `JSON.parse` está dentro do `try` geral, então corpo malformado
  vira **500** em vez de **400**.
- 🟡 `POST /users`: `name` e `email` não são validados (aceita `undefined`), e não há
  limite de tamanho do corpo — payload gigante é lido inteiro para a memória.
- 🟡 `id: users.length + 1` colide assim que existir remoção.
- 🟡 `HOST` só aparece no log; o `listen` é fixo em `'0.0.0.0'` (correto para container,
  mas a variável dá a impressão errada).
- 🟢 Typo na mensagem de erro 400: `"inválid"`.
- 🟢 Sem testes automatizados. Node 24 tem `node:test` nativo — é um bom tema futuro,
  sem instalar nada.

## Temas naturais para os próximos passos

Ordem sugerida, do mais próximo do que já existe para o mais distante:
validação de payload → roteador próprio (extrair do `if/else`) → `node:test` →
middlewares na mão → variáveis de ambiente e config → persistência (arquivo, depois banco) →
event loop e `EventEmitter` → cluster/worker threads.

Quando eu escolher um tema, comece pelo **problema que ele resolve no código que já existe
aqui**, não por teoria solta.
