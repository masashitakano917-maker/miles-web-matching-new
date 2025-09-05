import React from 'react';
import { ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Header from '../components/Header';

const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade">
          Discover the world together
          <span className="block text-orange-400">with locals</span>
        </h1>

        <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed animate-fade-delayed">
          Unforgettable journeys, authentic experiences curated by Miles
        </p>

        <a
          href="#explore"
          className="btn bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-2 mx-auto animate-fade-delayed"
          aria-label="Explore Experiences"
        >
          Explore Experiences
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

const HomePage: React.FC = () => {
  return (
    <>
      <Header />
      <main className="scroll-smooth">
        <Hero />

        <section id="explore" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-16">
          <h2 className="text-3xl font-bold mb-6">Get Started</h2>
          <p className="text-gray-600 mb-8">写真撮影 / お掃除 / 人材派遣 を選んで、プランを比較しそのまま発注できます。</p>
          <div className="grid md:grid-cols-3 gap-6">
            <NavLink to="/services?tab=photo" className="card p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-2">写真撮影</h3>
              <p className="text-gray-600">不動産 / Food / ポートレート / ウェディング</p>
            </NavLink>
            <NavLink to="/services?tab=clean" className="card p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-2">お掃除サービス</h3>
              <p className="text-gray-600">Studio / 1LDK / 2LDK / 3LDK</p>
            </NavLink>
            <NavLink to="/services?tab=staff" className="card p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-2">人材派遣</h3>
              <p className="text-gray-600">準備中</p>
            </NavLink>
          </div>
        </section>

        <section id="about" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-16">
          <h2 className="text-3xl font-bold mb-4">About Miles</h2>
          <p className="text-gray-700">人と人をつなぐマッチングプラットフォーム。シンプル・迅速・透明。</p>
        </section>

        <section id="how" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <ol className="list-decimal ml-6 text-gray-700 space-y-2">
            <li>サービスとプランを選ぶ</li>
            <li>オーダーフォームに入力 → 確認</li>
            <li>発注 → 運営ダッシュボードへ → 郵便番号で近いプロに順次通知</li>
            <li>最初にOKしたプロでマッチ確定、メール配信（クライアント/プロ/運営）</li>
          </ol>
        </section>

        <section id="faq" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-16">
          <h2 className="text-3xl font-bold mb-4">FAQ</h2>
          <p className="text-gray-700">よくある質問は準備中です。</p>
        </section>

        <section id="contact" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-16">
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="text-gray-700">support@miles.example</p>
        </section>
      </main>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 text-gray-600">
          © {new Date().getFullYear()} Miles. All rights reserved.
        </div>
      </footer>
    </>
  );
};

export default HomePage;
