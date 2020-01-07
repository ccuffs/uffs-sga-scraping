const puppeteer = require('puppeteer');

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

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
    await page.goto('https://professor.uffs.edu.br/restrito/graduacao/coordenador/percentual-integralizacao.xhtml');
    await page.waitForSelector('a[title="Sair"]');
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

    const [button] = await page.$x("//a[img[contains(@title, 'Buscar')]]");
    
    if (button) {
        console.log('Click!');
        await button.click();
        await page.waitForNavigation();
    }

    await page.waitForSelector('a.ui-commandlink > img[title="Gerar Planilha Eletrônica"]');

    const [botaoGerarPlanilha] = await page.$x("//a[img[contains(@title, 'Gerar Planilha Eletrônica')]]");
    
    if (botaoGerarPlanilha) {
        console.log('Botao planilha!');
        await botaoGerarPlanilha.click();
        await page.waitForNavigation();
    }

    //await page.waitFor(5000);
    await page.screenshot({ path: './professor3.png'});

    browser.close();
}

run();