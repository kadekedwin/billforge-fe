/* eslint-disable */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = './lib/i18n/locales';
const EN_PATH = path.join(LOCALES_DIR, 'en.json');

function flatten(obj, prefix = '', res = {}) {
    for (const key in obj) {
        if (typeof obj[key] === 'object' && ob[key] !== null) {
            flatten(obj[key], `${prefix}${key}.`, res);
        } else {
            res[`${prefix}${key}`] = obj[key];
        }
    }
    return res;
}

function flattenFixed(obj, prefix = '', res = {}) {
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            flattenFixed(obj[key], `${prefix}${key}.`, res);
        } else {
            res[`${prefix}${key}`] = obj[key];
        }
    }
    return res;
}

function main() {
    if (!fs.existsSync(EN_PATH)) {
        console.error('en.json not found');
        return;
    }

    const enContent = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'));
    const enFlat = flattenFixed(enContent);
    const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json') && f !== 'en.json');

    const report = {};

    files.forEach(file => {
        const filePath = path.join(LOCALES_DIR, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const flat = flattenFixed(content);

        report[file] = {
            missing: [],
            identical: []
        };

        for (const key in enFlat) {
            if (!flat.hasOwnProperty(key)) {
                report[file].missing.push(key);
            } else if (flat[key] === enFlat[key] && typeof enFlat[key] === 'string' && enFlat[key].length > 4) {
                report[file].identical.push(key);
            }
        }
    });

    console.log(JSON.stringify(report, null, 2));
}

main();
