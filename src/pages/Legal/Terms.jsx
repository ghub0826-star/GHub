import React from 'react';
import LegalLayout from './LegalLayout';

export default function Terms() {
  return (
    <LegalLayout title='Syarat dan Ketentuan' lastUpdated='1 Agustus 2026'>
      <div className='legal-note'>
        <strong>Penting:</strong> Dengan menggunakan platform GHub, Anda dianggap telah membaca,
        memahami, dan menyetujui seluruh syarat dan ketentuan ini. Jika Anda tidak setuju,
        harap hentikan penggunaan platform.
      </div>

      <h2>1. Definisi</h2>
      <p>Dalam dokumen ini:</p>
      <ul>
        <li><strong>"GHub"</strong> merujuk pada platform marketplace digital yang dioperasikan melalui domain ini.</li>
        <li><strong>"Platform"</strong> merujuk pada website, aplikasi, API, dan layanan terkait yang disediakan oleh GHub.</li>
        <li><strong>"Pengguna"</strong> merujuk pada setiap pihak yang mengakses atau menggunakan Platform, termasuk Pembeli dan Seller.</li>
        <li><strong>"Pembeli" (BUYER)</strong> merujuk pada Pengguna yang memiliki akun dengan role BUYER atau USER dan dapat melakukan pembelian produk.</li>
        <li><strong>"Seller"</strong> merujuk pada Pengguna yang telah mendaftar dan disetujui sebagai penjual di Platform dengan role SELLER.</li>
        <li><strong>"Produk Digital"</strong> merujuk pada barang digital seperti mata uang game, item game, akun game, skin, dan barang virtual lainnya yang ditawarkan di Platform.</li>
        <li><strong>"Transaksi"</strong> merujuk pada proses pembelian produk dari Seller kepada Pembeli melalui Platform.</li>
        <li><strong>"Konten"</strong> merujuk pada teks, gambar, deskripsi, dan informasi lainnya yang diunggah atau disediakan oleh Pengguna di Platform.</li>
      </ul>

      <h2>2. Penerimaan Syarat</h2>
      <p>
        Dengan mendaftar akun, mengakses, atau menggunakan Platform GHub, Anda menyatakan bahwa:
      </p>
      <ul>
        <li>Anda berusia minimal 18 tahun, atau berusia di atas 13 tahun dengan izin dari orang tua atau wali yang sah.</li>
        <li>Anda memiliki kapasitas hukum untuk mengikatkan diri dalam perjanjian.</li>
        <li>Informasi yang Anda berikan saat pendaftaran adalah benar, akurat, dan terkini.</li>
        <li>Anda akan mematuhi seluruh ketentuan yang berlaku di dokumen ini dan kebijakan lainnya yang berlaku di Platform.</li>
      </ul>

      <h2>3. Pendaftaran Akun</h2>
      <p>Untuk menggunakan fitur tertentu di GHub, Anda perlu membuat akun. Saat pendaftaran:</p>
      <ul>
        <li>Anda wajib memberikan nama lengkap, username, email yang valid, dan password yang kuat (minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol).</li>
        <li>Setiap pengguna hanya boleh memiliki satu akun aktif. Pembuatan akun ganda untuk menghindari pembatasan atau sanksi dilarang.</li>
        <li>Anda bertanggung jawab penuh atas kerahasiaan kredensial akun Anda. GHub tidak bertanggung jawab atas kerugian akibat penggunaan akun Anda oleh pihak yang tidak berwenang.</li>
        <li>Akun dapat didaftarkan menggunakan email dan password, atau melalui autentikasi Google sesuai mekanisme yang tersedia di Platform.</li>
        <li>Akun baru terdaftar dengan role Pembeli (BUYER). Pendaftaran sebagai Seller memerlukan proses pengajuan dan verifikasi terpisah.</li>
      </ul>
      <div className='legal-warn'>
        <strong>Perhatian:</strong> Anda dilarang mendaftarkan akun dengan tujuan penipuan, pemalsuan identitas,
        atau aktivitas yang melanggar hukum. GHub berhak menangguhkan atau menghapus akun yang terbukti
        melanggar ketentuan ini.
      </div>

      <h2>4. Role Pengguna</h2>
      <p>Platform GHub mengenal beberapa role pengguna:</p>
      <ul>
        <li><strong>BUYER / USER:</strong> Dapat melakukan pencarian produk, menambahkan ke keranjang, melakukan checkout, membayar, dan memantau pesanan.</li>
        <li><strong>SELLER:</strong> Memiliki hak untuk membuat dan mengelola listing produk, memproses pesanan, dan mengakses dashboard seller serta saldo wallet. Seller harus telah melalui proses pendaftaran dan persetujuan dari GHub.</li>
        <li><strong>ADMIN / SUPER_ADMIN:</strong> Mengelola Platform, melakukan moderasi konten dan pengguna, serta memiliki akses administratif. Role ini tidak dapat didaftarkan secara mandiri melalui form registrasi publik.</li>
      </ul>

      <h2>5. Penggunaan Platform</h2>
      <p>Anda setuju untuk menggunakan Platform GHub hanya untuk tujuan yang sah dan sesuai dengan ketentuan ini. Anda dilarang:</p>
      <ul>
        <li>Melakukan tindakan yang melanggar hukum yang berlaku di Indonesia atau yurisdiksi Anda.</li>
        <li>Mengunggah atau menyebarkan konten yang mengandung malware, virus, atau kode berbahaya lainnya.</li>
        <li>Mengakses data atau sistem Platform secara tidak sah.</li>
        <li>Melakukan manipulasi harga, review palsu, atau aktivitas curang lainnya.</li>
        <li>Menggunakan bot, scraper, atau alat otomatis tanpa izin tertulis dari GHub.</li>
        <li>Menjual produk yang masuk dalam kategori Produk Terlarang sesuai kebijakan GHub.</li>
        <li>Berkomunikasi di luar Platform untuk menghindari biaya layanan (off-platform trading).</li>
      </ul>

      <h2>6. Produk dan Listing</h2>
      <p>Seller bertanggung jawab penuh atas akurasi, kelengkapan, dan keabsahan setiap listing produk yang dibuat. GHub berhak:</p>
      <ul>
        <li>Menolak atau menghapus listing yang melanggar kebijakan produk Platform.</li>
        <li>Melakukan moderasi terhadap produk sebelum atau setelah ditampilkan ke publik.</li>
        <li>Menangguhkan listing yang sedang dalam investigasi pelanggaran.</li>
      </ul>

      <h2>7. Transaksi dan Pembayaran</h2>
      <p>
        Setiap transaksi di GHub diproses melalui layanan pembayaran yang terintegrasi dengan Platform.
        GHub berperan sebagai fasilitator transaksi antara Pembeli dan Seller. Detail mengenai proses
        pembayaran diatur dalam <a href='/payment-policy'>Kebijakan Pembayaran</a>.
      </p>
      <ul>
        <li>Harga yang tercantum di Platform sudah termasuk biaya layanan platform yang berlaku.</li>
        <li>GHub tidak bertanggung jawab atas kerugian yang timbul dari kegagalan jaringan atau sistem pembayaran pihak ketiga.</li>
        <li>Pembayaran yang berhasil akan diverifikasi melalui mekanisme notifikasi webhook dari penyedia layanan pembayaran.</li>
      </ul>

      <h2>8. Pembatalan dan Refund</h2>
      <p>
        Kebijakan pembatalan dan pengembalian dana diatur secara terpisah dalam{' '}
        <a href='/refund-policy'>Kebijakan Refund dan Pembatalan</a>. Pengajuan refund dilakukan
        melalui mekanisme yang tersedia di Platform dan memerlukan verifikasi oleh tim GHub.
      </p>

      <h2>9. Sengketa</h2>
      <p>
        Apabila terjadi perselisihan antara Pembeli dan Seller, GHub menyediakan mekanisme pengajuan
        sengketa melalui Platform. Proses penyelesaian sengketa diatur dalam{' '}
        <a href='/dispute-resolution'>Kebijakan Penyelesaian Sengketa</a>.
      </p>

      <h2>10. Konten Pengguna</h2>
      <p>
        Dengan mengunggah konten ke Platform (termasuk gambar produk, deskripsi, dan pesan), Anda
        memberikan GHub lisensi non-eksklusif, bebas royalti, untuk menampilkan, menyimpan, dan
        memproses konten tersebut sebatas yang diperlukan untuk operasional Platform.
      </p>
      <ul>
        <li>Anda menjamin bahwa konten yang diunggah tidak melanggar hak kekayaan intelektual pihak ketiga.</li>
        <li>GHub berhak menghapus konten yang melanggar kebijakan tanpa pemberitahuan sebelumnya.</li>
      </ul>

      <h2>11. Penghentian dan Penangguhan Akun</h2>
      <p>GHub berhak menangguhkan atau menghapus akun Anda tanpa pemberitahuan sebelumnya jika:</p>
      <ul>
        <li>Terdapat pelanggaran terhadap Syarat dan Ketentuan ini.</li>
        <li>Terdapat indikasi aktivitas penipuan atau penyalahgunaan Platform.</li>
        <li>Diminta oleh otoritas hukum yang berwenang.</li>
        <li>Akun tidak aktif dalam jangka waktu yang ditentukan oleh kebijakan GHub.</li>
      </ul>
      <p>
        Anda dapat menghentikan penggunaan akun kapan saja dengan menghubungi tim dukungan GHub.
        Kewajiban yang timbul sebelum penghentian akun tetap berlaku.
      </p>

      <h2>12. Batasan Tanggung Jawab</h2>
      <p>
        Sejauh yang diizinkan oleh hukum yang berlaku, GHub tidak bertanggung jawab atas:
      </p>
      <ul>
        <li>Kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan Platform.</li>
        <li>Kualitas, keabsahan, atau kondisi produk yang dijual oleh Seller.</li>
        <li>Tindakan atau kelalaian Pengguna lain di Platform.</li>
        <li>Gangguan layanan yang disebabkan oleh faktor di luar kendali GHub (force majeure).</li>
      </ul>

      <h2>13. Perubahan Syarat dan Ketentuan</h2>
      <p>
        GHub berhak mengubah Syarat dan Ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan
        melalui Platform dengan memperbarui tanggal "Terakhir diperbarui" di bagian atas dokumen ini.
        Penggunaan Platform Anda setelah perubahan berlaku dianggap sebagai penerimaan atas ketentuan
        yang diperbarui.
      </p>

      <h2>14. Hukum yang Berlaku</h2>
      <p>
        Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum yang berlaku di
        Republik Indonesia. Setiap sengketa yang timbul akan diselesaikan melalui mekanisme yang
        diatur dalam kebijakan penyelesaian sengketa GHub.
      </p>

      <h2>15. Hubungi Kami</h2>
      <p>
        Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami melalui{' '}
        <a href='/help'>Pusat Bantuan</a> yang tersedia di Platform.
      </p>
    </LegalLayout>
  );
}
