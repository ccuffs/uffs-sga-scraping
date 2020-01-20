const dev = {
    auth: {
        user: '',
        password: ''
    },
    headless: false,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
};

const prod = {
    auth: {
        user: '',
        password: ''
    },
    headless: true,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
};

module.exports = {
    dev,
    prod,
}