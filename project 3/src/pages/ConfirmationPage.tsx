import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, User, Mail, Phone, FileText } from 'lucide-react';

interface OrderData {
  planName: string;
  price: number;
  serviceType: string;
  planId: string;
  firstChoice: string;
  secondChoice: string;
  thirdChoice: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  otherInfo: string;
  clientName: string;
  phoneNumber: string;
  email: string;
  meetingPlace: string;
  specialRequests: string;
}

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedOrderData = localStorage.getItem('orderData');
    if (savedOrderData) {
      setOrderData(JSON.parse(savedOrderData));
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleConfirmOrder = async () => {
    if (!orderData) return;

    setIsSubmitting(true);

    // Create order object
    const order = {
      id: Date.now().toString(),
      customerName: orderData.clientName,
      service: orderData.serviceType,
      plan: orderData.planName,
      price: orderData.price,
      status: 'pending' as const,
      date: new Date().toLocaleDateString('ja-JP'),
      orderDetails: orderData
    };

    // Save to localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = [...existingOrders, order];
    localStorage.setItem('orders', JSON.stringify(updatedOrders));

    // Clear order data
    localStorage.removeItem('orderData');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    navigate('/dashboard');
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 mb-4 font-medium transition-colors duration-200"
          >
            ← Back to Order Form
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">注文内容確認</h1>
          <p className="text-gray-600">以下の内容で注文を確定しますか？</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {/* Plan Summary */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">選択プラン</h2>
            <div className="flex justify-between items-center">
              <span className="text-lg text-gray-700">{orderData.planName}</span>
              <span className="text-2xl font-bold text-blue-600">¥{orderData.price.toLocaleString()}</span>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Shooting Dates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>撮影希望日</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">第一候補:</span>
                  <span className="font-medium">{orderData.firstChoice}</span>
                </div>
                {orderData.secondChoice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">第二候補:</span>
                    <span className="font-medium">{orderData.secondChoice}</span>
                  </div>
                )}
                {orderData.thirdChoice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">第三候補:</span>
                    <span className="font-medium">{orderData.thirdChoice}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>撮影住所</span>
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600">郵便番号: </span>
                  <span className="font-medium">{orderData.postalCode}</span>
                </div>
                <div>
                  <span className="text-gray-600">住所: </span>
                  <span className="font-medium">
                    {orderData.prefecture}{orderData.city}{orderData.address}
                  </span>
                </div>
                {orderData.otherInfo && (
                  <div>
                    <span className="text-gray-600">その他情報: </span>
                    <span className="font-medium">{orderData.otherInfo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Client Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>発注者情報</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">氏名:</span>
                  <span className="font-medium">{orderData.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">電話番号:</span>
                  <span className="font-medium">{orderData.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">メール:</span>
                  <span className="font-medium">{orderData.email}</span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>追加情報</span>
              </h3>
              <div className="space-y-2">
                {orderData.meetingPlace && (
                  <div>
                    <span className="text-gray-600">集合場所: </span>
                    <span className="font-medium">{orderData.meetingPlace}</span>
                  </div>
                )}
                {orderData.specialRequests && (
                  <div>
                    <span className="text-gray-600">特記事項: </span>
                    <span className="font-medium">{orderData.specialRequests}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            修正する
          </button>
          <button
            onClick={handleConfirmOrder}
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>注文中...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>注文を確定する</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}