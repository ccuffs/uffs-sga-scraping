const fs = require('fs');
const sga = require('./src/sga');
const percentualIntegralizacao = require('./src/percentualIntegralizacao');
const historicoEscolar = require('./src/historicoEscolar');
const listaAlunos = require('./src/listaAlunos');

function help() {
    console.log('UFFS SGA Scraper - v1.0.0');
    console.log('');
    console.log('Uso:');
    console.log('  sgas [options]');
    console.log('  node main.js [options]');
    console.log('  npm run -- [options]');
    console.log('');
    console.log('Options:');
    console.log('  --config=<str>          Caminho para arquivo config.json (default ./config.json).');
    console.log('  --saida=<str>           Diretório para saída de arquivos resultado (default .).');
    console.log('  --usuario=<str>         idUFFS do usuário que fará o acesso aos dado no SGA.');
    console.log('                          Por default esse valor é obtido do arquivo de config.');
    console.log('  --senha=<str>           Senha do usuário que fará o acesso aos dado no SGA.');
    console.log('                          Por default esse valor é obtido do arquivo de config.');
    console.log('  --alunos, -a            Cria uma lista com todos os alunos do curso.');
    console.log('  --conclusoes, -c        Obtem o percentual de integralização do curso de todos os alunos.');
    console.log('  --matricula=<int>       Matrícula de um aluno a ser analisado. Necessário informar');
    console.log('                          se usar --historico, --historico-conclusao.');
    console.log('  --historico             Obtem o histórico de um aluno via matrícula.');
    console.log('  --print, -p             Imprime resultados textuais ao invés de salvar em arquivo json');
    console.log('                          no diretório de saída.');
    console.log('  --debug, -d             Roda em modo visual, sem ser headless (ignora config).');
    console.log('  --help, -h              Mostra essa ajuda.');
}

async function run(argv) {
    if(argv.h || argv.help) {
        return help();
    }

    var configPath = argv.config ? argv.config : './config.json';
    
    if(!fs.existsSync(configPath)) {
        throw 'Erro ao carregar config: ' + configPath;
    }

    var config = require(configPath);

    var outputPath = argv.output ? argv.output : '.';
    
    if(!fs.existsSync(outputPath)) {
        throw 'Não foi possível acessar diretório de saida: ' + outputPath;
    }

    if(argv.d || argv.debug) config.headless = false;
    if(argv.user) config.auth.user = argv.user;
    if(argv.password) config.auth.password = argv.password;

    if(!config.auth.user) {
        throw 'Nenhum usuário informado no config.json ou via --user.';
    }

    if(!config.auth.password) {
        throw 'Nenhuma senha informada no config.json ou via --password.';
    }

    const matricula = argv.matricula ? argv.matricula : null;
    const exigeMatricula = argv.historico;

    if(exigeMatricula && !matricula) {
        throw 'Configuração de opções escolhida exige uso de --matricula.';
    }

    const imprimir = argv.p || argv.print;
    const instance = await sga.create(config);
    
    if(argv.alunos || argv.a) {
        const alunos = await listaAlunos.run(instance);
        if(imprimir) console.log(alunos);
    }

    if(argv.conclusoes || argv.c) {
        const integralizacoes = await percentualIntegralizacao.run(instance);
        if(imprimir) console.log(integralizacoes);
    }

    if(argv.historico) {
        const historico = await historicoEscolar.run(instance);
        if(imprimir) console.log(historico);
    }

    sga.destroy();
}

var argv = require('minimist')(process.argv.slice(2));

try {
    run(argv);
    return 0;

} catch(error) {
    console.error(error);
}
