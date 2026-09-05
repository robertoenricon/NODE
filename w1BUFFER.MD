# Buffer

Arquivo: `src/buffer/buffer-example.js`

```bash
docker compose exec app node src/buffer/buffer-example.js
```

## O conceito

**Buffer representa dados binarios em memoria.**

Um **Buffer** é um pedaço de memória bruta, que guarda **bytes**. JavaScript nasceu sem um tipo para dados binários — só tinha string, e string é texto, com codificação. Quando o Node precisou lidar com arquivo, rede e imagem, ele precisou de algo que representasse "os bytes exatos, sem interpretação".

Na prática o Buffer aparece sempre que dados **entram ou saem** do processo:

- corpo de requisições HTTP
- upload de arquivos
- streams
- imagens, PDFs, qualquer binário
- dados vindos da rede

---