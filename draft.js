const puppeteer = require('puppeteer');
const path = require('path');
const config = require('./src/config');

async function run() {
    const browser = await puppeteer.launch(config.dev);
    const page = await browser.newPage();

    page.setDefaultTimeout(0);

    await page.goto('https://professor.uffs.edu.br/');
    await page.screenshot({ path: './professor.png'});

    await page.type('[type=text][name=j_username]', '');
    await page.type('[type=password][name=j_password]', '');
    await page.click('[type=submit][value=Entrar]');

    //await page.goto('http://dev.local.com/uffs-sga-scraping-p/tests/data/logado/inicial/Portal%20Professor.html');
    
    await page.waitForSelector('form[action$="inicio.xhtml"]');
    
    /*
    // Extract the results from the page.
    const links = await page.evaluate(() => {
        const linksMenu = Array.from(document.querySelectorAll('a.ui-menuitem-link'));
        console.log(linksMenu);
        return linksMenu.map(anchor => {
            console.log(anchor.textContent);
            const title = anchor.textContent.split('|')[0].trim();
            //return `${title} - ${anchor.href} - ${anchor.id}`;
            return {texto: title, href: anchor.href, id: anchor.id};
        });
    });

    console.log(links);
*/
    //await page.goto('http://dev.local.com/uffs-sga-scraping-p/tests/data/logado/percentual-integralizacao/Portal%20Professor.html');
    const page2 = await browser.newPage();
    page2.setDefaultTimeout(0);
    
    await page2.goto('https://professor.uffs.edu.br/restrito/graduacao/coordenador/percentual-integralizacao.xhtml');
    await page2.waitForSelector('a[title="Sair"]');

    await page2._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path.join(process.cwd(), 'data', 'downloads')});
/*
    const links = await page.evaluate(() => {
        const imgBuscar = document.querySelectorAll('a.ui-commandlink > img[title="Buscar"]');
        const linkBuscar = imgBuscar[0].parentNode;
        const title = linkBuscar.textContent.split('|')[0].trim();
            
        return {texto: title, href: linkBuscar.href, id: linkBuscar.id};
    });

    console.log(links);

    await page.click('a#' + links.id);
    await page.waitFor(3000);
*/

    const [button] = await page2.$x("//a[img[contains(@title, 'Buscar')]]");
    
    if (button) {
        console.log('Click!');
        Promise.all([
            await button.click(),
            await page2.waitForNavigation({ waitUntil: 'domcontentloaded' })
        ]);
    }

    console.log('esperando botao');
    await page2.waitForSelector("a.ui-commandlink > img");
    console.log('antes botao');

    await page.waitFor(2000);

    const [botaoGerarPlanilha] = await page2.$x("//a[img[contains(@title, 'Gerar')]]");
    
    if (botaoGerarPlanilha) {
        console.log('Botao planilha!');
        //Promise.all([
            await botaoGerarPlanilha.click();
            //await page2.waitForNavigation()
        //]);
    }

    await page.waitFor(5000);

    browser.close();
}

run();