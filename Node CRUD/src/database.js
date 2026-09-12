
import fs from "node:fs/promises";

// Caminho que eu escolho pra salvar o arquivo
// import.meta.url PATH atual
const databaseFile = new URL("../files/database.json", import.meta.url);

// Banco em arquivo: mantém tudo em memória (leitura rápida, sem I/O) e reescreve o JSON
export class Database {
    #database = {}

    // Carrega o arquivo para a memória no momento em que a instância nasce.
    constructor() {
        fs.readFile(databaseFile, "utf-8").then(data => {
            // Arquivo lido: o texto vira o objeto que passa a viver em memória.
            this.#database = JSON.parse(data)
        }).catch(() => {
            // Inicializa o banco vazio e persiste imediatamente.
            this.#database = {} 
        })
    }

    // Devolve todos os registros de uma tabela.
    select (table) {
        // pode dar .map/.length sem checar undefined antes.
        const data = this.#database[table] ?? []
        return data
    }

    // Adiciona um registro na tabela, criando a tabela quando for a primeira inserção.
    insert (table, data) {
        // Array.isArray separa os dois casos: tabela já existente x primeira inserção.
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data)
        } else {
            // A tabela nasce já com o registro dentro.
            this.#database[table] = [data]
        }

        // Chamar a função de persistência para salvar as alterações no disco.
        this.#persis()
        // Devolver o registro poupa quem chamou de remontar o objeto.
        return data
    }

    // Atualiza um registro na tabela
    update (table, id, data) {
        const tableData = this.#database[table] ?? []
        const index = tableData.findIndex(item => item.id === id)

        if (index > -1) {
            tableData[index] = data
            this.#database[table] = tableData
            this.#persis()
            return data
        }

        return null
    }

    // Grava o estado da memória no disco. Privado porque persistir é decisão interna da classe: quem usa chama insert, nunca "salva" na mão.
    #persis() {
        // JSON.stringify converte o objeto em texto, que é o que um arquivo sabe guardar.
        fs.writeFile(databaseFile, JSON.stringify(this.#database))
        .catch(err => {
            console.error("Erro ao persistir o banco de dados:", err);
        });
    }

}
