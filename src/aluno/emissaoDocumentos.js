const utils = require('../utils');

async function acessaPagina(sga) {
    const page = await sga.newTab();
    
    await page.goto('https://aluno.uffs.edu.br/');    
    await page.waitForSelector("li a.ui-corner-all");
    
    return page;
}

async function baixaSituacaoMatriculaPdf(page) {
    const pdfPath = await clickBotaoDownload(page, "//button[contains(., 'Atestado')]");
    return pdfPath;
}

async function baixaHistoricoConclusaoPdf(page) {
    const pdfPath = await clickBotaoDownload(page, "//button[contains(., 'Conclusão')]");
    return pdfPath;
}

async function clickBotaoDownload(page, xpath) {
    const [botaoBaixar] = await page.$x(xpath);
    
    const randomDownloadDir = await utils.createTempDir();
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: randomDownloadDir});

    if (botaoBaixar) {
        await botaoBaixar.click();
    }

    await utils.checkFileDownloadedIntoEmptyDir(randomDownloadDir, 20);

    const pdfPath = utils.getFilePathInDir(randomDownloadDir, '.pdf');
    return pdfPath;
}

async function run(aluno, argv) {
    var situacaoMatriculaPdfPath = null;
    var historicoConclusaoPdfPath = null;

    const page = await acessaPagina(aluno);

    await escolheEmissaoDocumentos(page);

    if (argv['situacao-pdf']) {
        situacaoMatriculaPdfPath = await baixaSituacaoMatriculaPdf(page);
    }

    if (argv['conclusao-pdf']) {
        historicoConclusaoPdfPath = await baixaHistoricoConclusaoPdf(page);
    }

    return {
        situacaoMatriculaPdfPath: situacaoMatriculaPdfPath,
        historicoConclusaoPdfPath: historicoConclusaoPdfPath
    }
}

async function escolheEmissaoDocumentos(page) {
    const [label] = await page.$x("//a[contains(., 'Emissão de Documentos')]");
    
    if (label) {
        await label.click();
    } else {
        console.error('Algum problema');
    }

    await page.waitForSelector("a.ui-icon.ui-icon-home");
}

module.exports = {
    run
}