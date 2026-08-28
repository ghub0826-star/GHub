import React from 'react';
import LegalLayout from './LegalLayout';

export default function BuyerProtection() {
  return (
    <LegalLayout title='Kebijakan Perlindungan Pembeli' lastUpdated='1 Agustus 2026'>
      <div className='legal-note'>
        <strong>Untuk Pembeli:</strong> Dokumen ini menjelaskan mekanisme perlindungan yang tersedia
        bagi Pembeli di Platform GHub berdasarkan fitur yang aktif dan terverifikasi di sistem.
      </div>

      <h2>1. Prinsip Perlindungan Pembeli</h2>
      <p>
        GHub berkomitmen untuk menyediakan lingkungan transaksi yang aman bagi Pembeli dengan
        menerapkan mekanisme berikut yang didasarkan pada implementasi aktual Platform:
      </p>
      <ul>
        <li>Verifikasi Seller sebelum diizinkan berjualan di Platform.</li>
        <li>Sistem pembayaran yang diverifikasi melalui mekanisme webhook yang aman.</li>
        <li>Fitur pengajuan refund dan sengketa yang tersedia melalui Platform.</li>
        <li>Komunikasi antara Pembeli dan Seller terdokumentasi melalui fitur chat pesanan.</li>
        <li>Moderasi produk untuk mencegah listing yang tidak sesuai.</li>
      </ul>

      <h2>2. Verifikasi Pembayaran</h2>
      <p>
        Setiap pembayaran di GHub diverifikasi melalui mekanisme notifikasi dari penyedia layanan
        pembayaran. GHub menerapkan:
      </p>
      <ul>
        <li>Verifikasi tanda tangan digital (signature verification) pada setiap notifikasi pembayaran untuk mencegah manipulasi.</li>
        <li>Verifikasi jumlah pembayaran yang harus cocok dengan total pesanan yang tersimpan di database GHub — bukan dari data yang dikirimkan oleh frontend.</li>
        <li>Pemrosesan idempoten untuk mencegah pemrosesan ganda pada notifikasi yang sama.</li>
        <li>Pembayaran hanya dianggap berhasil setelah konfirmasi resmi dari penyedia layanan pembayaran diterima dan diverifikasi.</li>
      </ul>

      <h2>3. Mekanisme Pengajuan Masalah</h2>
      <h3>3.1 Pengajuan Refund</h3>
      <p>
        Pembeli dapat mengajukan permohonan refund melalui Platform jika:
      </p>
      <ul>
        <li>Produk tidak diterima sesuai waktu yang dijanjikan.</li>
        <li>Produk yang diterima tidak sesuai deskripsi.</li>
        <li>Terdapat indikasi transaksi tidak sah pada akun Anda.</li>
      </ul>
      <p>
        Pengajuan refund dilakukan dengan menyertakan nomor pesanan, jumlah, dan alasan yang jelas.
        Detail proses diatur dalam <a href='/refund-policy'>Kebijakan Refund dan Pembatalan</a>.
      </p>

      <h3>3.2 Pengajuan Sengketa</h3>
      <p>
        Jika terdapat perselisihan dengan Seller yang tidak dapat diselesaikan melalui komunikasi
        langsung, Pembeli dapat mengajukan sengketa melalui Platform dengan menyertakan:
      </p>
      <ul>
        <li>Nomor pesanan yang disengketakan.</li>
        <li>Alasan sengketa.</li>
        <li>Detail pendukung yang relevan.</li>
      </ul>
      <p>
        Proses penyelesaian sengketa diatur dalam{' '}
        <a href='/dispute-resolution'>Kebijakan Penyelesaian Sengketa</a>.
      </p>

      <h2>4. Komunikasi Terdokumentasi</h2>
      <p>
        Seluruh komunikasi antara Pembeli dan Seller yang dilakukan melalui fitur chat pesanan di
        Platform tercatat di sistem GHub. Pembeli disarankan untuk:
      </p>
      <ul>
        <li>Selalu berkomunikasi melalui fitur chat resmi yang tersedia di halaman detail pesanan.</li>
        <li>Tidak melakukan transaksi atau negosiasi di luar Platform.</li>
        <li>Menyimpan bukti komunikasi yang relevan jika diperlukan untuk pengajuan sengketa.</li>
      </ul>

      <h2>5. Moderasi Produk dan Seller</h2>
      <p>GHub menerapkan moderasi untuk menjaga kualitas Platform:</p>
      <ul>
        <li>Setiap produk baru memiliki status moderasi (<em>PENDING</em>) sebelum ditampilkan kepada publik.</li>
        <li>Admin dapat menangguhkan listing produk yang melanggar kebijakan.</li>
        <li>Seller harus melalui proses verifikasi sebelum dapat berjualan.</li>
        <li>GHub memiliki sistem deteksi penipuan (<em>fraud detection</em>) yang aktif di backend.</li>
      </ul>

      <h2>6. Keamanan Akun Pembeli</h2>
      <p>GHub menyediakan fitur-fitur keamanan akun berikut untuk Pembeli:</p>
      <ul>
        <li><strong>Verifikasi email</strong> — untuk memastikan kepemilikan alamat email.</li>
        <li><strong>Two-Factor Authentication (2FA)</strong> — autentikasi dua faktor berbasis TOTP yang dapat diaktifkan melalui pengaturan keamanan.</li>
        <li><strong>Manajemen sesi</strong> — Anda dapat melihat dan mencabut sesi aktif dari perangkat lain melalui pengaturan keamanan.</li>
        <li><strong>Riwayat aktivitas login</strong> — tersedia di pengaturan keamanan untuk memantau akses akun.</li>
        <li><strong>Penguncian akun otomatis</strong> — akun dikunci sementara setelah beberapa kali percobaan login yang gagal.</li>
        <li><strong>Reset password</strong> — tersedia melalui email yang terdaftar.</li>
      </ul>

      <h2>7. Hal yang Tidak Ditanggung oleh Perlindungan Pembeli</h2>
      <div className='legal-warn'>
        <strong>Perhatian:</strong> Perlindungan Pembeli GHub tidak mencakup:
      </div>
      <ul>
        <li>Transaksi yang dilakukan di luar Platform GHub.</li>
        <li>Kerugian akibat Pembeli memberikan informasi yang salah (misalnya ID game yang salah).</li>
        <li>Produk yang sudah berhasil diterima dan digunakan oleh Pembeli.</li>
        <li>Kerugian yang disebabkan oleh kompromi pada akun Pembeli yang tidak dilaporkan segera.</li>
        <li>Perubahan kebijakan atau kondisi layanan oleh game atau platform pihak ketiga.</li>
      </ul>

      <h2>8. Tips Keamanan untuk Pembeli</h2>
      <ul>
        <li>Aktifkan Two-Factor Authentication (2FA) di pengaturan keamanan akun.</li>
        <li>Gunakan password yang kuat dan unik untuk akun GHub Anda.</li>
        <li>Jangan pernah membagikan informasi login atau kode OTP kepada siapapun, termasuk yang mengaku sebagai tim GHub.</li>
        <li>Selalu verifikasi identitas Seller melalui halaman profil toko sebelum melakukan pembelian.</li>
        <li>Hanya gunakan metode pembayaran yang tersedia di Platform GHub.</li>
        <li>Laporkan segera jika menemukan aktivitas mencurigakan di akun Anda.</li>
      </ul>

      <h2>9. Hubungi Tim GHub</h2>
      <p>
        Jika Anda mengalami masalah yang tidak dapat diselesaikan melalui mekanisme di atas,
        hubungi tim GHub melalui <a href='/help'>Pusat Bantuan</a>.
      </p>
    </LegalLayout>
  );
}
