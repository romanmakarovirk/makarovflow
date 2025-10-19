import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Star, CreditCard, Wallet, X, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useStore } from '../../store/useStore';
import { haptic, webApp } from '../../utils/telegram';

const PremiumModal = ({ isOpen, onClose }) => {
  const { showToast } = useStore();
  const [selectedMethod, setSelectedMethod] = useState('stars');

  const features = [
    { icon: '🤖', text: 'AI анализ настроения и советы' },
    { icon: '📊', text: 'Расширенная аналитика' },
    { icon: '🎨', text: 'Эксклюзивные темы оформления' },
    { icon: '☁️', text: 'Облачное хранение данных' },
    { icon: '📈', text: 'Прогнозы и рекомендации' },
    { icon: '🔔', text: 'Умные напоминания' }
  ];

  const paymentMethods = [
    {
      id: 'stars',
      name: 'Telegram Stars',
      icon: Star,
      price: '99 ⭐',
      description: 'Самый простой способ',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'card',
      name: 'Банковская карта',
      icon: CreditCard,
      price: '199 ₽',
      description: 'Visa, Mastercard, МИР',
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 'sbp',
      name: 'СБП',
      icon: Wallet,
      price: '199 ₽',
      description: 'Быстрый платёж',
      color: 'from-orange-500 to-red-600'
    }
  ];

  const handlePayment = async () => {
    try {
      if (selectedMethod === 'stars') {
        // Telegram Stars payment
        haptic.medium();

        // Создаём invoice для Telegram Stars
        const invoice = {
          title: 'MakarovFlow Premium',
          description: 'Месячная подписка на Premium функции',
          payload: 'premium_monthly',
          provider_token: '', // Пустой для Stars
          currency: 'XTR', // Telegram Stars
          prices: [{ label: 'Premium подписка', amount: 99 }] // 99 Stars
        };

        // Открываем инвойс через Telegram WebApp API
        if (webApp.openInvoice) {
          webApp.openInvoice(invoice.url, (status) => {
            if (status === 'paid') {
              showToast('Premium активирован! 🎉', 'success');
              onClose();
            } else if (status === 'cancelled') {
              showToast('Оплата отменена', 'warning');
            } else {
              showToast('Ошибка оплаты', 'error');
            }
          });
        } else {
          showToast('Функция оплаты недоступна', 'warning');
        }
      } else if (selectedMethod === 'card' || selectedMethod === 'sbp') {
        // Пока заглушка для карт и СБП
        showToast('Скоро будет доступно', 'info');
      }
    } catch (error) {
      console.error('Payment error:', error);
      showToast('Ошибка оплаты', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Premium">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-600/20">
            <Crown className="text-yellow-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent mb-2">
            MakarovFlow Premium
          </h2>
          <p className="text-gray-400">Получи доступ ко всем функциям</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-xl"
            >
              <span className="text-2xl">{feature.icon}</span>
              <span className="text-xs text-gray-300">{feature.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Выбери способ оплаты:</h3>
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;

            return (
              <motion.button
                key={method.id}
                onClick={() => {
                  setSelectedMethod(method.id);
                  haptic.light();
                }}
                className={`w-full p-4 rounded-xl transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${method.color} shadow-lg scale-[1.02]`
                    : 'bg-gray-800 hover:bg-gray-750'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-gray-700'}`}>
                      <Icon size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{method.name}</p>
                      <p className="text-xs text-gray-400">{method.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{method.price}</p>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-5 h-5 bg-white rounded-full mt-1"
                      >
                        <Check size={14} className="text-green-600" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Purchase Button */}
        <Button
          onClick={handlePayment}
          variant="primary"
          fullWidth
          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
        >
          <Crown size={20} />
          Оформить Premium
        </Button>

        <p className="text-xs text-center text-gray-500">
          Подписка автоматически продлевается каждый месяц.
          <br />
          Можно отменить в любой момент.
        </p>
      </div>
    </Modal>
  );
};

export default PremiumModal;
