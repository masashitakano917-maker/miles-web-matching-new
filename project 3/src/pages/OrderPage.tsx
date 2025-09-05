import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, User, Mail, Phone, FileText } from 'lucide-react';

export default function OrderPage() {
  const { serviceType, planId } = useParams<{ serviceType: string; planId: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstChoice: '',
    secondChoice: '',
    thirdChoice: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    otherInfo: '',
    clientName: '',
    phoneNumber: '',
    email: '',
    meetingPlace: '',
    specialRequests: ''
  });

  // Mock plan data based on planId
  const getPlanDetails = () => {
    const planMap: { [key: string]: { name: string; price: number } } = {
      'real-estate-basic': { name: '不動産物件撮影 20枚納品', price: 20000 },
      'real-estate-standard': { name: '不動産物件撮影 30枚納品', price: 29000 },
      'real-estate-premium': { name: '不動産物件撮影 40枚納品', price: 39000 },
      'food-basic': { name: 'Food撮影 10メニュー', price: 15000 },
      'food-standard': { name: 'Food撮影 15メニュー', price: 22000 },
      'food-premium': { name: 'Food撮影 20メニュー', price: 28000 },
      // Add more mappings as needed
    };
    
    return planMap[planId || ''] || { name: 'Unknown Plan', price: 0 };
  };

  const planDetails = getPlanDetails();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store order data for confirmation page
    const orderData = {
      ...formData,
      planName: planDetails.name,
      price: planDetails.price,
      serviceType,
      planId
    };
    localStorage.setItem('orderData', JSON.stringify(orderData));
    navigate('/confirmation');
  };

  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(`/service/${serviceType}`)}
            className="text-blue-600 hover:text-blue-700 mb-4 font-medium transition-colors duration-200"
          >
            ← Back to Service Selection
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Form</h1>
          <p className="text-gray-600">Please provide your details to complete your order.</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Plan Summary */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Selected Plan</h2>
            <div className="flex justify-between items-center">
              <span className="text-lg text-gray-700">{planDetails.name}</span>
              <span className="text-2xl font-bold text-blue-600">¥{planDetails.price.toLocaleString()}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Shooting Dates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>撮影希望日</span>
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">第一候補</label>
                  <input
                    type="date"
                    required
                    value={formData.firstChoice}
                    onChange={(e) => setFormData({ ...formData, firstChoice: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">第二候補</label>
                  <input
                    type="date"
                    value={formData.secondChoice}
                    onChange={(e) => setFormData({ ...formData, secondChoice: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">第三候補</label>
                  <input
                    type="date"
                    value={formData.thirdChoice}
                    onChange={(e) => setFormData({ ...formData, thirdChoice: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>撮影住所</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">郵便番号</label>
                  <input
                    type="text"
                    required
                    placeholder="123-4567"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">都道府県</label>
                  <select
                    required
                    value={formData.prefecture}
                    onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="">選択してください</option>
                    {prefectures.map((pref) => (
                      <option key={pref} value={pref}>{pref}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">市区町村</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">それ以降</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">その他情報</label>
                <textarea
                  rows={3}
                  value={formData.otherInfo}
                  onChange={(e) => setFormData({ ...formData, otherInfo: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="建物の特徴、アクセス方法など"
                />
              </div>
            </div>

            {/* Client Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>発注者情報</span>
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">発注者氏名</label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">集合場所</label>
                <input
                  type="text"
                  value={formData.meetingPlace}
                  onChange={(e) => setFormData({ ...formData, meetingPlace: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="建物のエントランス、駐車場など"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">撮影に関する特記事項</label>
                <textarea
                  rows={4}
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="特別な要望、注意事項など"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-blue-600 text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                発注内容を確認
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}