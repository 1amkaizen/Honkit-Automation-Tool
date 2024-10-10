const { execSync } = require('child_process');

// Fungsi untuk menjalankan perintah shell
function runCommand(command) {
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Error executing command: ${command}`, error);
        process.exit(1);
    }
}

// Menjalankan skrip untuk menambahkan penomoran
runCommand('node script/add-numbering.js');

// Menjalankan skrip untuk membuat ringkasan
runCommand('node script/generate_summary.js');

// Mencetak pesan setelah build selesai
console.log('Build completed successfully!');

