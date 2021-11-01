const puppeteer = require('puppeteer');

const acompanhamentoMatriz = require('./acompanhamentoMatriz');
const emissaoDocumentos = require('./emissaoDocumentos');

async function login(browser, config) {
    const page = await browser.newPage();

    page.setDefaultTimeout(0);

    await page.goto('https://aluno.uffs.edu.br/');
    await page.waitForSelector('#idToken1', { visible: true, timeout: 60 * 1000 });

    await page.type('[type=text][name="callback_0"]', config.auth.user + '');
    await page.type('[type=password][name="callback_1"]', config.auth.password + '');
    await page.click('[type=submit][value=Entrar]');

    const [error] = await page.$x("//body[contains(., 'inválidos')]");

    if (error) {
        throw 'Usuário ou senha de acesso invalidos';
    }

    // Login deu certo.
    await page.waitForSelector('form[action$="index_graduacao.xhtml"]', {timeout: 60 * 1000 });
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
    var aluno = {
        browser: await launch(config),
        config: config,
        newTab: async function() {
            var page = await this.browser.newPage();
            page.setDefaultTimeout(0);
        
            return page;
        }
    }

    const data = await process(aluno, argv);
    destroy(aluno);

    return data;
}

async function destroy(aluno) {
    aluno.browser.close();
}

async function process(instance, argv) {
    var dados = {};

    if (argv['historico']) {
        dados.acompanhamentoMatriz = await acompanhamentoMatriz.run(instance, argv);
    }

    dados.emissaoDocumentos = await emissaoDocumentos.run(instance, argv);

    return dados;
}

module.exports = {
    run
}