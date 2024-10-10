const fs = require('fs');
const path = require('path');

// Fungsi untuk membaca header dari file markdown dan memisahkan nomor dan judul
function getHeaders(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const headers = {
        h1: null,
        h2: [],
        h3: []
    };

    lines.forEach(line => {
        if (line.startsWith('### ')) {
            const match = line.match(/^###\s*(\d+\.\d+\.\d+)\s+(.*)/);
            if (match) {
                headers.h3.push({ number: match[1], title: match[2].trim() });
            } else {
                headers.h3.push({ number: null, title: line.replace(/^###\s*/, '').trim() });
            }
        } else if (line.startsWith('## ')) {
            const match = line.match(/^##\s*(\d+\.\d+)\s+(.*)/);
            if (match) {
                headers.h2.push({ number: match[1], title: match[2].trim() });
            } else {
                headers.h2.push({ number: null, title: line.replace(/^##\s*/, '').trim() });
            }
        } else if (line.startsWith('# ')) {
            const match = line.match(/^#\s*Bab\s+(\d+)\s+(.*)/);
            if (match) {
                headers.h1 = { number: match[1], title: match[2].trim() };
            } else {
                headers.h1 = { number: null, title: line.replace(/^#\s*/, '').trim() };
            }
        }
    });

    return headers;
}

// Fungsi untuk mengurutkan file berdasarkan nomor di awal nama file
function sortFiles(files) {
    return files.sort((a, b) => {
        const aNum = parseInt(a.split('-')[0], 10);
        const bNum = parseInt(b.split('-')[0], 10);
        return aNum - bNum;
    });
}

// Fungsi untuk membuat slug dari judul (untuk fragment identifier)
function createSlug(title) {
    return title.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
}

// Path ke direktori content
const contentDir = path.join(__dirname, '../content');

// File-file top-level yang akan ditambahkan ke Daftar Isi
const topLevelFiles = ['copyright.md','kata-pengantar.md', 'pendahuluan.md'];

// Array untuk menyimpan baris-baris Daftar Isi
let summaryLines = ["# Daftar Isi\n"];

// Memproses file-file top-level
topLevelFiles.forEach(file => {
    const filePath = path.join(contentDir, file);
    if (fs.existsSync(filePath)) {
        const headers = getHeaders(filePath);
        const label = headers.h1 ? headers.h1.title : capitalizeFirstLetter(path.basename(file, '.md')); // Gunakan judul H1 jika ada
        summaryLines.push(`* [${label}](${file})`); // Hanya tampilkan label
    }
});

// Mendapatkan semua folder bab (seperti bab1, bab2, ...)
const babFolders = fs.readdirSync(contentDir).filter(item => {
    const itemPath = path.join(contentDir, item);
    return fs.statSync(itemPath).isDirectory() && /^bab\d+$/i.test(item);
});

// Mengurutkan folder bab berdasarkan nomor
const sortedBabFolders = babFolders.sort((a, b) => {
    const aNum = parseInt(a.match(/\d+/)[0], 10);
    const bNum = parseInt(b.match(/\d+/)[0], 10);
    return aNum - bNum;
});

// Memproses setiap folder bab
sortedBabFolders.forEach(bab => {
    const babPath = path.join(contentDir, bab);
    const babReadme = path.join(babPath, 'README.md');
    if (fs.existsSync(babReadme)) {
        const headers = getHeaders(babReadme);
        const babNumber = headers.h1 && headers.h1.number ? headers.h1.number : getBabNumber(bab);
        const babTitle = headers.h1 && headers.h1.title ? headers.h1.title : path.basename(babReadme, '.md');
        summaryLines.push(`* [Bab ${babNumber}: ${babTitle}](./${bab}/README.md)`);

        // Mendapatkan file subbab di dalam folder bab
        let subFiles = fs.readdirSync(babPath).filter(file => {
            const filePath = path.join(babPath, file);
            return fs.statSync(filePath).isFile() && file.endsWith('.md') && file.toLowerCase() !== 'readme.md';
        });

        // Mengurutkan file subbab
        subFiles = sortFiles(subFiles);

        // Memproses setiap file subbab
        subFiles.forEach(subFile => {
            const subFilePath = path.join(babPath, subFile);
            const subHeaders = getHeaders(subFilePath);
            let h2Number = '';
            let h2Title = '';

            if (subHeaders.h2.length > 0 && subHeaders.h2[0].number) {
                h2Number = subHeaders.h2[0].number;
                h2Title = subHeaders.h2[0].title;
            } else {
                // Jika tidak ada penomoran, ambil nomor dari nama file
                const subNum = subFile.split('-')[0].replace(/^0+/, '');
                h2Number = `${babNumber}.${subNum}`;
                h2Title = subHeaders.h2.length > 0 ? subHeaders.h2[0].title : path.basename(subFile, '.md');
            }

            // Nomor subbab
            const subBabNumber = h2Number;

            // Jika ada H3, tambahkan tingkat sub-sub bab
            if (subHeaders.h3.length > 0) {
                summaryLines.push(`  * [${subBabNumber}: ${h2Title}](${bab}/${subFile})`);
                subHeaders.h3.forEach(subH3 => {
                    const subSubNumber = subH3.number ? subH3.number : `${subBabNumber}.${subHeaders.h3.indexOf(subH3) + 1}`;
                    const slug = subH3.title ? createSlug(subH3.title) : '';
                    summaryLines.push(`    * [${subSubNumber}: ${subH3.title}](${bab}/${subFile}#${slug})`);
                });
            } else {
                summaryLines.push(`  * [${subBabNumber}: ${h2Title}](${bab}/${subFile})`);
            }
        });
    }
});

// Menggabungkan semua baris menjadi string
const summaryContent = summaryLines.join('\n');

// Path ke SUMMARY.md
const summaryPath = path.join(contentDir, 'SUMMARY.md');

// Menulis ke SUMMARY.md
fs.writeFileSync(summaryPath, summaryContent, 'utf-8');

console.log(`SUMMARY.md telah berhasil dibuat di ${summaryPath}`);

// Fungsi untuk mengkapitalisasi huruf pertama
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Fungsi untuk mendapatkan nomor bab dari nama folder bab
function getBabNumber(babName) {
    const match = babName.match(/\d+/);
    return match ? match[0] : '';
}

