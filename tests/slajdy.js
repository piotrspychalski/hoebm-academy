// Sekwencje slajdów szkicu (data/slides/*.json): pola, zakresy, tematy i narządy ze szkicu, bez dawek i nazw handlowych.
const path = require('path'), { compile } = require('../tools/sketch-slides.js');
const { errors } = compile(path.join(__dirname, '..'));
console.log('errors', JSON.stringify(errors));
process.exit(errors.length ? 1 : 0);
