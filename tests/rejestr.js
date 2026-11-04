// Rejestr rycin: schemat, PMID/DOI, cytaty w claims, brak to_verify w rycinach opublikowanych
const path = require('path'), { load, validate } = require('../tools/registry.js');
const reg = load(path.join(__dirname, '..')), errors = validate(reg);
console.log(`rejestr: ${reg.figures.length} rycin, ${Object.keys(reg.sources).length} źródeł`);
console.log('errors', JSON.stringify(errors));
process.exit(errors.length ? 1 : 0);
