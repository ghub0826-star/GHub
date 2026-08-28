import React from 'react';
import LegalLayout from './LegalLayout';

export default function RefundPolicy() {
  return (
    <LegalLayout title='Kebijakan Refund dan Pembatalan' lastUpdated='1 Agustus 2026'>
      <div className='legal-warn'>
        <strong>Penting:</strong> Produk digital bersifat tidak berwujud dan pengirimannya umumnya
        instan. Baca kebijakan ini dengan seksama sebelum melakukan pembelian.
      </div>

      <h2>1. Gambaran Umum</h2>
      <p>
        GHub adalah platform marketplace yang memfasilitasi transaksi produk digital antara Pembeli
        dan Seller. GHub berperan sebagai perantara — bukan sebagai penjual langsung — sehingga
        penyelesaian setiap transaksi melibatkan interaksi antara Pembeli, Seller, dan tim GHub.
      </p>
      <p>
        Kebijakan ini menjelaskan kondisi-kondisi di mana Pembeli dapat mengajukan permohonan refund
        atau pembatalan pesanan berdasarkan mekanisme yang tersedia di Platform saat ini.
      </p>

      <h2>2. Pembatalan Pesanan oleh Pembeli</h2>
      <p>
        Pembeli dapat mengajukan pembatalan pesanan melalui Platform dengan ketentuan berikut:
      </p>
      <ul>
        <li>
          Pembatalan <strong>hanya dapat dilakukan</strong> selama status pesanan masih
          dalam tahap yang memungkinkan pembatalan sesuai mekanisme Platform (misalnya belum
          diproses oleh Seller).
        </li>
        <li>
          Pembatalan pesanan yang sudah diproses atau sudah dikirim oleh Seller memerlukan
          persetujuan dari Seller dan/atau keputusan tim GHub.
        </li>
        <li>
          Pesanan yang berstatus pembayaran berhasil (<em>PAID</em>) tidak dapat dibatalkan
          secara otomatis dan memerlukan proses pengajuan khusus.
        </li>
      </ul>

      <h2>3. Pengajuan Refund</h2>
      <p>
        Pembeli dapat mengajukan permohonan refund melalui fitur yang tersedia di Platform dengan
        menyertakan:
      </p>
      <ul>
        <li>Nomor pesanan yang terkait.</li>
        <li>Jumlah yang diklaim untuk refund.</li>
        <li>Alasan pengajuan refund yang jelas dan dapat diverifikasi.</li>
      </ul>

      <h3>3.1 Kondisi yang Dapat Dipertimbangkan untuk Refund</h3>
      <ul>
        <li>Produk tidak diterima setelah waktu pengiriman yang dijanjikan terlewati.</li>
        <li>Produk yang diterima tidak sesuai dengan deskripsi yang tercantum di listing.</li>
        <li>Transaksi dilakukan secara tidak sah atau tanpa sepengetahuan pemilik akun.</li>
        <li>Seller terbukti tidak memenuhi kewajibannya.</li>
      </ul>

      <h3>3.2 Kondisi yang Tidak Dapat Diajukan untuk Refund</h3>
      <ul>
        <li>Pembeli berubah pikiran setelah produk berhasil dikirim sesuai deskripsi.</li>
        <li>Produk digital yang sudah digunakan atau diklaim oleh Pembeli.</li>
        <li>Pengajuan melewati batas waktu yang ditetapkan.</li>
        <li>Masalah yang disebabkan oleh kesalahan informasi yang diberikan Pembeli (misalnya ID game yang salah).</li>
      </ul>

      <h2>4. Proses Penanganan Refund</h2>
      <div className='legal-note'>
        <strong>Status saat ini:</strong> Penanganan refund dilakukan secara manual oleh tim GHub.
        Belum tersedia proses refund otomatis langsung ke metode pembayaran asal.
      </div>
      <p>Alur pengajuan refund yang berlaku:</p>
      <ol>
        <li>Pembeli mengajukan permohonan refund melalui Platform dengan data yang lengkap.</li>
        <li>Tim GHub menerima notifikasi dan mulai meninjau permohonan.</li>
        <li>Tim GHub dapat menghubungi Pembeli dan/atau Seller untuk klarifikasi.</li>
        <li>Keputusan diambil berdasarkan bukti yang tersedia dan kebijakan yang berlaku.</li>
        <li>
          Jika refund disetujui, GHub akan memproses pengembalian dana sesuai kemampuan
          teknis sistem yang tersedia pada saat itu. GHub akan memberitahukan Pembeli
          mengenai metode dan estimasi waktu pencairan.
        </li>
        <li>
          Jika permohonan ditolak, GHub akan memberikan alasan penolakan kepada Pembeli.
        </li>
      </ol>

      <h2>5. Dampak Refund terhadap Seller</h2>
      <p>
        Apabila refund disetujui dan pesanan terkait mengakibatkan dana telah dihitung ke saldo Seller:
      </p>
      <ul>
        <li>Saldo yang tertahan (<em>held balance</em>) Seller akan dikurangi sesuai jumlah refund.</li>
        <li>Seller akan menerima notifikasi terkait keputusan refund.</li>
        <li>
          Seller yang terbukti menyebabkan refund karena kelalaian atau pelanggaran dapat dikenakan
          tindakan lebih lanjut sesuai Perjanjian Seller.
        </li>
      </ul>

      <h2>6. Pembatalan oleh Seller</h2>
      <p>
        Seller dapat membatalkan pesanan yang belum diproses jika terdapat alasan yang sah,
        seperti stok habis atau kesalahan harga. Pembatalan oleh Seller yang berulang dapat
        menyebabkan penangguhan akun Seller.
      </p>

      <h2>7. Batas Waktu Pengajuan</h2>
      <p>
        Permohonan refund harus diajukan dalam waktu yang wajar setelah masalah diketahui.
        GHub berhak menolak permohonan yang diajukan terlambat tanpa alasan yang dapat diterima.
      </p>

      <h2>8. Hubungi Tim GHub</h2>
      <p>
        Untuk mengajukan refund atau pertanyaan terkait kebijakan ini, silakan gunakan fitur
        pengajuan yang tersedia di halaman detail pesanan atau melalui{' '}
        <a href='/help'>Pusat Bantuan</a>.
      </p>
    </LegalLayout>
  );
}
