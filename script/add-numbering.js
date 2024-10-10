const fs = require('fs');
const path = require('path');

// Fungsi untuk menambahkan penomoran otomatis pada header
function addNumberingToHeaders(content, chapterNumber, counters) {
    const lines = content.split('\n');
    let output = [];
    let hasNumbering = false; // Menandai apakah sudah ada penomoran
    let inCodeBlock = false; // Menandai apakah sedang dalam blok kode

    lines.forEach(line => {
        // Cek apakah baris ini adalah awal atau akhir dari blok kode
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock; // Toggle inCodeBlock
        }

        // Jika sedang dalam blok kode, tambahkan baris tanpa perubahan
        if (inCodeBlock) {
            output.push(line);
            return;
        }

        // Proses penomoran header
        if (line.startsWith('# ')) {
            // Cek apakah sudah ada penomoran di H1
            if (!/^#\s*Bab\s+\d+\s+/.test(line)) {
                output.push(`# Bab ${chapterNumber} ${line.replace(/^#\s*/, '')}`);
                hasNumbering = true; // Tandai bahwa ada penomoran
            } else {
                output.push(line); // Jika sudah ada penomoran, tetap gunakan
            }
        } else if (line.startsWith('## ')) {
            // Cek apakah sudah ada penomoran di H2
            if (!/^##\s*\d+\.\d+\s+/.test(line)) {
                counters.h2 += 1; // Naikkan angka H2
                counters.h3 = 0; // Reset h3 count untuk H2 baru
                output.push(`## ${chapterNumber}.${counters.h2} ${line.replace(/^##\s*/, '')}`);
                hasNumbering = true; // Tandai bahwa ada penomoran
            } else {
                // Jika sudah ada penomoran, tetap gunakan dan perbarui counters
                const match = line.match(/^##\s*(\d+\.\d+)\s+(.*)/);
                if (match) {
                    const [_, h2Number] = match;
                    const parts = h2Number.split('.');
                    counters.h2 = parseInt(parts[1], 10); // Update h2Counter berdasarkan header
                    counters.h3 = 0; // Reset h3Counter
                }
                output.push(line); // Tetap gunakan baris yang ada
            }
        } else if (line.startsWith('### ')) {
            // Cek apakah sudah ada penomoran di H3
            if (!/^###\s*\d+\.\d+\.\d+\s+/.test(line)) {
                if (counters.h2 > 0) {
                    counters.h3 += 1; // Naikkan hitungan H3 untuk H2 saat ini
                    output.push(`### ${chapterNumber}.${counters.h2}.${counters.h3} ${line.replace(/^###\s*/, '')}`);
                    hasNumbering = true; // Tandai bahwa ada penomoran
                } else {
                    // Jika belum ada H2 yang terdaftar, tambahkan H3 tanpa penomoran
                    output.push(line);
                }
            } else {
                // Jika sudah ada penomoran, tetap gunakan dan perbarui counters
                const match = line.match(/^###\s*(\d+\.\d+\.\d+)\s+(.*)/);
                if (match) {
                    const [_, h3Number] = match;
                    const parts = h3Number.split('.');
                    counters.h3 = parseInt(parts[2], 10); // Update h3Counter berdasarkan header
                }
                output.push(line); // Tetap gunakan baris yang ada
            }
        } else {
            // Tambah baris lainnya tanpa perubahan
            output.push(line);
        }
    });

    // Kembalikan output jika ada penomoran baru yang ditambahkan
    return hasNumbering ? output.join('\n') : content; // Kembalikan konten asli jika tidak ada perubahan
}

// Path ke folder konten
const contentDir = path.join(__dirname, '../content');

// Fungsi untuk memproses setiap folder bab
fs.readdir(contentDir, (err, folders) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    // Hanya proses folder yang bernama 'bab1', 'bab2', dst.
    folders.forEach(folder => {
        const folderPath = path.join(contentDir, folder);

        // Pastikan ini adalah direktori
        fs.stat(folderPath, (err, stats) => {
            if (err) {
                console.error('Error reading folder:', err);
                return;
            }

            if (stats.isDirectory() && /^bab\d+$/i.test(folder)) {
                // Menentukan nomor bab berdasarkan folder
                const chapterNumber = folder.replace(/[^0-9]/g, '');

                // Inisialisasi penomoran untuk H2 dan H3
                let counters = { h2: 0, h3: 0 }; // Menghitung H2 dan H3 untuk bab ini

                // Jika folder adalah bab, baca file di dalamnya
                fs.readdir(folderPath, (err, files) => {
                    if (err) {
                        console.error('Error reading subdirectory:', err);
                        return;
                    }

                    // Mengurutkan file berdasarkan nomor di awal nama file
                    files.sort((a, b) => {
                        const aNum = parseInt(a.split('-')[0], 10);
                        const bNum = parseInt(b.split('-')[0], 10);
                        return aNum - bNum;
                    });

                    files.forEach(file => {
                        const filePath = path.join(folderPath, file);

                        // Hanya proses file dengan ekstensi .md
                        if (path.extname(file) === '.md') {
                            const content = fs.readFileSync(filePath, 'utf-8');
                            const numberedContent = addNumberingToHeaders(content, chapterNumber, counters);
                            if (numberedContent !== content) {
                                fs.writeFileSync(filePath, numberedContent, 'utf-8');
                                console.log(`Penomoran otomatis telah ditambahkan ke ${file}`);
                            } else {
                                console.log(`Tidak ada perubahan pada ${file}`);
                            }

                            // Tidak perlu meng-increment h2Counter di sini karena sudah diatur di dalam addNumberingToHeaders
                        }
                    });
                });
            }
        });
    });
});

