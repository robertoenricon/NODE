// Devolve o objeto quando o corpo é válido, ou null quando está vazio/malformado.
export async function json (req) {

    // Precisa consumir o stream ANTES de decidir qualquer coisa: só depois
    // de ler todos os chunks dá pra saber se o corpo veio vazio.
    const buffers = []
    for await (const chunk of req) {
        buffers.push(chunk)
    }

    try {
        const body = JSON.parse(Buffer.concat(buffers).toString('utf8'))

        // JSON.parse devolve QUALQUER JSON válido: "um texto", 42, [] e null.
        // Uma API que espera campos nomeados só consegue trabalhar com objeto.
        if (typeof body !== 'object' || body === null || Array.isArray(body)) {
            return null
        }

        return body
    } catch {
        // Corpo vazio ou JSON malformado: JSON.parse lança SyntaxError.
        // Aqui o erro é ESPERADO, então vira null em vez de subir e virar 500.
        return null
    }
}
