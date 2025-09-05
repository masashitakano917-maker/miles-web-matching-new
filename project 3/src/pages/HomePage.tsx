import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Sparkles, Users, ArrowRight, CheckCircle, Star, Play, Award, Clock, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"></div>
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop" 
            alt="プロフェッショナルサービス" 
            className="absolute inset-0 bg-black bg-opacity-40"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-white">
              プロフェッショナル
              <span className="block text-yellow-300">サービスと繋がる</span>
            </h1>
            <p className="text-xl md:text-2xl text-white mb-12 leading-relaxed max-w-4xl mx-auto">
              質の高いプロフェッショナルと迅速なマッチング、信頼できる結果。
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center bg-orange-500 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-orange-600 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
              >
                今すぐ始める
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
              <button className="inline-flex items-center justify-center border-3 border-white text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-white hover:text-orange-600 transition-all duration-300">
                <Play className="mr-3 h-6 w-6" />
                デモを見
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">1000+</div>
              <div className="text-gray-600">認証済みプロ</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">5000+</div>
              <div className="text-gray-600">完了プロジェクト</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">7分</div>
              <div className="text-gray-600">平均マッチング時間</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">4.9</div>
              <div className="text-gray-600">平均評価</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="experiences" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              プロフェッショナルサービス
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              あなたのニーズに合わせた高品質なサービスを提供します
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="写真撮影" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-6 left-6 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Camera className="h-7 w-7 text-orange-600" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">プロフェッショナル写真撮影</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  熟練したプロフェッショナルによる不動産、料理、ビジネスポートレート、ウェディング写真撮影。
                </p>
                <div className="flex items-center text-orange-600 font-semibold">
                  <span>詳細を見る</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>

            <div className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="清掃サービス" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-6 left-6 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-7 w-7 text-green-600" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">清掃サービス</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  あなたの空間要件に合わせたスタジオおよび住宅清掃サービス。
                </p>
                <div className="flex items-center text-green-600 font-semibold">
                  <span>詳細を見る</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>

            <div className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="人材派遣" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-6 left-6 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-7 w-7 text-purple-600" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">人材派遣ソリューション</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  イベント、プロジェクト、継続的なビジネスニーズのためのプロフェッショナル人材派遣サービス。
                </p>
                <div className="flex items-center text-purple-600 font-semibold">
                  <span>詳細を見る</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Milesについて
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                私たちは、優れたサービスを提供する認証済みのプロフェッショナルとあなたを繋げます。私たちのプラットフォームは、品質、信頼性、シームレスな体験を保証します。
              </p>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">認証済みプロフェッショナル</h4>
                    <p className="text-gray-600">厳格な審査を通過した信頼できる専門家のみ</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">迅速なマッチング</h4>
                    <p className="text-gray-600">7分以内に最適なプロフェッショナルと繋がります</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Star className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">品質保証</h4>
                    <p className="text-gray-600">満足度4.9/5の高品質サービス</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  alt="プロフェッショナルサービス" 
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 to-transparent"></div>
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center space-x-3">
            
                  <div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ご利用の流れ
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              私たちの合理化されたプロセスで、数分で適切なプロフェッショナルと繋がります。
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'サービスを選択', description: '必要なプロフェッショナルサービスの種類を選択' },
              { step: '2', title: 'プランを選択', description: '透明な価格設定オプションから選択' },
              { step: '3', title: '詳細を送信', description: '場所、日付、具体的な要件を提供' },
              { step: '4', title: 'マッチング', description: '最適な近隣のプロフェッショナルと繋げます' }
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="w-20 h-20 bg-orange-500 text-white rounded-3xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-xl">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{item.description}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <ArrowRight className="h-6 w-6 text-orange-300 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              よくある質問
            </h2>
          </div>

          <div className="space-y-8">
            {[
              {
                question: 'どのくらい早くプロフェッショナルとマッチングできますか？',
                answer: '自動マッチングシステムにより、7分以内に近隣のプロフェッショナルと繋がります。各プロフェッショナルは7分以内に応答する必要があり、応答がない場合は次の候補者に移ります。'
              },
              {
                question: 'すべてのプロフェッショナルは認証済みですか？',
                answer: 'はい、プラットフォーム上のすべてのプロフェッショナルは、バックグラウンドチェックとポートフォリオレビューを含む徹底的な認証プロセスを経ています。'
              },
              {
                question: 'スケジュール変更が必要な場合はどうすればよいですか？',
                answer: 'マッチングしたプロフェッショナルに直接連絡するか、サポートチームにスケジュール変更の支援を求めることができます。'
              },
              {
                question: '価格はどのように決定されますか？',
                answer: '価格はサービスの種類と範囲に基づいて透明で固定されています。注文を確定する前に正確な費用を知ることができます。'
              }
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{item.question}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            お問い合わせ
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            ご質問やサポートが必要ですか？お気軽にお問い合わせください。
          </p>
          <div className="bg-white rounded-3xl p-12 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">お問い合わせ</h3>
                <p className="text-gray-600 mb-4 text-lg">Email: support@miles.com</p>
                <p className="text-gray-600 mb-4 text-lg">Phone: +81-3-1234-5678</p>
                <p className="text-gray-600 text-lg">営業時間: 9:00 AM - 6:00 PM JST</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">営業時間</h3>
                <p className="text-gray-600 mb-3 text-lg">月曜日 - 金曜日: 9:00 AM - 6:00 PM</p>
                <p className="text-gray-600 mb-3 text-lg">土曜日: 10:00 AM - 4:00 PM</p>
                <p className="text-gray-600 text-lg">日曜日: 休業</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <span className="text-4xl font-bold text-orange-500">Miles</span>
          </div>
          <div className="text-center text-gray-600">
            <p className="text-lg">&copy; 2025 Miles. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}