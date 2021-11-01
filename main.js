const fs = require('fs');
const os = require('os');
const path = require('path');
const utils = require('./src/utils');
const { exit } = require('process');

const runners = {
    'professor': require('./src/professor/runner'),
    'aluno': require('./src/aluno/runner'),
}

function help() {
    console.log('UFFS SGA Scraper - v2.0.0');
    console.log('Cli para leitura de dados do Sistema de Gestão Acadêmica da UFFS.');
    console.log('');
    console.log('Uso:');
    console.log('  sga <runner> [options] [runner-options]');
    console.log('  node main.js <runner> [options] [runner-options]');
    console.log('  npm run -- <runner> [options] [runner-options]');
    console.log('');
    console.log('Runner:');
    console.log('  professor               Usa o portal do professor/coordenação para obtenção de dados.');
    console.log('  aluno                   Usa o portal do alunopara obtenção de dados.');
    console.log('');
    console.log('Options:');
    console.log('  --config=<str>            Caminho para arquivo config.json (default ./config.json).');
    console.log('  --saida=<str>             Diretório para saída de arquivos resultado (default ./data/downloads).');
    console.log('  --usuario=<str>           idUFFS do usuário que fará o acesso aos dado no SGA.');
    console.log('                            Por default esse valor é obtido do arquivo de config.');
    console.log('  --senha=<str>             Senha do usuário que fará o acesso aos dado no SGA.');
    console.log('                            Por default esse valor é obtido do arquivo de config.');
    console.log('  --save, -s                Salva resultados em arquivo json ao inves de imprimir.');
    console.log('  --debug, -d               Roda em modo visual, sem ser headless (ignora config).');
    console.log('  --help, -h                Mostra essa ajuda.');
    console.log('');    
    console.log('Options (runner professor):');
    console.log('  --alunos, -a              Cria uma lista com todos os alunos do curso.');
    console.log('  --conclusoes, -c          Obtem o percentual de integralização do curso de todos os alunos.');
    console.log('  --matricula=<int>         Matrícula de um aluno a ser analisado. Necessário informar');
    console.log('                            se usar --historico, --historico-pdf, --conclusao-pdf.');
    console.log('  --historico               Obtem o histórico de um aluno via matrícula.');
    console.log('  --historico-pdf           Obtem o histórico em PDF de um aluno via matrícula.');
    console.log('  --conclusao-pdf           Obtem o histórico em PDF de integralização um aluno via matrícula.');
    console.log('');        
    console.log('Options (runner aluno):');
    console.log('  --historico               Obtem o histórico do aluno.');
    console.log('  --situacao-pdf            Obtem o atestado de situação de matrícula em PDF.');
    console.log('  --conclusao-pdf           Obtem o histórico de conclusão em PDF.');
    console.log('');      
    console.log('Exemplos:');
    console.log('  node main.js professor --config=config.json --alunos');
    console.log('  node main.js professor --config=config.json --historico --matricula=123');
    console.log('  node main.js professor --config=config.json --conclusoes --alunos');
    console.log('  node main.js aluno --config=config.json --acompanhamento-matriz');
    console.log('');
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

    const requestedRunners = argv._;

    if (requestedRunners.length == 0) {
        throw 'Nenhum runner informado. Rode com -h para ajuda.';
    }

    for (const id in runners) {
        if (!requestedRunners.includes(id)) {
            continue;
        }
        
        const dados = await runners[id].run(config, argv);

        utils.output(dados, argv);
    }
}

var argv = require('minimist')(process.argv.slice(2));

process.on('unhandledRejection', (reason, p) => {
    console.error(reason);
    exit(99);
});

try {
    run(argv);
    return 0;

} catch(error) {
    console.log(error);
    exit(9);
}
