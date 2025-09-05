import React from 'react';
import { Link } from 'react-router-dom';
import {
  Camera, Users, ArrowRight, CheckCircle, Star, Play, Award, Clock, Shield,
} from 'lucide-react';
import Header from '../components/Header';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="pt-16">
        {/* ===== Hero ===== */}
        <section id="hero" className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* 背景画像 */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')",
            }}
            aria-hidden="true"
          />
          {/* 暗幕オーバーレイ（ヘッダーより後ろ） */}
          <div className="absolute inset-0 bg-black/55" aria-hidden="true" />

          {/* コンテンツ */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white tracking-tight">
                プロフェッショナル
                <span className="block text-orange-400">サービスと繋がる</span>
              </h1>
              <p className="text-lg md:text-2xl text-white/90 mt-6 md:mt-8 max-w-4xl mx-auto leading-relaxed">
                質の高いプロフェッショナルと迅速なマッチング。透明な価格、信頼できる結果。
              </p>

              <div className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                >
                  今すぐ始める
                  <ArrowRight className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6" />
                </Link>

                <button
                  type="button"
                  className="inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-bold border-2 border-white text-white hover:bg-white hover:text-orange-600 transition-all duration-300"
                >
                  <Play className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
                  デモを見る
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Stats ===== */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <Stat icon={<Award className="h-8 w-8 text-orange-600" />} value="1000+" label="認証済みプロ" />
              <Stat icon={<CheckCircle className="h-8 w-8 text-orange-600" />} value="5000+" label="完了プロジェクト" />
              <Stat icon={<Clock className="h-8 w-8 text-orange-600" />} value="7分" label="平均マッチング時間" />
              <Stat icon={<Star className="h-8 w-8 text-orange-600" />} value="4.9" label="平均評価" />
            </div>
          </div>
        </section>

        {/* ===== Services ===== */}
        <section id="experiences" className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                プロフェッショナルサービス
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
                あなたのニーズに合わせた高品質なサービスを提供します
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <ServiceCard
                img="https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=600"
                icon={<Camera className="h-7 w-7 text-orange-600" />}
                title="プロフェッショナル写真撮影"
                desc="不動産・料理・ビジネスポートレート・ウェディングなど、熟練のプロが対応。"
                to="/services?tab=photo"
                accent="text-orange-600"
              />
              <ServiceCard
                img="https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=600"
                icon={<Shield className="h-7 w-7 text-orange-600" />}
                title="清掃サービス"
                desc="スタジオからご自宅まで、要件に合わせて丁寧にクリーニング。"
                to="/services?tab=clean"
                accent="text-orange-600"
              />
              <ServiceCard
                img="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600"
                icon={<Users className="h-7 w-7 text-orange-600" />}
                title="人材派遣ソリューション"
                desc="イベントや長期案件に最適な人材を柔軟にアサイン。"
                to="/services?tab=staff"
                accent="text-orange-600"
              />
            </div>
          </div>
        </section>

        {/* ===== About ===== */}
        <section id="about" className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                  Milesについて
                </h2>
                <p className="text-lg md:text-xl text-gray-600 mt-6 leading-relaxed">
                  認証済みプロフェッショナルと最短数分でマッチング。透明な価格とスムーズな体験を提供します。
                </p>

                <div className="mt-8 space-y-5">
                  <AboutPoint
                    icon={<Shield className="h-6 w-6 text-orange-600" />}
                    title="認証済みプロフェッショナル"
                    desc="厳格な審査を通過した専門家のみが在籍。"
                  />
                  <AboutPoint
                    icon={<Clock className="h-6 w-6 text-orange-600" />}
                    title="迅速なマッチング"
                    desc="半径50km・近い順で7分間隔の順次通知。"
                  />
                  <AboutPoint
                    icon={<Star className="h-6 w-6 text-orange-600" />}
                    title="品質保証"
                    desc="平均評価4.9/5の高品質サービス。"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="プロフェッショナルサービス"
                    className="w-full h-[460px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== How It Works ===== */}
        <section id="how-it-works" className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                ご利用の流れ
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
                シンプルなプロセスで、最適なプロとすぐ繋がります。
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'サービスを選択', description: '必要なサービスの種類を選ぶ' },
                { step: '2', title: 'プランを選択', description: '透明な価格のプランから選択' },
                { step: '3', title: '詳細を送信', description: '場所・日付・要件を入力' },
                { step: '4', title: 'マッチング', description: '近隣のプロに順次通知→OKで確定' },
              ].map((item, idx) => (
                <div key={idx} className="text-center relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-500 text-white rounded-2xl flex items-center justify-center text-2xl font-extrabold mx-auto mb-4 md:mb-6 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold">{item.title}</h3>
                  <p className="text-gray-600 mt-2 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                よくある質問
              </h2>
            </div>

            <div className="space-y-6 md:space-y-8">
              {[
                {
                  q: 'どのくらい早くマッチングできますか？',
                  a: '自動マッチングにより最短数分。各候補へ7分間隔で通知し、最初にOKした人で確定します。',
                },
                {
                  q: 'プロは認証されていますか？',
                  a: 'はい。バックグラウンドチェックとポートフォリオ審査を通過したプロのみ参加しています。',
                },
                {
                  q: 'スケジュール変更は可能ですか？',
                  a: 'マッチしたプロへ直接連絡、またはサポートへご依頼ください。',
                },
                {
                  q: '価格はどこで確認できますか？',
                  a: 'サービス選択後、プラン画面で事前に正確な料金を表示します。',
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 hover:shadow-lg transition"
                >
                  <h3 className="text-lg md:text-xl font-bold">{f.q}</h3>
                  <p className="text-gray-600 mt-2 md:mt-3 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Contact ===== */}
        <section id="contact" className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              お問い合わせ
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mt-4 md:mt-6">
              ご質問やサポートはお気軽にご連絡ください。
            </p>

            <div className="mt-10 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div>
                  <h3 className="text-xl font-bold mb-4">お問い合わせ先</h3>
                  <p className="text-gray-700 mb-2">Email: support@miles.com</p>
                  <p className="text-gray-700 mb-2">Phone: +81-3-1234-5678</p>
                  <p className="text-gray-700">営業時間: 9:00 - 18:00 JST</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">営業時間</h3>
                  <p className="text-gray-700">月〜金: 9:00 - 18:00</p>
                  <p className="text-gray-700">土: 10:00 - 16:00</p>
                  <p className="text-gray-700">日: 休業</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </span>
            <span className="text-3xl font-extrabold text-orange-500">Miles</span>
          </div>
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Miles. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ====== Sub components ====== */
function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <div className="text-3xl md:text-4xl font-extrabold text-gray-900">{value}</div>
      <div className="text-gray-600 mt-1">{label}</div>
    </div>
  );
}

function ServiceCard({
  img,
  icon,
  title,
  desc,
  to,
  accent = 'text-orange-600',
}: {
  img: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  to: string;
  accent?: string;
}) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-56 md:h-64 overflow-hidden">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-5 left-5 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
          {icon}
        </div>
      </div>
      <div className="p-6 md:p-8">
        <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">{title}</h3>
        <p className="text-gray-600 mt-3 leading-relaxed">{desc}</p>
        <div className={`mt-5 inline-flex items-center font-semibold ${accent}`}>
          <span>詳細を見る</span>
          <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function AboutPoint({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="font-bold text-gray-900">{title}</div>
        <div className="text-gray-600">{desc}</div>
      </div>
    </div>
  );
}
