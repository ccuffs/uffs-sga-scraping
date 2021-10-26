const puppeteer = require('puppeteer');

const percentualIntegralizacao = require('./percentualIntegralizacao');
const historicoEscolar = require('./historicoEscolar');
const listaAlunos = require('./listaAlunos');
const utils = require('../utils');

async function login(browser, config) {
    const page = await browser.newPage();

    page.setDefaultTimeout(0);

    await page.goto('https://professor.uffs.edu.br/');

    await page.type('[type=text][name=j_username]', config.auth.user + '');
    await page.type('[type=password][name=j_password]', config.auth.password + '');
    await page.click('[type=submit][value=Entrar]');

    const [error] = await page.$x("//body[contains(., 'não conferem')]");

    if (error) {
        throw 'Usuário ou senha de acesso invalidos';
    }

    // Login deu certo.
    await page.waitForSelector('form[action$="inicio.xhtml"]');
}

async function launch(config) {
    const browser = await puppeteer.launch(config);
    try {
        await login(browser, config);
    } catch (error) {
        browser.close();
        throw error;
    }
    return browser;
}



async function run(config, argv) {
    var sga = {
        browser: await launch(config),
        config: config,
        newTab: async function() {
            var page = await this.browser.newPage();
            page.setDefaultTimeout(0);
        
            return page;
        }
    }

    const data = await process(sga, argv);
    destroy(sga);

    return data;
}

async function destroy(sga) {
    sga.browser.close();
}

async function process(instance, argv) {
    var data = {};
    const matricula = argv.matricula ? argv.matricula : null;
    const exigeMatricula = argv.historico ||
                           argv['historico-pdf'] ||
                           argv['conclusao-pdf'];

    if(exigeMatricula && !matricula) {
        throw 'Configuração de opções escolhida exige uso de --matricula.';
    }
    
    if(argv.alunos || argv.a) {
        const alunos = await listaAlunos.run(instance);
        utils.output(alunos, argv);
        data.alunos = alunos;
    }

    if(argv.conclusoes || argv.c) {
        const integralizacoes = await percentualIntegralizacao.run(instance);
        utils.output(integralizacoes, argv);
        data.integralizacoes = integralizacoes;
    }

    const isHistorico = argv.historico || argv['historico-pdf'] || argv['conclusao-pdf'];
    
    if(isHistorico) {
        const optHistorico = {
            matricula: matricula,
            pdf: argv['historico-pdf'] || false,
            conclusaoPdf: argv['conclusao-pdf'] || false
        }
        
        const dados = await historicoEscolar.run(instance, optHistorico);
        utils.output(dados, argv);
        data.historico = dados;
    }

    return data;
}

module.exports = {
    run
}