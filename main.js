const fs = require('fs');
const os = require('os');
const path = require('path');
const sga = require('./src/sga');
const percentualIntegralizacao = require('./src/percentualIntegralizacao');
const historicoEscolar = require('./src/historicoEscolar');
const listaAlunos = require('./src/listaAlunos');
const utils = require('./src/utils');
const { exit } = require('process');

function help() {
    console.log('UFFS SGA Scraper - v1.0.0');
    console.log('Cli para leitura de dados do portal do coordenador da UFFS.');
    console.log('');
    console.log('Uso:');
    console.log('  sgas [options]');
    console.log('  node main.js [options]');
    console.log('  npm run -- [options]');
    console.log('');
    console.log('Options:');
    console.log('  --config=<str>          Caminho para arquivo config.json (default ./config.json).');
    console.log('  --saida=<str>           Diretório para saída de arquivos resultado (default ./data/downloads).');
    console.log('  --usuario=<str>         idUFFS do usuário que fará o acesso aos dado no SGA.');
    console.log('                          Por default esse valor é obtido do arquivo de config.');
    console.log('  --senha=<str>           Senha do usuário que fará o acesso aos dado no SGA.');
    console.log('                          Por default esse valor é obtido do arquivo de config.');
    console.log('  --alunos, -a            Cria uma lista com todos os alunos do curso.');
    console.log('  --conclusoes, -c        Obtem o percentual de integralização do curso de todos os alunos.');
    console.log('  --matricula=<int>       Matrícula de um aluno a ser analisado. Necessário informar');
    console.log('                          se usar --historico, --historico-pdf, --conclusao-pdf.');
    console.log('  --historico             Obtem o histórico de um aluno via matrícula.');
    console.log('  --historico-pdf         Obtem o histórico em PDF de um aluno via matrícula.');
    console.log('  --conclusao-pdf         Obtem o histórico em PDF de integralização um aluno via matrícula.');
    console.log('  --save, -s              Salva resultados em arquivo json ao inves de imprimir.');
    console.log('  --debug, -d             Roda em modo visual, sem ser headless (ignora config).');
    console.log('  --help, -h              Mostra essa ajuda.');
}

function output(result, argv) {
    const text = JSON.stringify(result);

    if(argv && !argv.s && !argv.save) {
        console.log(text);
    }
}

async function run(argv) {
    if(argv.h || argv.help) {
        return help();
    }

    var configPath = argv.config ? argv.config : path.resolve(path.dirname(require.main.filename), 'config.json.example');

    if(!fs.existsSync(configPath)) {
        throw 'Erro ao carregar config: ' + configPath;
    }

    var configContent = fs.readFileSync(configPath);
    var config = JSON.parse(configContent);

    var downloadDir = argv.saida ? argv.saida : os.tmpdir();
    
    if(!fs.existsSync(downloadDir)) {
        throw `Diretório de download informado em --saida é inacessível: "${downloadDir}"`;
    }

    if(argv.d || argv.debug) config.headless = false;
    if(argv.usuario) config.auth.user = argv.usuario;
    if(argv.senha) config.auth.password = argv.senha;

    if(!config.auth.user) {
        throw 'Nenhum usuário informado no config.json ou via --usuario.';
    }

    if(!config.auth.password) {
        throw 'Nenhuma senha informada no config.json ou via --senha.';
    }

    const matricula = argv.matricula ? argv.matricula : null;
    const exigeMatricula = argv.historico ||
                           argv['historico-pdf'] ||
                           argv['conclusao-pdf'];

    if(exigeMatricula && !matricula) {
        throw 'Configuração de opções escolhida exige uso de --matricula.';
    }

    const instance = await sga.create(config);
    
    if(argv.alunos || argv.a) {
        const alunos = await listaAlunos.run(instance);
        output(alunos, argv);
    }

    if(argv.conclusoes || argv.c) {
        const integralizacoes = await percentualIntegralizacao.run(instance);
        output(integralizacoes, argv);
    }

    const isHistorico = argv.historico || argv['historico-pdf'] || argv['conclusao-pdf'];
    
    if(isHistorico) {
        const optHistorico = {
            matricula: matricula,
            pdf: argv['historico-pdf'] || false,
            conclusaoPdf: argv['conclusao-pdf'] || false
        }
        
        const dados = await historicoEscolar.run(instance, optHistorico);
        output(dados, argv);
    }

    sga.destroy();
}

var argv = require('minimist')(process.argv.slice(2));

process.on('unhandledRejection', (reason, p) => {
    console.log(reason);
    exit(99);
});

try {
    run(argv);
    return 0;

} catch(error) {
    console.log(error);
    exit(9);
}
