const puppeteer = require('puppeteer');

const utils = require('../utils');

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

async function newTab() {
    var page = await sga.browser.newPage();
    page.setDefaultTimeout(0);

    return page;
}

async function run(config, argv) {
    var aluno = {
        browser: await launch(config),
        config: config,
        newTab: newTab
    }

    process(aluno, argv);
    destroy(aluno);
}

async function destroy(aluno) {
    aluno.browser.close();
}

async function process(instance, argv) {
    console.log('aluno');
}

module.exports = {
    run
}