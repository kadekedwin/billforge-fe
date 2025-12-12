const fs = require('fs');
const path = require('path');

// Configurations
const SEARCH_DIR = './'; // Root directory
const LOCALE_FILE = './lib/i18n/locales/en.json';
const IGNORE_DIRS = ['node_modules', '.next', '.git', '.gemini', 'scripts'];

// Regex to find t('key') or t("key")
// Captures the key inside quotes
const TRANSLATION_REGEX = /\bt\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (IGNORE_DIRS.includes(file)) return;

        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

function getNestedValue(obj, keyPath) {
    return keyPath.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : undefined;
    }, obj);
}

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

function extractKeys() {
    console.log('Scanning files...');
    const files = getAllFiles(SEARCH_DIR);
    const foundKeys = new Set();

    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        let match;
        while ((match = TRANSLATION_REGEX.exec(content)) !== null) {
            foundKeys.add(match[1]);
        }
    });

    console.log(`Found ${foundKeys.size} unique translation usage in code.`);
    return Array.from(foundKeys);
}

function main() {
    try {
        const codeKeys = extractKeys();

        // Read existing JSON
        const rawData = fs.readFileSync(LOCALE_FILE, 'utf8');
        const enJson = JSON.parse(rawData);

        let addedCount = 0;
        const addedKeys = [];

        codeKeys.forEach(key => {
            if (key.includes('${')) {
                console.log(`Skipping dynamic key: ${key}`);
                return;
            }

            const exists = getNestedValue(enJson, key);

            if (exists === undefined) {
                // Key is missing, add it
                // We'll use the last part of the key as the default value, or just the key itself
                // To be more helpful, let's use a placeholder that indicates it needs translation
                // But for now, let's just put the key leaf name in Title Case or similar if possible?
                // Or just "MISSING TRANSLATION"
                // User said: "get the name"

                const parts = key.split('.');
                const lastPart = parts[parts.length - 1];
                // Simple transformation: camelCase to Sentence case
                const humanized = lastPart
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase());

                setNestedValue(enJson, key, humanized);
                addedKeys.push(key);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            console.log(`Adding ${addedCount} missing keys to en.json:`);
            addedKeys.forEach(k => console.log(`  + ${k}`));

            // Sort keys function (optional, but good for JSON)
            // For now, simple write back
            fs.writeFileSync(LOCALE_FILE, JSON.stringify(enJson, null, 4));
            console.log('Updated en.json successfully.');
        } else {
            console.log('No missing keys found.');
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
