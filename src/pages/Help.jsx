import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const FAQ_ITEMS = [
  {
    category: 'Pembelian & Transaksi',
    questions: [
      {
        q: 'Bagaimana cara membeli voucher atau item game di GHub?',
        a: 'Pilih produk yang diinginkan di menu Marketplace atau halaman Game, pilih variasi/nominal, masukkan data ID akun game Anda jika diminta, lalu klik Beli Sekarang dan lanjutkan ke pembayaran.',
      },
      {
        q: 'Metode pembayaran apa saja yang didukung?',
        a: 'GHub mendukung QRIS (GoPay, OVO, Dana, ShopeePay), Transfer Bank Virtual Account (BCA, Mandiri, BNI, BRI), Kartu Kredit/Debit, dan Saldo Akun.',
      },
      {
        q: 'Berapa lama waktu pengiriman produk?',
        a: 'Sebagian besar produk bertanda "Instant Delivery" akan dikirimkan otomatis dalam waktu 1-5 menit setelah pembayaran berhasil.',
      },
    ],
  },
  {
    category: 'Keamanan & Garansi',
    questions: [
      {
        q: 'Apakah transaksi di GHub terjamin aman?',
        a: 'Ya! GHub menggunakan sistem Escrow (Rekber Otomatis). Dana pembayaran disimpan aman oleh sistem dan baru diteruskan ke penjual setelah pembeli mengonfirmasi pesanan diterima dengan benar.',
      },
      {
        q: 'Apa yang harus dilakukan jika pesanan bermasalah?',
        a: 'Anda dapat menghubungi penjual via fitur Chat Pesanan. Jika tidak ada tanggapan atau produk tidak sesuai, klik tombol "Ajukan Dispute" di halaman Detail Pesanan untuk ditengahi oleh tim CS GHub.',
      },
    ],
  },
  {
    category: 'Penjual (Seller)',
    questions: [
      {
        q: 'Bagaimana cara menjadi penjual di GHub?',
        a: 'Klik menu "Jadi Seller" pada bagian navigasi atas, lengkapi formulir pendaftaran toko dan data verifikasi identitas, lalu tim kami akan memproses persetujuan dalam 1x24 jam.',
      },
      {
        q: 'Kapan saldo penjualan bisa ditarik?',
        a: 'Saldo hasil penjualan dapat ditarik langsung ke rekening bank Anda setelah pesanan selesai dan melalui proses settlement aman.',
      },
    ],
  },
];

export default function Help() {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState('0-0');

  const toggleAccordion = (id) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Header />

      <div className='container' style={{ flex: 1, padding: '36px 16px', maxWidth: 1020, margin: '0 auto', width: '100%' }}>
        {/* Banner Search */}
        <div
          className='card'
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(30,27,75,0.4) 100%)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 20,
            padding: '36px 28px',
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(99,102,241,0.2)',
              color: '#818cf8',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 20,
              marginBottom: 10,
            }}
          >
            Pusat Bantuan & FAQ
          </span>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#fff' }}>
            Ada yang bisa kami bantu?
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: 480, margin: '8px auto 20px' }}>
            Temukan jawaban untuk pertanyaan umum mengenai transaksi, pembayaran, dan akun Anda.
          </p>

          <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}>
            <i
              className='fa-solid fa-magnifying-glass'
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
            />
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Ketik pertanyaan atau kata kunci bantuan...'
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: '0.95rem',
              }}
            />
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div
            className='card'
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(99,102,241,0.15)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
              }}
            >
              <i className='fa-solid fa-headset' />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Customer Service</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Bantuan live AI & agen 24/7</div>
            </div>
          </div>

          <div
            className='card'
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(16,185,129,0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
              }}
            >
              <i className='fa-solid fa-shield-halved' />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Garansi 100% Aman</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Proteksi dana rekber otomatis</div>
            </div>
          </div>

          <div
            className='card'
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(56,189,248,0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
              }}
            >
              <i className='fa-solid fa-bolt' />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Pengiriman Cepat</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Proses otomatis hitungan menit</div>
            </div>
          </div>
        </div>

        {/* FAQ Accordion Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {FAQ_ITEMS.map((cat, catIdx) => {
            const filteredQ = cat.questions.filter(
              (item) =>
                !search ||
                item.q.toLowerCase().includes(search.toLowerCase()) ||
                item.a.toLowerCase().includes(search.toLowerCase())
            );

            if (filteredQ.length === 0) return null;

            return (
              <div
                key={catIdx}
                className='card'
                style={{
                  background: 'var(--surface)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '1.15rem' }}>{cat.category}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredQ.map((item, qIdx) => {
                    const id = `${catIdx}-${qIdx}`;
                    const isOpen = openIndex === id;

                    return (
                      <div
                        key={qIdx}
                        style={{
                          borderRadius: 12,
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.04)',
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          type='button'
                          onClick={() => toggleAccordion(id)}
                          style={{
                            width: '100%',
                            padding: '14px 18px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          <span>{item.q}</span>
                          <i
                            className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`}
                            style={{ fontSize: '0.8rem', color: '#818cf8', marginLeft: 12 }}
                          />
                        </button>

                        {isOpen && (
                          <div
                            style={{
                              padding: '0 18px 16px',
                              color: '#94a3b8',
                              fontSize: '0.88rem',
                              lineHeight: 1.6,
                              borderTop: '1px solid rgba(255,255,255,0.03)',
                              paddingTop: 12,
                            }}
                          >
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            marginTop: 32,
            textAlign: 'center',
            padding: '24px',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>Masih butuh bantuan lain?</div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 16px' }}>
            Hubungi Customer Care kami melalui asisten AI di pojok kanan bawah atau kembali ke beranda.
          </p>
          <Link to='/' className='button small outline'>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
