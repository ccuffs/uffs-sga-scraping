const path = require('path');

async function baixaPlanilha(sga) {
    const page = await sga.newTab();
    
    await page.goto('https://professor.uffs.edu.br/restrito/graduacao/coordenador/percentual-integralizacao.xhtml');
    await page.waitForSelector('a[title="Sair"]');

    // TODO: pegar pasta de downloads do condig
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path.join(process.cwd(), 'data', 'downloads')});

    const [button] = await page.$x("//a[img[contains(@title, 'Buscar')]]");
    
    if (button) {
        console.log('Click!');
        Promise.all([
            await button.click(),
            await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
        ]);
    }

    console.log('esperando botao');
    await page.waitForSelector("a.ui-commandlink > img");
    console.log('antes botao');

    await page.waitFor(2000);

    const [botaoGerarPlanilha] = await page.$x("//a[img[contains(@title, 'Gerar')]]");
    
    if (botaoGerarPlanilha) {
        console.log('Botao planilha!');
        await botaoGerarPlanilha.click()
    }

    // TODO: aguardar pelo arquivo ter sido baixado
    await page.waitFor(5000);
}

async function run(sga) {
    // TODO: faz todas as ações do módulo
}

module.exports = {
    run,
    baixaPlanilha
}