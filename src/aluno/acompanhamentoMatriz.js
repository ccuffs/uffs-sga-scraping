const utils = require('../utils');

async function acessaPagina(aluno) {
    const page = await aluno.newTab();

    await page.goto('https://aluno.uffs.edu.br/');    
    await page.waitForSelector("li a.ui-corner-all");

    return page;
}

async function extraiHistoricoDaPagina(page) {
    const tabs = await page.evaluate(() => {
        var tabs = [];
        var tabNames = [];

        // Coleta o nome das tabs
        document.querySelectorAll('ul.ui-tabs-nav li').forEach(function(el, idx) {
            tabNames.push(el.innerText);
        });

        // Itera em cada uma das abas
        document.querySelectorAll('div.ui-tabs-panel').forEach(function(el, tabIdx) {
            var columnNames = [];
            var tab = {
                name: tabNames[tabIdx],
                rows: []
            };

            // Obtem a tabela de conteudo dentro da tab
            el.querySelectorAll('div.ui-datatable table').forEach(function(table) {
                // Coleta o nome das colunas da tabela
                table.querySelectorAll('th').forEach(function(headerCell, idx) {
                    columnNames.push(headerCell.innerText);
                });

                // Itera em cada uma das linhas da tabela na tab corrente
                table.querySelectorAll('tr.ui-widget-content').forEach(function(row, idx) {
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

async function escolheAcompanhamentoMatriz(page) {
    const [label] = await page.$x("//a[contains(., 'Acompanhamento da Matriz')]");
    
    if (label) {
        await label.click();
    } else {
        console.error('Algum problema');
    }

    await page.waitForSelector("div.ui-tabs");
}

async function run(aluno, argv) {
    const page = await acessaPagina(aluno);

    await escolheAcompanhamentoMatriz(page);

    return {
        historico: await extraiHistoricoDaPagina(page),
    }
}

module.exports = {
    run
}