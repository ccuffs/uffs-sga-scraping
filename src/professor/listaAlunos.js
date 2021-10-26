async function acessaPagina(sga) {
    const page = await sga.newTab();
    
    await page.goto('https://professor.uffs.edu.br/restrito/graduacao/coordenador/historico-escolar.xhtml');    
    await page.waitForSelector("a.ui-commandlink > img");
    
    return page;
}

async function escolheBuscaPorNome(page, nome) {
    const [label] = await page.$x("//label[contains(., 'Nome')]");
    
    if (label) {
        await label.click();
    } else {
        console.error('Algum problema');
    }

    await page.waitForSelector("input[alt='Nome']");
    await page.$eval("input[alt='Nome']", (el, value) => el.value = value, nome);
    await page.waitForSelector("a.ui-commandlink > img");

    const [botaoBuscar] = await page.$x("//a[img[contains(@title, 'Buscar')]]");
    
    if (botaoBuscar) {
        await botaoBuscar.click()
    }

    await page.waitForSelector("a.ui-commandlink > img[title='Selecionar Acadêmico']");
}

async function coletaNomesInformados(page) {
    const rows = await page.evaluate(() => {
        var rows = [];

        document.querySelectorAll('table[role="grid"] tr[role="row"]').forEach(function(el) {
            var aluno = {nome: '', matricula: '', situacao: ''};
            var matricula = el.getElementsByTagName('td')[0];
            var nome = el.getElementsByTagName('td')[1];
            var situacao = el.getElementsByTagName('td')[2];

            if (matricula) aluno.matricula = matricula.childNodes[0].innerHTML;
            if (nome) aluno.nome = nome.childNodes[0].innerHTML;
            if (situacao) aluno.situacao = situacao.childNodes[0].innerHTML;

            if(!aluno.matricula) {
                return;
            }

            rows.push(aluno);
        });

        return rows;
    });

    return rows;
}

async function run(sga) {
    const page = await acessaPagina(sga);
    
    await escolheBuscaPorNome(page, '%%%');
    const alunos = await coletaNomesInformados(page);
    
    return alunos;
}

module.exports = {
    run
}