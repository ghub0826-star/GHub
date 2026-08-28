import React from 'react';
import LegalLayout from './LegalLayout';

export default function SellerAgreement() {
  return (
    <LegalLayout title='Perjanjian Seller' lastUpdated='1 Agustus 2026'>
      <div className='legal-note'>
        <strong>Berlaku untuk:</strong> Seluruh pengguna yang mendaftar dan mengoperasikan toko
        sebagai Seller di Platform GHub. Perjanjian ini mengikat sejak permohonan Seller disetujui.
      </div>

      <h2>1. Pendaftaran dan Persetujuan Seller</h2>
      <p>Untuk menjadi Seller di GHub, Anda harus:</p>
      <ul>
        <li>Mengisi formulir pendaftaran Seller dengan informasi yang benar dan lengkap, termasuk nama lengkap, username, email, nomor WhatsApp, nama toko, store slug, dan logo toko.</li>
        <li>Memberikan informasi rekening pencairan yang valid (nama pemilik, nomor rekening/akun, dan nama bank/penyedia).</li>
        <li>Mengunggah logo toko dalam format gambar yang sesuai.</li>
        <li>Menyetujui Perjanjian Seller ini dan Syarat dan Ketentuan GHub.</li>
      </ul>
      <p>
        Setelah pengajuan diterima, GHub akan melakukan proses verifikasi. Status pengajuan Anda
        dapat dipantau melalui halaman Seller Pending. GHub berhak menolak pengajuan tanpa
        memberikan alasan.
      </p>

      <h2>2. Status Verifikasi Seller</h2>
      <p>Seller dapat memiliki status verifikasi berikut:</p>
      <ul>
        <li><strong>PENDING</strong> — Pengajuan sedang dalam proses review oleh tim GHub.</li>
        <li><strong>APPROVED / VERIFIED</strong> — Seller telah diverifikasi dan dapat mengoperasikan toko secara penuh.</li>
        <li><strong>REJECTED</strong> — Pengajuan ditolak; Anda dapat mengajukan ulang setelah memenuhi persyaratan.</li>
        <li><strong>SUSPENDED</strong> — Akun Seller ditangguhkan karena pelanggaran kebijakan.</li>
      </ul>

      <h2>3. Tanggung Jawab Seller</h2>
      <p>Sebagai Seller di GHub, Anda bertanggung jawab untuk:</p>
      <ul>
        <li>Memastikan setiap listing produk mengandung informasi yang akurat, jelas, dan tidak menyesatkan.</li>
        <li>Menetapkan harga yang wajar dan tidak melakukan manipulasi harga.</li>
        <li>Memproses pesanan yang masuk dalam waktu yang wajar sesuai estimasi pengiriman yang tertera.</li>
        <li>Berkomunikasi dengan Pembeli secara profesional dan responsif melalui fitur chat yang tersedia.</li>
        <li>Hanya menjual produk yang tidak masuk dalam daftar Produk Terlarang.</li>
        <li>Tidak mendorong Pembeli untuk melakukan transaksi di luar Platform (off-platform trading).</li>
        <li>Menjaga stok produk yang tercantum agar tetap akurat.</li>
      </ul>

      <h2>4. Produk yang Diperbolehkan</h2>
      <p>Seller hanya diizinkan menjual produk digital yang termasuk dalam kategori yang diizinkan oleh GHub, antara lain:</p>
      <ul>
        <li>Mata uang dalam game (in-game currency)</li>
        <li>Item virtual dalam game</li>
        <li>Akun game (dengan ketentuan sesuai kebijakan game terkait)</li>
        <li>Skin dan kosmetik dalam game</li>
        <li>Jasa boosting / jasa game (sesuai ketentuan)</li>
        <li>Produk digital lainnya yang secara eksplisit diizinkan oleh GHub</li>
      </ul>
      <p>
        Seller wajib memastikan produk yang dijual tidak melanggar Ketentuan Layanan game atau
        platform pihak ketiga terkait, serta tidak melanggar <a href='/prohibited-products'>Kebijakan Produk Terlarang GHub</a>.
      </p>

      <h2>5. Dashboard dan Fitur Seller</h2>
      <p>Seller yang telah disetujui memiliki akses ke:</p>
      <ul>
        <li><strong>Dashboard Seller</strong> — ringkasan statistik toko (total produk, produk aktif, stok habis).</li>
        <li><strong>Manajemen Produk</strong> — membuat, mengedit, dan mengelola listing produk.</li>
        <li><strong>Manajemen Pesanan</strong> — melihat dan memperbarui status pesanan yang masuk.</li>
        <li><strong>Wallet dan Ledger</strong> — melihat saldo tersedia, saldo tertahan, dan riwayat transaksi keuangan toko.</li>
        <li><strong>Chat Pesanan</strong> — berkomunikasi dengan Pembeli terkait pesanan tertentu.</li>
        <li><strong>Earnings</strong> — laporan pendapatan toko.</li>
      </ul>

      <h2>6. Biaya Platform dan Pembagian Pendapatan</h2>
      <p>
        GHub mengenakan biaya platform atas setiap transaksi yang berhasil. Biaya ini dipotong
        secara otomatis dari dana penjualan sebelum dikreditkan ke saldo tersedia Seller
        (berdasarkan mekanisme <em>releaseSaleFunds</em> yang diimplementasikan di Platform).
      </p>
      <ul>
        <li>Besaran biaya platform dapat berubah sewaktu-waktu dan akan diberitahukan kepada Seller.</li>
        <li>Saldo penjualan awalnya berstatus <em>tertahan (held)</em> selama proses verifikasi dan pelepasan dana berlangsung.</li>
        <li>Setelah kondisi pelepasan terpenuhi, saldo dipindahkan ke status <em>tersedia (available)</em>.</li>
      </ul>

      <h2>7. Penarikan Saldo (Withdrawal)</h2>
      <p>
        Seller dapat mengajukan penarikan saldo yang berstatus tersedia sesuai mekanisme pencairan
        yang berlaku di Platform. GHub tidak menjamin waktu pencairan tertentu dan dapat menunda
        pencairan jika terdapat indikasi masalah keamanan atau sengketa yang belum terselesaikan.
      </p>

      <h2>8. Larangan Seller</h2>
      <p>Seller dilarang:</p>
      <ul>
        <li>Membuat listing produk fiktif atau tidak dapat dikirimkan.</li>
        <li>Menipu Pembeli dengan klaim palsu tentang produk.</li>
        <li>Meminta Pembeli untuk melakukan pembayaran di luar Platform.</li>
        <li>Memiliki lebih dari satu akun Seller aktif tanpa izin GHub.</li>
        <li>Memanipulasi review atau rating toko.</li>
        <li>Menggunakan Platform untuk aktivitas pencucian uang atau tujuan ilegal lainnya.</li>
      </ul>

      <h2>9. Pelanggaran dan Sanksi</h2>
      <p>Pelanggaran terhadap Perjanjian Seller ini dapat mengakibatkan:</p>
      <ul>
        <li>Penghapusan listing produk yang melanggar.</li>
        <li>Penangguhan sementara akun Seller.</li>
        <li>Pencabutan permanen status Seller.</li>
        <li>Pemblokiran penarikan saldo hingga penyelesaian investigasi.</li>
        <li>Pelaporan kepada otoritas hukum yang berwenang jika diperlukan.</li>
      </ul>

      <h2>10. Banding</h2>
      <p>
        Jika Anda merasa keputusan yang diambil terhadap akun Seller Anda tidak adil, Anda dapat
        mengajukan banding melalui <a href='/help'>Pusat Bantuan</a>. GHub akan meninjau banding
        secara wajar berdasarkan bukti yang tersedia.
      </p>

      <h2>11. Perubahan Perjanjian</h2>
      <p>
        GHub berhak mengubah Perjanjian Seller ini sewaktu-waktu. Perubahan akan diberitahukan
        melalui Platform atau email. Melanjutkan operasi toko setelah perubahan berlaku dianggap
        sebagai penerimaan atas perjanjian yang diperbarui.
      </p>

      <h2>12. Hubungi Kami</h2>
      <p>
        Untuk pertanyaan tentang Perjanjian Seller, silakan hubungi tim GHub melalui{' '}
        <a href='/help'>Pusat Bantuan</a>.
      </p>
    </LegalLayout>
  );
}
