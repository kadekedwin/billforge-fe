const fs = require('fs');
const path = require('path');
const finalData = require('./translation-data-final.js');

const LOCALES_DIR = './lib/i18n/locales';

const missingTranslations = {
    ...finalData
};

function setNestedValue(obj, keyPath, value) {
    const keys = keyPath.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }

    current[keys[keys.length - 1]] = value;
}

function main() {
    const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json') && f !== 'en.json');

    files.forEach(file => {
        const langCode = file.replace('.json', ''); // e.g., 'id'
        if (!missingTranslations[langCode]) {
            console.log(`No missing translations defined for ${langCode}`);
            return;
        }

        const filePath = path.join(LOCALES_DIR, file);
        let content = {};
        try {
            content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            console.error(`Error reading ${file}`, e);
            return;
        }

        const updates = missingTranslations[langCode];
        let updateCount = 0;

        for (const [key, value] of Object.entries(updates)) {
            setNestedValue(content, key, value);
            updateCount++;
        }

        fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
        console.log(`Updated ${file} with ${updateCount} keys.`);
    });
}

main();
