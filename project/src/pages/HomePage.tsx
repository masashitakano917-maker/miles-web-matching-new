import React from 'react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Header from '../components/Header';

const Hero: React.FC = () => (
  <section className="relative overflow-hidden">
    {/* 背景：写真＋グラデ */}
    <div
      className="absolute inset-0 -z-10 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=2400&auto=format&fit=crop')",
      }}
    />
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/70 via-white/70 to-white" />

    <div className="container-xl pt-14 pb-20 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-black/5 mb-6">
        <Sparkles className="w-4 h-4" /> New • Matching platform for people
      </div>

      <h1 className="display text-4xl sm:text-6xl md:text-7xl mb-6 animate-fade"
          style={{background:'linear-gradient(120deg,var(--brand-from),var(--brand-to))',
                  WebkitBackgroundClip:'text', color:'transparent'}}>
        Match with the right professional
      </h1>

      <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 animate-fade-2">
        写真撮影・お掃除・人材派遣。郵便番号ベースで近い順に通知、OKした人で即マッチング。
      </p>

      <div className="flex items-center justify-center gap-3 animate-fade-3">
        <NavLink to="/services?tab=photo" className="btn btn-primary px-6 py-3 rounded-2xl">
          Get Started <ArrowRight className="w-5 h-5 ml-2" />
        </NavLink>
        <a href="#how" className="btn-ghost">How it works</a>
      </div>
    </div>
  </section>
);

const Features: React.FC = () => (
  <section className="container-xl py-16">
    <div className="grid md:grid-cols-3 gap-6">
      {[
        { title: '半径50kmで候補抽出', desc: '郵便番号→座標化し、近い順に候補を作成。' },
        { title: '順次通知（7分）', desc: '1人ずつLINE+メール通知。OKで即確定。' },
        { title: 'リンクはワンタップ', desc: '受諾後は他リンクを即時失効。フェアで高速。' },
      ].map((f, i) => (
        <div className="card p-6" key={i}>
          <CheckCircle2 className="w-6 h-6 text-green-600 mb-3" />
          <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
          <p className="text-gray-600">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

const CTA: React.FC = () => (
  <section className="container-xl pb-20">
    <div className="card p-8 md:p-12 text-center">
      <h3 className="display text-3xl mb-3">Start your first order today</h3>
      <p className="text-gray-600 mb-6">プランを選んでオーダー。運営・プロ・クライアントへ自動で通知。</p>
      <NavLink to="/services?tab=photo" className="btn btn-primary px-6 py-3 rounded-2xl">
        Choose a service <ArrowRight className="w-5 h-5 ml-2" />
      </NavLink>
    </div>
  </section>
);

const HomePage: React.FC = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />

        <section id="explore" className="container-xl py-10">
          <h2 className="display text-3xl mb-6">Explore services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { to:'/services?tab=photo', title:'写真撮影', desc:'不動産 / Food / ポートレート / ウェディング' },
              { to:'/services?tab=clean', title:'お掃除サービス', desc:'Studio / 1LDK / 2LDK / 3LDK' },
              { to:'/services?tab=staff', title:'人材派遣', desc:'準備中' },
            ].map(card => (
              <NavLink key={card.title} to={card.to} className="card p-6 hover:shadow-xl transition-shadow">
                <div className="text-lg font-semibold mb-1">{card.title}</div>
                <div className="text-gray-600">{card.desc}</div>
              </NavLink>
            ))}
          </div>
        </section>

        <div className="container-xl"><div className="hr my-10" /></div>

        <section id="about" className="container-xl py-4">
          <h2 className="display text-3xl mb-3">About Miles</h2>
          <p className="text-gray-700 max-w-3xl">
            人と人をつなぐミニマルなマッチング。依頼は最短数分で確定。透明でスピーディな体験を提供します。
          </p>
        </section>

        <section id="how" className="container-xl py-12">
          <h2 className="display text-3xl mb-4">How It Works</h2>
          <ol className="list-decimal ml-6 text-gray-700 space-y-2">
            <li>サービスとプランを選ぶ</li>
            <li>オーダーフォームに入力 → 確認</li>
            <li>発注 → 運営ダッシュボードへ → 郵便番号で近いプロに順次通知</li>
            <li>最初にOKしたプロでマッチ確定、メール配信（クライアント/プロ/運営）</li>
          </ol>
        </section>

        <Features />

        <section id="faq" className="container-xl py-10">
          <h2 className="display text-3xl mb-3">FAQ</h2>
          <p className="text-gray-700">よくある質問は準備中です。</p>
        </section>

        <section id="contact" className="container-xl py-16">
          <h2 className="display text-3xl mb-3">Contact Us</h2>
          <p className="text-gray-700">support@miles.example</p>
        </section>

        <CTA />
      </main>

      <footer className="border-t border-white/30">
        <div className="container-xl py-8 text-sm text-gray-600">
          © {new Date().getFullYear()} Miles. All rights reserved.
        </div>
      </footer>
    </>
  );
};

export default HomePage;
