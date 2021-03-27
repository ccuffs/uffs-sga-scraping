const path = require('path');
const utils = require('./utils');

async function acessaPagina(sga) {
    const page = await sga.newTab();
    
    await page.goto('https://professor.uffs.edu.br/restrito/graduacao/coordenador/historico-escolar.xhtml');    
    await page.waitForSelector("a.ui-commandlink > img");
    
    return page;
}

async function extraiHistoricoDaPagina(page) {
    const tabs = await page.evaluate(() => {
        var tabs = [];
        var tabNames = [];

        // Coleta o nome das tabs
        document.querySelectorAll('ul[role="tablist"] li').forEach(function(el, idx) {
            tabNames.push(el.innerText);
        });

        // Itera em cada uma das abas
        document.querySelectorAll('div.ui-tabs-panel[role="tabpanel"]').forEach(function(el, tabIdx) {
            var columnNames = [];
            var tab = {
                name: tabNames[tabIdx],
                rows: []
            };

            // Obtem a tabela de conteudo dentro da tab
            el.querySelectorAll('table[role="grid"]').forEach(function(table) {
                // Coleta o nome das colunas da tabela
                table.querySelectorAll('th span').forEach(function(headerCell, idx) {
                    console.log(headerCell.innerText);                
                    columnNames.push(headerCell.innerText);
                });

                // Itera em cada uma das linhas da tabela na tab corrente
                table.querySelectorAll('tr[role="row"]').forEach(function(row, idx) {
                    var entry = {};
                    var cells = row.getElementsByTagName('td');

                    if(cells.length == 0) {
                        return;
                    }

                    for(var i = 0; i < cells.length; i++) {
                        var columnName = columnNames[i];
                        var columValue = cells[i].innerText;

                        entry[columnName] = columValue;
                    }

                    tab.rows.push(entry);
                }); 
            }); 

            tabs.push(tab);
        });

        return tabs;
    });

    return tabs;
}

async function obtemInfosTextuaisHistorico(page) {
    return await page.evaluate(() => {
        var blocos = [];

        document.querySelectorAll('form#corpo fieldset').forEach(function(bloco) {
            var name = bloco.getElementsByTagName('legend')[0].innerText;
            var infos = {
                name: name,
                values: []
            };

            bloco.querySelectorAll('td').forEach(function(info) {
                if(!info.innerText) {
                    return;
                }
                infos.values.push(info.innerText);
            });

            blocos.push(infos);
        });

        return blocos;
    });
}

async function baixaHistoricoPdf(page) {
    const [botaoBaixarHistorico] = await page.$x("//a[img[contains(@title, 'Histórico Escolar')]]");
    
    const randomDownloadDir = await utils.createTempDir();
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: randomDownloadDir});

    if (botaoBaixarHistorico) {
        await botaoBaixarHistorico.click();
    }

    await utils.checkFileDownloadedIntoEmptyDir(randomDownloadDir, 20);

    const pdfPath = utils.getFilePathInDir(randomDownloadDir, '.pdf');
    return pdfPath;
}

async function baixaHistoricoConclusaoPdf(page) {
    const [botaoBaixarHistoricoConclusao] = await page.$x("//a[img[contains(@title, 'Histórico Escolar de Conclusão')]]");
    
    const randomDownloadDir = await utils.createTempDir();
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: randomDownloadDir});

    if (botaoBaixarHistoricoConclusao) {
        await botaoBaixarHistoricoConclusao.click()
    }
    
    await utils.checkFileDownloadedIntoEmptyDir(randomDownloadDir, 20);
    
    const pdfPath = utils.getFilePathInDir(randomDownloadDir, '.pdf');    
    return pdfPath;
}

async function escolheBuscaPorMatricula(page, matricula) {
    const [label] = await page.$x("//label[contains(., 'Matrícula')]");
    
    if (label) {
        await label.click();
    } else {
        console.error('Algum problema');
    }

    await page.waitForSelector("input[alt='Matrícula']");
    await page.$eval("input[alt='Matrícula']", (el, value) => el.value = value, matricula);
    await page.waitForSelector("a.ui-commandlink > img");

    const [botaoBuscar] = await page.$x("//a[img[contains(@title, 'Buscar')]]");
    
    if (botaoBuscar) {
        await botaoBuscar.click()
    }

    await page.waitForSelector("a.ui-commandlink > img[title='Selecionar Acadêmico']");

    const [botaoSelecionarAcademico] = await page.$x("//a[img[contains(@title, 'Selecionar Acadêmico')]]");
    
    if (botaoSelecionarAcademico) {
        await botaoSelecionarAcademico.click()
    }

    await page.waitForSelector("a.ui-commandlink > img[title='Histórico Escolar']");
}

async function run(sga, opts) {
    const page = await acessaPagina(sga);

    await escolheBuscaPorMatricula(page, opts.matricula);

    var historico = await extraiHistoricoDaPagina(page);
    var infos = await obtemInfosTextuaisHistorico(page);
    var historicoPdfPath = null;
    var historicoConclusaoPdfPath = null;

    if(opts.pdf) {
        historicoPdfPath = await baixaHistoricoPdf(page);
    }

    if(opts.conclusaoPdf) {
        historicoConclusaoPdfPath = await baixaHistoricoConclusaoPdf(page);
    }

    return {
        historico: historico,
        infos: infos,
        pdfPath: historicoPdfPath,
        conclusaoPdfPath: historicoConclusaoPdfPath
    }
}

module.exports = {
    run
}