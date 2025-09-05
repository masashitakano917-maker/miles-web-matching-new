import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Sparkles, Users, ArrowRight, Check } from 'lucide-react';

export default function ServicePage() {
  const { serviceType } = useParams<{ serviceType: string }>();
  const navigate = useNavigate();

  const serviceData = {
    photography: {
      title: '写真撮影',
      icon: Camera,
      color: 'blue',
      services: [
        {
          id: 'real-estate',
          name: '不動産物件撮影',
          description: '物件の魅力を最大限に引き出す撮影',
          plans: [
            { id: 'basic', name: '20枚納品', price: 20000, deliverables: '20枚', extra: '追加カット1枚1000円' },
            { id: 'standard', name: '30枚納品', price: 29000, deliverables: '30枚', extra: '追加カット1枚1000円' },
            { id: 'premium', name: '40枚納品', price: 39000, deliverables: '40枚', extra: '追加カット1枚1000円' }
          ]
        },
        {
          id: 'food',
          name: 'Food撮影',
          description: '美味しさが伝わる料理写真',
          plans: [
            { id: 'basic', name: '10メニュー', price: 15000, deliverables: '10メニュー', extra: '1メニュー追加1000円' },
            { id: 'standard', name: '15メニュー', price: 22000, deliverables: '15メニュー', extra: '1メニュー追加1000円' },
            { id: 'premium', name: '20メニュー', price: 28000, deliverables: '20メニュー', extra: '1メニュー追加1000円' }
          ]
        },
        {
          id: 'business-portrait',
          name: 'ビジネスポートレート',
          description: 'プロフェッショナルな印象を与える写真',
          plans: [
            { id: 'basic', name: '20枚納品', price: 20000, deliverables: '20枚', extra: '追加カット1枚1000円' },
            { id: 'standard', name: '30枚納品', price: 29000, deliverables: '30枚', extra: '追加カット1枚1000円' },
            { id: 'premium', name: '40枚納品', price: 39000, deliverables: '40枚', extra: '追加カット1枚1000円' }
          ]
        },
        {
          id: 'wedding',
          name: 'ウエディング撮影',
          description: '特別な瞬間を美しく記録',
          plans: [
            { id: 'basic', name: '20枚納品', price: 20000, deliverables: '20枚', extra: '追加カット1枚1000円' },
            { id: 'standard', name: '30枚納品', price: 29000, deliverables: '30枚', extra: '追加カット1枚1000円' },
            { id: 'premium', name: '40枚納品', price: 39000, deliverables: '40枚', extra: '追加カット1枚1000円' }
          ]
        }
      ]
    },
    cleaning: {
      title: 'お掃除サービス',
      icon: Sparkles,
      color: 'green',
      services: [
        {
          id: 'studio',
          name: 'Studio',
          description: 'スタジオ専門の清掃サービス',
          plans: [
            { id: 'basic', name: '基本清掃', price: 15000, deliverables: '全体清掃', extra: '機材清掃オプション可能' },
            { id: 'deep', name: '徹底清掃', price: 25000, deliverables: '深部清掃', extra: '消毒・抗菌処理込み' }
          ]
        },
        {
          id: '1ldk',
          name: '1LDK',
          description: '一人暮らしに最適な清掃',
          plans: [
            { id: 'basic', name: '基本清掃', price: 12000, deliverables: '全室清掃', extra: 'キッチン・バス込み' },
            { id: 'deep', name: '徹底清掃', price: 18000, deliverables: '深部清掃', extra: 'エアコン清掃込み' }
          ]
        },
        {
          id: '2ldk',
          name: '2LDK',
          description: 'カップル・小家族向け清掃',
          plans: [
            { id: 'basic', name: '基本清掃', price: 18000, deliverables: '全室清掃', extra: 'キッチン・バス込み' },
            { id: 'deep', name: '徹底清掃', price: 26000, deliverables: '深部清掃', extra: 'エアコン清掃込み' }
          ]
        },
        {
          id: '3ldk',
          name: '3LDK',
          description: 'ファミリー向け清掃',
          plans: [
            { id: 'basic', name: '基本清掃', price: 24000, deliverables: '全室清掃', extra: 'キッチン・バス込み' },
            { id: 'deep', name: '徹底清掃', price: 35000, deliverables: '深部清掃', extra: 'エアコン清掃込み' }
          ]
        }
      ]
    },
    staffing: {
      title: '人材派遣',
      icon: Users,
      color: 'purple',
      services: [
        {
          id: 'event-staff',
          name: 'イベントスタッフ',
          description: 'イベント運営のプロフェッショナル',
          plans: [
            { id: 'hourly', name: '時間契約', price: 3000, deliverables: '1時間', extra: '最低4時間から' },
            { id: 'daily', name: '日契約', price: 20000, deliverables: '1日', extra: '8時間勤務' }
          ]
        }
      ]
    }
  };

  const currentService = serviceData[serviceType as keyof typeof serviceData];

  if (!currentService) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 mb-4 font-medium transition-colors duration-200"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center space-x-3 mb-4">
            <currentService.icon className={`h-8 w-8 text-${currentService.color}-600`} />
            <h1 className="text-3xl font-bold text-gray-900">{currentService.title}</h1>
          </div>
          <p className="text-gray-600">Choose the specific service you need and select a plan.</p>
        </div>

        <div className="grid gap-8">
          {currentService.services.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">{service.name}</h2>
                <p className="text-gray-600">{service.description}</p>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {service.plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                      onClick={() => navigate(`/order/${serviceType}/${service.id}-${plan.id}`)}
                    >
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          ¥{plan.price.toLocaleString()}
                        </div>
                        <p className="text-gray-600 mb-4">{plan.deliverables}</p>
                        <p className="text-sm text-gray-500 mb-6">{plan.extra}</p>
                        
                        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 group-hover:bg-blue-700 flex items-center justify-center space-x-2">
                          <span>Select Plan</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}