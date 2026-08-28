import React from 'react';
import LegalLayout from './LegalLayout';

export default function PaymentPolicy() {
  return (
    <LegalLayout title='Kebijakan Pembayaran' lastUpdated='1 Agustus 2026'>
      <div className='legal-note'>
        <strong>Transparansi:</strong> Kebijakan ini didasarkan pada implementasi aktual sistem
        pembayaran yang berjalan di Platform GHub.
      </div>

      <h2>1. Penyedia Layanan Pembayaran</h2>
      <p>
        GHub mengintegrasikan layanan pembayaran eksternal untuk memproses transaksi di Platform.
        Pembayaran diproses melalui penyedia layanan pembayaran yang terintegrasi, yang menyediakan
        antarmuka pembayaran (<em>payment gateway</em>) untuk berbagai metode pembayaran.
      </p>
      <p>
        Dengan menggunakan layanan pembayaran di GHub, Anda juga tunduk pada syarat dan ketentuan
        penyedia layanan pembayaran yang digunakan.
      </p>

      <h2>2. Metode Pembayaran</h2>
      <p>
        Metode pembayaran yang tersedia ditentukan oleh penyedia layanan pembayaran yang
        diintegrasikan dengan Platform, dan dapat berubah sewaktu-waktu. Metode yang umumnya
        tersedia meliputi, namun tidak terbatas pada:
      </p>
      <ul>
        <li>Transfer bank (berbagai bank yang didukung penyedia pembayaran)</li>
        <li>QRIS (Quick Response Code Indonesian Standard)</li>
        <li>Dompet digital (e-wallet)</li>
        <li>Kartu kredit/debit</li>
        <li>Pembayaran manual (sesuai konfigurasi yang aktif)</li>
      </ul>
      <p>
        Ketersediaan setiap metode pembayaran tergantung pada konfigurasi aktif Platform dan
        kemampuan penyedia layanan pembayaran saat transaksi dilakukan.
      </p>

      <h2>3. Proses Pembayaran</h2>
      <p>Alur pembayaran di GHub adalah sebagai berikut:</p>
      <ol>
        <li>Pembeli melakukan checkout dan pesanan dibuat di sistem GHub.</li>
        <li>Pembeli memilih metode pembayaran dan diarahkan ke antarmuka pembayaran.</li>
        <li>Pembayaran diproses oleh penyedia layanan pembayaran.</li>
        <li>Penyedia pembayaran mengirimkan notifikasi konfirmasi ke server GHub melalui webhook yang terenkripsi dan terverifikasi.</li>
        <li>GHub memverifikasi tanda tangan digital dan jumlah pembayaran sebelum mengkonfirmasi status pesanan.</li>
        <li>Status pesanan dan pembayaran diperbarui secara atomik di database GHub.</li>
        <li>Pembeli dan Seller menerima notifikasi setelah pembayaran berhasil dikonfirmasi.</li>
      </ol>

      <h2>4. Verifikasi Keamanan Pembayaran</h2>
      <p>GHub menerapkan mekanisme keamanan berikut dalam proses pembayaran:</p>
      <ul>
        <li><strong>Verifikasi tanda tangan</strong> — setiap notifikasi webhook diverifikasi keasliannya menggunakan mekanisme kriptografi yang disediakan oleh penyedia pembayaran.</li>
        <li><strong>Verifikasi jumlah</strong> — jumlah yang dikonfirmasi oleh penyedia pembayaran harus cocok dengan jumlah yang tersimpan di database GHub. Ketidakcocokan menyebabkan pembayaran tidak dikonfirmasi.</li>
        <li><strong>Idempotency</strong> — setiap notifikasi hanya diproses sekali untuk mencegah pemrosesan ganda.</li>
        <li><strong>Data otoritatif</strong> — GHub tidak pernah mempercayai harga atau jumlah yang dikirimkan dari frontend. Semua jumlah transaksi diambil dari data yang tersimpan di database server.</li>
        <li><strong>Rate limiting</strong> — pembatasan frekuensi permintaan pembayaran untuk mencegah penyalahgunaan.</li>
      </ul>

      <h2>5. Masa Berlaku Pembayaran</h2>
      <p>
        Setiap sesi pembayaran memiliki batas waktu. Jika pembayaran tidak diselesaikan dalam
        waktu yang ditentukan (umumnya 1 jam), sesi pembayaran akan kedaluwarsa. Pembeli dapat
        melakukan percobaan pembayaran ulang (<em>retry payment</em>) melalui Platform.
      </p>

      <h2>6. Kegagalan Pembayaran</h2>
      <p>Jika pembayaran gagal, GHub akan:</p>
      <ul>
        <li>Mempertahankan pesanan dalam status menunggu pembayaran untuk jangka waktu tertentu.</li>
        <li>Mengizinkan Pembeli untuk mencoba ulang pembayaran melalui fitur <em>retry payment</em>.</li>
        <li>Memberikan notifikasi kepada Pembeli terkait status pembayaran.</li>
      </ul>
      <p>
        GHub tidak bertanggung jawab atas kegagalan pembayaran yang disebabkan oleh gangguan
        pada sistem penyedia layanan pembayaran, jaringan internet, atau faktor eksternal lainnya.
      </p>

      <h2>7. Mata Uang</h2>
      <p>
        Semua transaksi di Platform GHub dilakukan dalam mata uang <strong>Rupiah Indonesia (IDR)</strong>
        kecuali dinyatakan lain. Harga yang ditampilkan di Platform sudah dalam IDR.
      </p>

      <h2>8. Keamanan Data Pembayaran</h2>
      <p>
        GHub tidak menyimpan data kartu kredit, nomor rekening bank, atau informasi pembayaran
        sensitif lainnya di server GHub. Semua data pembayaran sensitif ditangani langsung oleh
        penyedia layanan pembayaran yang memiliki standar keamanan tersendiri.
      </p>

      <h2>9. Tagihan dan Invoice</h2>
      <p>
        Setelah transaksi berhasil, Pembeli dapat mengunduh invoice dari halaman detail pesanan.
        Invoice mencantumkan nomor pesanan, detail produk, jumlah pembayaran, dan status transaksi.
      </p>

      <h2>10. Pembayaran kepada Seller (Disbursement)</h2>
      <p>
        Dana dari pembayaran Pembeli yang berhasil diverifikasi akan diproses ke saldo Seller
        sesuai mekanisme berikut:
      </p>
      <ul>
        <li>Dana awalnya masuk ke status <strong>tertahan (held)</strong> di wallet Seller.</li>
        <li>Setelah kondisi pelepasan terpenuhi (pesanan selesai/dikonfirmasi), dana dipindahkan ke status <strong>tersedia (available)</strong> setelah dikurangi biaya platform.</li>
        <li>Seller dapat mengajukan penarikan saldo yang berstatus tersedia.</li>
      </ul>

      <h2>11. Perubahan Kebijakan</h2>
      <p>
        GHub berhak mengubah kebijakan pembayaran sewaktu-waktu, termasuk perubahan biaya layanan
        atau metode pembayaran yang didukung. Perubahan akan diberitahukan melalui Platform.
      </p>

      <h2>12. Hubungi Kami</h2>
      <p>
        Untuk pertanyaan terkait pembayaran, silakan hubungi tim GHub melalui{' '}
        <a href='/help'>Pusat Bantuan</a>.
      </p>
    </LegalLayout>
  );
}
