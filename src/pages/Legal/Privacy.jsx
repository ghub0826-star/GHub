import React from 'react';
import LegalLayout from './LegalLayout';

export default function Privacy() {
  return (
    <LegalLayout title='Kebijakan Privasi' lastUpdated='1 Agustus 2026'>
      <div className='legal-note'>
        <strong>Ringkasan:</strong> GHub mengumpulkan data yang Anda berikan saat mendaftar dan
        menggunakan Platform. Kami tidak menjual data Anda kepada pihak ketiga. Data digunakan
        semata-mata untuk menjalankan layanan Platform.
      </div>

      <h2>1. Data yang Kami Kumpulkan</h2>
      <p>
        Berdasarkan implementasi aktual Platform GHub, kami mengumpulkan dan memproses data berikut:
      </p>

      <h3>1.1 Data yang Anda Berikan Secara Langsung</h3>
      <ul>
        <li><strong>Nama lengkap</strong> — dikumpulkan saat pendaftaran akun.</li>
        <li><strong>Username</strong> — dikumpulkan saat pendaftaran akun; bersifat unik per pengguna.</li>
        <li><strong>Alamat email</strong> — digunakan untuk autentikasi dan komunikasi penting terkait akun.</li>
        <li><strong>Nomor WhatsApp / telepon</strong> — dikumpulkan saat pendaftaran sebagai informasi kontak tambahan.</li>
        <li><strong>Password</strong> — tidak pernah disimpan dalam bentuk teks biasa; selalu di-hash menggunakan algoritma bcrypt sebelum disimpan di database.</li>
        <li><strong>Foto profil / avatar</strong> — diunggah secara opsional oleh Pengguna.</li>
        <li><strong>Data toko Seller</strong> — nama toko, store slug, deskripsi, logo, banner, dan informasi rekening pencairan yang diberikan saat pendaftaran Seller.</li>
      </ul>

      <h3>1.2 Data yang Dikumpulkan Secara Otomatis</h3>
      <ul>
        <li>
          <strong>Alamat IP</strong> — dikumpulkan saat login dan aktivitas tertentu.
          IP disimpan dalam bentuk <em>hash SHA-256</em> (tidak dapat dikembalikan ke IP asli)
          untuk keperluan keamanan seperti deteksi brute-force dan pelacakan sesi.
        </li>
        <li><strong>User-Agent browser</strong> — dikumpulkan saat pembuatan sesi login untuk identifikasi perangkat.</li>
        <li><strong>Waktu login dan aktivitas sesi</strong> — dicatat untuk keperluan keamanan dan manajemen sesi.</li>
        <li><strong>Log percobaan login</strong> — dicatat (dalam bentuk hash) untuk perlindungan akun dari serangan brute-force.</li>
      </ul>

      <h3>1.3 Data Transaksi</h3>
      <ul>
        <li>Riwayat pesanan (order), termasuk produk yang dibeli, jumlah, dan status pesanan.</li>
        <li>Riwayat pembayaran, termasuk metode pembayaran dan status transaksi. Detail kartu kredit atau rekening bank tidak disimpan di server GHub — data tersebut diproses oleh penyedia layanan pembayaran.</li>
        <li>Riwayat saldo dan ledger wallet Seller.</li>
        <li>Riwayat pengajuan refund dan sengketa yang Anda buat.</li>
      </ul>

      <h3>1.4 Data Komunikasi</h3>
      <ul>
        <li>Pesan yang dikirimkan melalui fitur chat yang terkait dengan pesanan.</li>
        <li>Pesan tiket dukungan yang Anda kirimkan.</li>
      </ul>

      <h3>1.5 Data Autentikasi Pihak Ketiga</h3>
      <p>
        Jika Anda mendaftar atau masuk menggunakan Google, GHub menerima dan menyimpan email yang
        terverifikasi dan nama tampilan dari akun Google Anda, serta Firebase UID sebagai pengenal
        unik. GHub tidak menerima atau menyimpan kata sandi akun Google Anda.
      </p>

      <h2>2. Data yang TIDAK Kami Kumpulkan</h2>
      <div className='legal-highlight'>
        Berdasarkan audit source code Platform, GHub <strong>tidak</strong> mengumpulkan atau
        memproses data berikut:
        <ul style={{ marginTop: 10 }}>
          <li>Cookie pelacakan atau analytics cookie pihak ketiga</li>
          <li>Data lokasi GPS atau geolokasi real-time</li>
          <li>Nomor kartu kredit atau rekening bank secara langsung (diproses oleh penyedia pembayaran)</li>
          <li>Data biometrik</li>
          <li>Riwayat browsing di luar Platform</li>
        </ul>
      </div>

      <h2>3. Cara Kami Menggunakan Data</h2>
      <p>Data yang kami kumpulkan digunakan untuk:</p>
      <ul>
        <li>Mengoperasikan dan menyediakan layanan Platform GHub.</li>
        <li>Memverifikasi identitas dan mengamankan akun Anda.</li>
        <li>Memproses transaksi dan mengelola pesanan.</li>
        <li>Mendeteksi dan mencegah penipuan, penyalahgunaan, dan pelanggaran keamanan.</li>
        <li>Mengirimkan notifikasi penting terkait akun, pesanan, dan pembayaran.</li>
        <li>Mematuhi kewajiban hukum yang berlaku.</li>
      </ul>

      <h2>4. Dasar Hukum Pemrosesan</h2>
      <p>GHub memproses data pribadi Anda berdasarkan:</p>
      <ul>
        <li><strong>Pelaksanaan kontrak</strong> — data diperlukan untuk menyediakan layanan yang Anda minta.</li>
        <li><strong>Kepentingan sah</strong> — untuk keamanan Platform dan pencegahan penipuan.</li>
        <li><strong>Kewajiban hukum</strong> — untuk mematuhi peraturan perundang-undangan yang berlaku.</li>
        <li><strong>Persetujuan</strong> — untuk pemrosesan data tertentu yang memerlukan persetujuan eksplisit Anda.</li>
      </ul>

      <h2>5. Berbagi Data dengan Pihak Ketiga</h2>
      <p>GHub dapat berbagi data dengan pihak ketiga terbatas pada situasi berikut:</p>
      <ul>
        <li>
          <strong>Penyedia layanan pembayaran</strong> — data transaksi yang diperlukan diteruskan ke
          penyedia layanan pembayaran yang terintegrasi dengan Platform untuk memproses pembayaran.
          Penyedia ini memiliki kebijakan privasi tersendiri.
        </li>
        <li>
          <strong>Layanan autentikasi</strong> — jika menggunakan login Google, data dikirimkan ke
          dan dari layanan autentikasi Google/Firebase.
        </li>
        <li>
          <strong>Penyedia penyimpanan</strong> — file yang diunggah disimpan melalui layanan
          penyimpanan cloud yang digunakan oleh Platform.
        </li>
        <li>
          <strong>Otoritas hukum</strong> — GHub dapat mengungkapkan data jika diwajibkan oleh
          hukum, perintah pengadilan, atau permintaan resmi dari otoritas berwenang.
        </li>
      </ul>
      <p>
        GHub <strong>tidak menjual, menyewakan, atau memperdagangkan</strong> data pribadi Anda
        kepada pihak ketiga untuk tujuan pemasaran atau komersial.
      </p>

      <h2>6. Keamanan Data</h2>
      <p>GHub menerapkan langkah-langkah keamanan teknis yang meliputi:</p>
      <ul>
        <li>Password di-hash menggunakan bcrypt dengan salt factor 12.</li>
        <li>Alamat IP sensitif disimpan dalam bentuk hash SHA-256.</li>
        <li>Komunikasi menggunakan HTTPS dengan HSTS di lingkungan produksi.</li>
        <li>Token autentikasi JWT menggunakan algoritma HS256 dengan masa berlaku terbatas.</li>
        <li>Pembatasan percobaan login (rate limiting) untuk mencegah brute-force.</li>
        <li>Security headers (X-Frame-Options, X-Content-Type-Options, CSP, dll.).</li>
        <li>CORS whitelist untuk membatasi akses dari origin yang tidak dikenal.</li>
      </ul>
      <div className='legal-warn'>
        <strong>Perhatian:</strong> Meskipun GHub menerapkan langkah-langkah keamanan yang wajar,
        tidak ada sistem yang dapat menjamin keamanan 100%. Kami tidak dapat memberikan jaminan
        mutlak terhadap semua ancaman keamanan siber.
      </div>

      <h2>7. Retensi Data</h2>
      <p>
        GHub menyimpan data Anda selama akun Anda aktif atau selama diperlukan untuk menyediakan
        layanan. Data tertentu mungkin dipertahankan lebih lama jika diwajibkan oleh hukum atau
        untuk keperluan penyelesaian sengketa yang sedang berlangsung.
      </p>

      <h2>8. Hak Anda atas Data</h2>
      <p>Sesuai dengan ketentuan yang berlaku, Anda memiliki hak untuk:</p>
      <ul>
        <li><strong>Mengakses</strong> data pribadi yang kami simpan tentang Anda.</li>
        <li><strong>Memperbaiki</strong> data yang tidak akurat melalui pengaturan akun.</li>
        <li><strong>Menghapus</strong> akun dan data Anda (subject to legal retention requirements).</li>
        <li><strong>Membatasi</strong> pemrosesan data dalam kondisi tertentu.</li>
        <li><strong>Mengajukan keberatan</strong> atas pemrosesan data tertentu.</li>
      </ul>
      <p>
        Untuk menggunakan hak-hak tersebut, silakan hubungi kami melalui{' '}
        <a href='/help'>Pusat Bantuan</a>.
      </p>

      <h2>9. Cookie</h2>
      <p>
        Berdasarkan implementasi Platform saat ini, GHub tidak menggunakan cookie pelacakan pihak
        ketiga. Platform menggunakan mekanisme penyimpanan lokal browser (localStorage) untuk
        menyimpan token autentikasi di sisi klien guna keperluan operasional.
      </p>

      <h2>10. Perubahan Kebijakan Privasi</h2>
      <p>
        Kebijakan Privasi ini dapat diperbarui sewaktu-waktu. Perubahan signifikan akan diberitahukan
        melalui Platform. Penggunaan Platform setelah perubahan berlaku menandakan penerimaan Anda
        atas kebijakan yang diperbarui.
      </p>

      <h2>11. Hubungi Kami</h2>
      <p>
        Untuk pertanyaan mengenai privasi data Anda, silakan hubungi kami melalui{' '}
        <a href='/help'>Pusat Bantuan</a>.
      </p>
    </LegalLayout>
  );
}
