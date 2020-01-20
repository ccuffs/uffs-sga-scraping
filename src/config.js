const dev = {
    headless: false,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
};

const prod = {
    headless: true,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
};

module.exports = {
    dev,
    prod,
}