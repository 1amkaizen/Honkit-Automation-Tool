Honkit Automation Tool

Deskripsi: Honkit Automation Tool adalah alat yang dirancang untuk mengotomatiskan proses penomoran, pembuatan ringkasan, dan penyajian konten ebook menggunakan Honkit. Alat ini menyederhanakan alur kerja penulis dengan mengurangi waktu dan usaha yang dibutuhkan untuk mengelola konten ebook Anda.

Fitur Utama:

Penomoran Otomatis: Menambahkan nomor bab dan subbab secara otomatis ke dalam file markdown.
Pembuatan Ringkasan: Menghasilkan file SUMMARY.md berdasarkan struktur folder dan file yang ada.
Server Honkit: Menjalankan server Honkit secara otomatis untuk melihat ebook yang sedang Anda kerjakan.
Struktur Proyek: Proyek ini memiliki struktur sebagai berikut:

my-ebook/
package.json
script/
add-numbering.js
generate_summary.js
build.js
content/
book.json
README.md
img/
cover_depan.png
styles/
custom.css
copyright.md
pendahuluan.md
bab1/
README.md
01-subbab1.md
02-subbab2.md
bab2/
README.md
01-subbab1.md
02-subbab2.md
Instalasi:

Clone Repository:

git clone <URL_REPO> my-ebook
cd my-ebook
Instalasi Dependensi:

Pastikan Anda sudah menginstal Node.js, lalu jalankan:
npm install
Cara Penggunaan:

Jalankan Alat:

Untuk menjalankan alat ini, gunakan perintah berikut dari direktori root proyek:
npm start
Perintah ini akan menjalankan tiga langkah:
Menjalankan skrip untuk menambahkan penomoran pada file markdown.
Menghasilkan file SUMMARY.md.
Menjalankan server Honkit untuk menampilkan ebook.
Akses Ebook:

Setelah menjalankan server, buka browser dan akses:
http://localhost:4000
Di sini Anda dapat melihat ebook yang sedang Anda kerjakan.
Catatan:

Pastikan semua file markdown mengikuti struktur penamaan yang benar agar alat dapat mengenali dan memprosesnya dengan baik.
Anda dapat menyesuaikan skrip di folder script/ sesuai kebutuhan untuk mengubah cara penomoran atau format ringkasan.
Kontribusi: Kontribusi sangat diterima! Jika Anda memiliki ide untuk fitur baru atau perbaikan, silakan buat issue atau pull request di repository ini.

Lisensi: Proyek ini dilisensikan di bawah MIT License. Silakan lihat file LICENSE untuk detail lebih lanjut.
