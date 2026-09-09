# Node no Docker

App Node 24 (`node:http` puro, ESM, zero dependências de runtime) rodando em container.

## Desenvolvimento

```bash
docker compose up --build
```

- App em http://localhost:3000
- Health check em http://localhost:3000/health
- Hot reload: o código do host é montado em `/app` e o `nodemon -L` reinicia o processo a cada alteração.

Parar:

```bash
docker compose down
```

## Produção

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

Ou só a imagem:

```bash
docker build --target prod -t node-app .
docker run -p 3000:3000 --rm node-app
```

## Estrutura

| Arquivo | Papel |
| --- | --- |
| `Dockerfile` | Multi-stage: `deps` (deps de prod) → `dev` (hot reload) / `prod` (imagem enxuta) |
| `docker-compose.yml` | Ambiente de dev com bind mount |
| `docker-compose.prod.yml` | Override de produção (sem bind mount, `NODE_ENV=production`) |
| `.dockerignore` | Mantém `node_modules` e afins fora do build context |

## Notas

- O container roda como usuário `node` (não-root).
- O volume anônimo `/app/node_modules` impede que o bind mount do host apague as dependências instaladas na imagem.
- Depois de mudar o `package.json`, rode `docker compose up --build` para reinstalar as dependências.
- Variáveis de ambiente: copie `.env.example` para `.env` (o compose lê se existir).

## Autocomplete do editor (`@types/node`)

O IntelliSense de arquivo `.js` no VS Code é o TypeScript Server rodando por baixo. Módulos
internos como `node:fs` não existem como arquivo em disco — vivem compilados dentro do binário
do Node —, então o editor só sabe o que eles exportam se o pacote `@types/node` estiver
presente. Sem ele, `node:` não completa e o editor cai no fallback de navegador (sugere
`fontSize`, `flexShrink`…).

Aqui as dependências vivem no volume anônimo `/app/node_modules`, invisível para o host. Como
não há Node instalado no Windows, instale no container e copie **só os tipos** para o host:

```bash
docker compose exec -u root app npm i -D @types/node@24
docker compose cp app:/app/node_modules/@types ./node_modules/@types
docker compose cp app:/app/node_modules/undici-types ./node_modules/undici-types
```

Depois, no VS Code: `Ctrl+Shift+P` → **TypeScript: Restart TS Server**.

- O `-u root` é necessário porque o `npm ci` do `Dockerfile` roda antes do `USER node`, então
  `/app/node_modules` pertence a `root` e o usuário `node` não consegue escrever nele.
- `undici-types` é dependência do `@types/node` (tipos do `fetch`); sem ela o editor reclama.
- Trave o major dos tipos no major do Node (24 aqui): tipos de v18 marcam APIs novas como inexistentes.
- `@types/node` é `devDependency` e não vai para a imagem de produção (`npm ci --omit=dev`).
- `node_modules` está no `.gitignore`: quem clonar o repo precisa repetir os dois `cp` acima
  (ou rodar `npm install` local, se tiver Node no host).

## Comandos úteis

```bash
docker compose logs -f app          # logs
docker compose exec app sh          # shell no container
docker compose up --build --force-recreate   # rebuild do zero
docker compose up --build # constrói/reconstrói a imagem e inicia a aplicação
```
## DENTRO DO CONTAINER

```bash
docker compose exec app sh # entrar no container
```

```bash
node -v                 # v24.20.0
npm -v                  # 11.19.0
ls                      # seu código, montado do host
node -e "console.log(1+1)" # imprime no terminal = 2 
wget -qO- http://127.0.0.1:3000/health
exit                    # sair
```

