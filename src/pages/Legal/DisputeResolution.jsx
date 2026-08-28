import React from 'react';
import LegalLayout from './LegalLayout';

export default function DisputeResolution() {
  return (
    <LegalLayout title='Kebijakan Penyelesaian Sengketa' lastUpdated='1 Agustus 2026'>
      <div className='legal-note'>
        <strong>Status sistem:</strong> Penyelesaian sengketa saat ini ditangani secara manual
        oleh tim GHub. Belum tersedia resolusi otomatis.
      </div>

      <h2>1. Definisi Sengketa</h2>
      <p>
        Sengketa (<em>dispute</em>) adalah perselisihan yang timbul antara Pembeli dan Seller
        terkait suatu transaksi di Platform GHub, di mana salah satu pihak merasa haknya
        tidak terpenuhi dan tidak dapat diselesaikan melalui komunikasi langsung antar pihak.
      </p>

      <h2>2. Langkah Sebelum Mengajukan Sengketa</h2>
      <p>
        Sebelum mengajukan sengketa formal, Pembeli dan Seller dianjurkan untuk:
      </p>
      <ol>
        <li>
          <strong>Komunikasi langsung</strong> — gunakan fitur chat pesanan yang tersedia di
          halaman detail pesanan untuk mendiskusikan masalah secara langsung. Seluruh komunikasi
          terdokumentasi di sistem GHub.
        </li>
        <li>
          <strong>Coba selesaikan dalam 24-48 jam</strong> — berikan waktu yang wajar kepada
          pihak lain untuk merespons dan menyelesaikan masalah.
        </li>
        <li>
          <strong>Kumpulkan bukti</strong> — simpan screenshot, riwayat chat, dan informasi
          pesanan yang relevan sebagai bukti pendukung.
        </li>
      </ol>

      <h2>3. Cara Mengajukan Sengketa</h2>
      <p>
        Jika perselisihan tidak dapat diselesaikan secara langsung, Pembeli dapat mengajukan
        sengketa melalui Platform dengan menyertakan:
      </p>
      <ul>
        <li>Nomor pesanan yang terkait sengketa.</li>
        <li>Alasan sengketa yang jelas dan ringkas.</li>
        <li>Detail tambahan yang mendukung klaim.</li>
      </ul>
      <p>
        Pengajuan sengketa menghasilkan notifikasi kepada pihak-pihak terkait dan tim GHub.
      </p>

      <h2>4. Proses Penanganan Sengketa</h2>
      <p>Setelah sengketa diajukan:</p>
      <ol>
        <li>Tim GHub menerima notifikasi dan mulai meninjau sengketa.</li>
        <li>Kedua belah pihak (Pembeli dan Seller) mungkin diminta memberikan klarifikasi atau bukti tambahan.</li>
        <li>Tim GHub mengevaluasi bukti yang tersedia secara objektif.</li>
        <li>Keputusan diambil oleh tim GHub dan diberitahukan kepada kedua belah pihak melalui Platform.</li>
        <li>
          Jika sengketa mengakibatkan refund, proses refund akan mengikuti mekanisme yang
          diatur dalam <a href='/refund-policy'>Kebijakan Refund dan Pembatalan</a>.
        </li>
      </ol>

      <h2>5. Status Sengketa</h2>
      <p>Sengketa yang diajukan dapat memiliki status berikut:</p>
      <ul>
        <li><strong>Diajukan</strong> — sengketa diterima dan menunggu review dari tim GHub.</li>
        <li><strong>Dalam Proses</strong> — tim GHub sedang meninjau dan menginvestigasi sengketa.</li>
        <li><strong>Diselesaikan</strong> — sengketa telah mendapatkan keputusan akhir.</li>
        <li><strong>Ditutup</strong> — sengketa ditutup tanpa keputusan (misalnya karena pencabutan oleh Pembeli atau bukti tidak cukup).</li>
      </ul>

      <h2>6. Keputusan GHub</h2>
      <p>
        Keputusan yang diambil oleh tim GHub dalam proses penyelesaian sengketa bersifat final
        dalam konteks Platform GHub. GHub berupaya untuk membuat keputusan yang adil berdasarkan:
      </p>
      <ul>
        <li>Bukti yang disampaikan oleh kedua belah pihak.</li>
        <li>Riwayat komunikasi melalui chat pesanan.</li>
        <li>Ketentuan yang berlaku di Platform GHub.</li>
        <li>Rekam jejak transaksi dan pesanan di sistem GHub.</li>
      </ul>

      <h2>7. Banding</h2>
      <p>
        Jika salah satu pihak merasa keputusan tidak adil, mereka dapat mengajukan banding
        melalui <a href='/help'>Pusat Bantuan</a> dengan menyertakan alasan dan bukti tambahan
        yang belum disampaikan sebelumnya. Tim GHub akan meninjau banding secara terpisah.
      </p>

      <h2>8. Kewajiban selama Proses Sengketa</h2>
      <p>Selama proses sengketa berlangsung:</p>
      <ul>
        <li>Kedua belah pihak diharapkan bersikap kooperatif dan menjawab permintaan klarifikasi dari tim GHub.</li>
        <li>Seller tidak diizinkan menarik saldo yang terkait dengan pesanan yang disengketakan.</li>
        <li>Pembeli tidak diizinkan mengajukan chargeback langsung ke bank/penyedia pembayaran selama proses sengketa GHub masih berlangsung.</li>
      </ul>

      <h2>9. Penyelesaian di Luar Platform</h2>
      <p>
        GHub mendorong penyelesaian sengketa melalui mekanisme yang tersedia di Platform.
        Jika sengketa tidak dapat diselesaikan melalui Platform, para pihak dapat menempuh
        jalur hukum yang berlaku di Republik Indonesia.
      </p>

      <h2>10. Pencegahan Sengketa</h2>
      <p>Tips untuk mengurangi risiko sengketa:</p>
      <ul>
        <li><strong>Untuk Pembeli:</strong> Baca deskripsi produk dengan teliti, pastikan data pesanan (ID game, server, dll.) yang Anda masukkan sudah benar, dan komunikasikan pertanyaan dengan Seller sebelum membeli.</li>
        <li><strong>Untuk Seller:</strong> Buat deskripsi produk yang jelas dan akurat, respons pesan Pembeli dengan cepat, dan pastikan stok tersedia sebelum listing aktif.</li>
      </ul>

      <h2>11. Hubungi Kami</h2>
      <p>
        Untuk informasi lebih lanjut tentang proses sengketa, silakan hubungi tim GHub melalui{' '}
        <a href='/help'>Pusat Bantuan</a>.
      </p>
    </LegalLayout>
  );
}
