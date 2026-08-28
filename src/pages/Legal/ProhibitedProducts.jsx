import React from 'react';
import LegalLayout from './LegalLayout';

export default function ProhibitedProducts() {
  return (
    <LegalLayout title='Kebijakan Produk Terlarang' lastUpdated='1 Agustus 2026'>
      <div className='legal-warn'>
        <strong>Peringatan:</strong> Pelanggaran terhadap kebijakan ini dapat mengakibatkan
        penghapusan listing, penangguhan akun, dan/atau tindakan hukum sesuai peraturan yang berlaku.
      </div>

      <h2>1. Kategori Produk yang Dilarang</h2>
      <p>
        GHub adalah platform untuk jual beli produk digital terkait game. Berikut adalah kategori
        produk dan konten yang dilarang dijual, ditawarkan, atau dipromosikan di Platform:
      </p>

      <h3>1.1 Produk Ilegal</h3>
      <ul>
        <li>Produk, jasa, atau layanan yang melanggar hukum yang berlaku di Indonesia atau yurisdiksi yang relevan.</li>
        <li>Barang fisik atau non-digital yang tidak termasuk dalam kategori produk digital game.</li>
        <li>Produk yang melanggar hak kekayaan intelektual, hak cipta, atau merek dagang pihak lain.</li>
      </ul>

      <h3>1.2 Produk Penipuan dan Manipulasi</h3>
      <ul>
        <li>Akun game atau item yang diperoleh melalui cara yang melanggar Ketentuan Layanan game terkait.</li>
        <li>Produk yang bersumber dari aktivitas hacking, phishing, atau pencurian akun.</li>
        <li>Bot, cheat engine, atau perangkat lunak yang digunakan untuk kecurangan dalam game.</li>
        <li>Layanan yang bertujuan merusak pengalaman bermain pengguna lain.</li>
        <li>Produk yang mengklaim manfaat atau fitur yang tidak dapat dibuktikan.</li>
      </ul>

      <h3>1.3 Konten Berbahaya atau Tidak Pantas</h3>
      <ul>
        <li>Konten yang mengandung materi eksplisit, pornografi, atau kekerasan ekstrem.</li>
        <li>Konten yang menargetkan, mendiskriminasi, atau menghasut kebencian terhadap kelompok tertentu.</li>
        <li>Konten yang menampilkan atau merendahkan individu tanpa persetujuan mereka.</li>
        <li>Konten yang melibatkan eksploitasi anak-anak dalam bentuk apapun.</li>
      </ul>

      <h3>1.4 Informasi Pribadi (Data Pribadi Orang Lain)</h3>
      <ul>
        <li>Penjualan data pribadi pengguna lain tanpa izin.</li>
        <li>Database akun, daftar email, atau informasi kredensial yang diperoleh secara tidak sah.</li>
      </ul>

      <h3>1.5 Layanan Keuangan Tertentu</h3>
      <ul>
        <li>Jasa pertukaran mata uang kripto atau aset kripto.</li>
        <li>Jasa pinjaman uang atau layanan keuangan yang memerlukan izin regulasi.</li>
        <li>Voucher atau gift card yang diperoleh secara tidak sah atau dengan cara curang.</li>
      </ul>

      <h3>1.6 Produk yang Berkaitan dengan Senjata dan Bahan Berbahaya</h3>
      <ul>
        <li>Panduan atau instruksi pembuatan senjata, bahan peledak, atau zat berbahaya.</li>
        <li>Produk atau jasa yang memfasilitasi akses ilegal terhadap senjata atau bahan berbahaya.</li>
      </ul>

      <h2>2. Tanggung Jawab Seller</h2>
      <p>
        Seller bertanggung jawab penuh untuk memastikan bahwa setiap produk yang mereka tawarkan
        tidak melanggar kebijakan ini. GHub tidak bertanggung jawab atas konten listing yang
        dibuat oleh Seller.
      </p>
      <p>
        Seller wajib memeriksa dan mematuhi Ketentuan Layanan dari game atau platform pihak ketiga
        yang produknya diperjualbelikan di GHub.
      </p>

      <h2>3. Proses Moderasi</h2>
      <p>
        Setiap produk yang didaftarkan di Platform akan melewati proses moderasi dengan status:
      </p>
      <ul>
        <li><strong>PENDING</strong> — produk menunggu review dari tim moderasi.</li>
        <li><strong>APPROVED / active</strong> — produk telah disetujui dan dapat dilihat oleh publik.</li>
        <li><strong>REJECTED / inactive</strong> — produk ditolak karena melanggar kebijakan.</li>
      </ul>
      <p>
        Tim GHub dapat menangguhkan atau menghapus listing kapan saja tanpa pemberitahuan sebelumnya
        jika ditemukan pelanggaran terhadap kebijakan ini.
      </p>

      <h2>4. Pelaporan Pelanggaran</h2>
      <p>
        Pengguna yang menemukan listing yang melanggar kebijakan ini dapat melaporkannya melalui
        Platform. GHub akan meninjau setiap laporan yang masuk dan mengambil tindakan sesuai
        kebijakan yang berlaku.
      </p>

      <h2>5. Konsekuensi Pelanggaran</h2>
      <p>Pelanggaran terhadap kebijakan ini dapat mengakibatkan:</p>
      <ul>
        <li>Penghapusan listing yang melanggar tanpa pengembalian biaya yang telah dibayarkan.</li>
        <li>Peringatan kepada Seller terkait.</li>
        <li>Penangguhan sementara atau permanen akun Seller.</li>
        <li>Pemblokiran penarikan saldo yang tertunda selama investigasi.</li>
        <li>Pelaporan kepada otoritas berwenang jika ditemukan unsur pidana.</li>
      </ul>

      <h2>6. Perubahan Kebijakan</h2>
      <p>
        Daftar produk terlarang dapat diperbarui sewaktu-waktu seiring perkembangan platform dan
        regulasi yang berlaku. Seller bertanggung jawab untuk memantau pembaruan kebijakan ini
        secara berkala.
      </p>

      <h2>7. Hubungi Kami</h2>
      <p>
        Untuk pertanyaan tentang apakah produk tertentu diizinkan di Platform, silakan hubungi tim
        GHub melalui <a href='/help'>Pusat Bantuan</a> sebelum membuat listing.
      </p>
    </LegalLayout>
  );
}
