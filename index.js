const puppeteer = require('puppeteer');

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://professor.uffs.edu.br/');
    await page.screenshot({ path: './professor.png'});

    await page.type('[type=text][name=j_username]', '');
    await page.type('[type=password][name=j_password]', '');
    await page.click('[type=submit][value=Entrar]');

    await page.waitForSelector('form[action$="inicio.xhtml"]');
    await page.screenshot({ path: './professor2.png'});

    browser.close();
}

run();