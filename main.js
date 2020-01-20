const config = require('./src/config');
const sga = require('./src/sga');
const percentualIntegralizacao = require('./src/percentualIntegralizacao');

async function run() {
    const instance = await sga.create(config.dev);
    
    await percentualIntegralizacao.baixaPlanilha(instance);

    sga.destroy();
}

run();