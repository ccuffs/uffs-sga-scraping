const path = require('path');

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
                console.log('header');

                // Coleta o nome das colunas da tabela
                table.querySelectorAll('th span').forEach(function(headerCell, idx) {
                    console.log(headerCell.innerText);                
                    columnNames.push(headerCell.innerText);
                });

                console.log('rows');

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

    console.log('colhendo dados');
    console.log(tabs);

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

            console.log(name);            

            bloco.querySelectorAll('td').forEach(function(info) {
                if(!info.innerText) {
                    return;
                }
                infos.values.push(info.innerText);
            });

            blocos.push(infos);
        });

        console.log(blocos);

        return blocos;
    });
}

async function baixaHistoricoConclusao(page) {
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

}

async function escolheBuscaPorMatricula(page, matricula) {
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

    console.log('Pronto');
}

async function run(sga) {
    const page = await acessaPagina(sga);
    const matricula = '1411100031';

    await escolheBuscaPorMatricula(page, matricula);

    var historico = await extraiHistoricoDaPagina(page);
    var infos = await obtemInfosTextuaisHistorico(page);

    await baixaHistoricoConclusao(page);

    console.log(historico);
    console.log(infos);
}

module.exports = {
    run
}