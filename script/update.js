const { exec } = require('child_process');

exec('node add-numbering.js', (err, stdout, stderr) => {
    if (err) {
        console.error(`Error menjalankan add-numbering.js: ${err.message}`);
        return;
    }
    console.log(stdout);
    if (stderr) {
        console.error(`stderr: ${stderr}`);
    }

    exec('node generate_summary.js', (err, stdout, stderr) => {
        if (err) {
            console.error(`Error menjalankan generate_summary.js: ${err.message}`);
            return;
        }
        console.log(stdout);
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
    });
});

