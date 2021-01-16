const path = require('path');

async function acessaPagina(sga) {
    const page = await sga.newTab();
    
    await page.goto('https://professor.uffs.edu.br/restrito/graduacao/coordenador/percentual-integralizacao.xhtml');    
    await page.waitForSelector("a.ui-commandlink > img");
    
    return page;
}

async function clicaBuscar(page) {
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
}

async function baixaPlanilha(page) {
    // TODO: pegar pasta de downloads do condig
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path.join(process.cwd(), 'data', 'downloads')});

    const [botaoGerarPlanilha] = await page.$x("//a[img[contains(@title, 'Gerar')]]");
    
    if (botaoGerarPlanilha) {
        console.log('Botao planilha!');
        await botaoGerarPlanilha.click()
    }

    // TODO: aguardar pelo arquivo ter sido baixado
    await page.waitFor(5000);
}

async function extraiTabelaDaPagina(page) {
    console.log('extraiTabelaDaPagina');

    return await page.evaluate(() => {
        var rows = [];
        var columnNames = [];

        // Obtem a tabela de conteudo
        document.querySelectorAll('table[role="grid"]').forEach(function(table) {
            console.log('header');

            // Coleta o nome das colunas da tabela
            table.querySelectorAll('thead tr[role="row"] th span').forEach(function(headerCell, idx) {
                if(!headerCell.innerText) {
                    return;
                }

                console.log(headerCell.innerText);
                columnNames.push(headerCell.innerText);
            });

            console.log('rows');

            // Itera em cada uma das linhas da tabela
            table.querySelectorAll('tbody tr[role="row"]').forEach(function(row, idx) {
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

                rows.push(entry);
            }); 
        }); 

        console.log(rows);
        return rows;
    });
}

async function run(sga, baixarPlanilha = false) {
    const page = await acessaPagina(sga);

    await clicaBuscar(page);

    var integralizacoes = await extraiTabelaDaPagina(page);
    
    if(baixarPlanilha) {
        await baixaPlanilha(page);
    }

    console.log(integralizacoes);
    await page.waitFor(5000);
}

module.exports = {
    run
}