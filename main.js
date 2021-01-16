const config = require('./src/config');
const sga = require('./src/sga');
const percentualIntegralizacao = require('./src/percentualIntegralizacao');
const historicoEscolar = require('./src/historicoEscolar');
const listaAlunos = require('./src/listaAlunos');

async function run() {
    const instance = await sga.create(config.dev);
    
    await percentualIntegralizacao.baixaPlanilha(instance);
    await historicoEscolar.run(instance);
    await listaAlunos.run(instance);

    sga.destroy();
}

run();