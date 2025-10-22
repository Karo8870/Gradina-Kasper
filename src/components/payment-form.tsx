'use client';

import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { useBasketContext } from '@/lib/providers/basket-provider';
import { getUserProfileAction } from '@/lib/actions/auth-actions';
import { calculateBasketTotalAction } from '@/lib/actions/basket-actions';
import { createOrderAndInitiatePayment } from '@/lib/actions/payment-actions';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Card bancar',
    description: 'Visa, Mastercard, American Express',
    icon: 'fa-credit-card',
    available: true
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    description: 'Plată rapidă cu Google Pay',
    icon: 'fa-google',
    available: true
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    description: 'Plată rapidă cu Apple Pay',
    icon: 'fa-apple',
    available: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Plată cu cont PayPal',
    icon: 'fa-paypal',
    available: true
  }
];

export default function PaymentForm() {
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [basketTotal, setBasketTotal] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { basket } = useBasketContext();

  // Load user profile and calculate basket total
  useEffect(() => {
    const loadData = async () => {
      // Load user profile
      const profile = await getUserProfileAction();
      setUserProfile(profile);

      // Calculate basket total
      if (basket.length > 0) {
        const result = await calculateBasketTotalAction(basket);
        setBasketTotal(result.total);
      } else {
        setBasketTotal(0);
      }
    };

    loadData();
  }, [basket]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!userProfile) {
      alert('Nu s-au putut încărca datele utilizatorului. Vă rugăm să vă reconectați.');
      return;
    }

    if (basketTotal <= 0) {
      alert('Coșul este gol sau calculul sumei a eșuat.');
      return;
    }

    try {
      setIsProcessing(true);

      // Prepare order data
      const orderData = {
        products: basket,
        userData: {
          afm: userProfile.afm || '',
          countyID: userProfile.countyID || 1,
          district: userProfile.district || '',
          phone1: userProfile.phone || '',
          phone2: userProfile.phone2 || '',
          fax: userProfile.fax || '',
          email: userProfile.email,
          name: `${userProfile.firstName} ${userProfile.lastName}`,
          address: userProfile.address || '',
          zip: userProfile.zip || ''
        }
      };

      // Create order and start payment using server action
      const result = await createOrderAndInitiatePayment(
        orderData.products,
        orderData.userData,
        selectedMethod
      );

      if (!result.success) {
        console.log(result.error);
        alert(`Eroare la procesarea comenzii: ${result.error}`);
        return;
      }

      // If we have a payment URL, redirect to Netopia payment page
      if (result.paymentURL) {
        console.log('Redirecting to Netopia payment page:', result.paymentURL);
        window.location.href = result.paymentURL;
        return;
      }

      // If no payment URL, something went wrong
      alert('Nu s-a putut inițializa plata. Încercați din nou.');

    } catch (error) {
      console.error('Payment error:', error);
      alert('A apărut o eroare la inițializarea plății. Încercați din nou.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <i className="fa fa-spinner fa-spin text-2xl text-primary-500 mb-4" />
          <p>Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Order Summary */}
      {basketTotal > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-900">Total comandă:</span>
            <span className="text-xl font-bold text-primary-600">
              {basketTotal.toFixed(2)} RON
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {basket.length} {basket.length === 1 ? 'produs' : 'produse'} în coș
          </div>
        </div>
      )}

      {/* Payment Button */}
      <Button
        type="submit"
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        disabled={isProcessing || basketTotal <= 0}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <i className="fa fa-spinner fa-spin" />
            <span>Se procesează...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <i className="fa fa-credit-card" />
            <span>Plătește acum - {basketTotal.toFixed(2)} RON</span>
          </div>
        )}
      </Button>

      {basketTotal <= 0 && (
        <p className="text-sm text-gray-500 text-center">
          Adaugă produse în coș pentru a continua
        </p>
      )}
    </form>
  );
}