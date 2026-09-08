# Tutorial Node

Anotações do que foi implementado neste projeto. Cada assunto tem: o conceito, o código, como rodar e o que a saída significa.

Tudo roda dentro do container (veja o [README](README.md)):

```bash
docker compose up --build               # sobe o ambiente
docker compose exec app node <arquivo>  # executa um script
```

---

## Índice

1. [Buffer](w1BUFFER.MD) — é o mecanismo que entrega os dados aos poucos.
2. [Stream](w2STREAM.MD) — é o formato de cada pedaço entregue.