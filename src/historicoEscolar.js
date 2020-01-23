const path = require('path');

async function acessaPagina(sga) {
    const page = await sga.newTab();
    
    await page.goto('https://professor.uffs.edu.br/restrito/graduacao/coordenador/historico-escolar.xhtml');    
    await page.waitForSelector("a.ui-commandlink > img");
    
    return page;
}

async function extraiHistoricoDaPagina(page) {
    // TODO: usar querySelectorAll('div.ui-tabs-panel table[role="grid"]').forEach(function(el) { console.log(el.rows); });
    await page.$eval('div.ui-tabs-panel div[role="tabpanel"]', (el, value) => el.value = value);
    await page.waitFor(15000);
}

async function escolheBuscaPorMatricula(page) {
    const [label] = await page.$x("//label[contains(., 'Matrícula')]");
    
    if (label) {
        console.log('Click!');
        await label.click();
    } else {
        console.error('Algum problema');
    }

    console.log('esperando botao');
    await page.waitForSelector("input[alt='Matrícula']");
    console.log('antes botao');
    
    const matricula = '';  
    await page.$eval("input[alt='Matrícula']", (el, value) => el.value = value, matricula);

    console.log('esperando botao');
    await page.waitForSelector("a.ui-commandlink > img");
    console.log('antes botao');

    const [botaoBuscar] = await page.$x("//a[img[contains(@title, 'Buscar')]]");
    
    if (botaoBuscar) {
        console.log('Botao buscar!');
        await botaoBuscar.click()
    }

    console.log('esperando academico');
    await page.waitForSelector("a.ui-commandlink > img[title='Selecionar Acadêmico']");
    console.log('antes academico');

    const [botaoSelecionarAcademico] = await page.$x("//a[img[contains(@title, 'Selecionar Acadêmico')]]");
    
    if (botaoSelecionarAcademico) {
        console.log('Botao selecionar academico!');
        await botaoSelecionarAcademico.click()
    }

    console.log('esperando dados');
    await page.waitForSelector("a.ui-commandlink > img[title='Histórico Escolar']");

    await extraiHistoricoDaPagina(data);

    // TODO: pegar pasta de downloads do config
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path.join(process.cwd(), 'data', 'downloads')});

    const [botaoBaixarHistoricoConclusao] = await page.$x("//a[img[contains(@title, 'Histórico Escolar de Conclusão')]]");
    
    if (botaoBaixarHistoricoConclusao) {
        console.log('Botao botaoBaixarHistoricoConclusao!');
        await botaoBaixarHistoricoConclusao.click()
    }

    // TODO: aguardar pelo arquivo ter sido baixado
    await page.waitFor(5000);

    const [botaoBaixarHistorico] = await page.$x("//a[img[contains(@title, 'Histórico Escolar')]]");
    
    if (botaoBaixarHistorico) {
        console.log('Botao botaoBaixarHistorico!');
        await botaoBaixarHistorico.click()
    }

    // TODO: aguardar pelo arquivo ter sido baixado
    await page.waitFor(15000);

    console.log('Pronto');
}

async function run(sga) {
    const page = await acessaPagina(sga);
    await escolheBuscaPorMatricula(page);
}

module.exports = {
    run,
    acessaPagina
}