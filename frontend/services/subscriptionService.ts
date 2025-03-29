import api from './axios';

// Define subscription plan features as keys
export interface PlanFeature {
  key: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: string;
  plan_id: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  plan_type: string;
  currency: string;
  features: Record<string, boolean>; // Features as keys with boolean values
  is_active: boolean;
  paddle_product_id?: string;
  paddle_price_id?: string;
}

export interface UserSubscription {
  id: number;
  plan: SubscriptionPlan;
  status: string;
  period: string;
  start_date: string;
  end_date: string;
  trial_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: number;
  subscription: number;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_date: string;
  paddle_payment_id: string | null;
  paddle_checkout_id: string | null;
}

// Default subscription plan for when API fails
export const DEFAULT_SUBSCRIPTION_PLAN: SubscriptionPlan = {
  id: '1',
  plan_id: 'premium',
  name: 'pricing.premium.title',
  description: 'pricing.premium.description',
  price_monthly: 2,
  price_yearly: 20,
  plan_type: 'premium',
  currency: 'USD',
  features: {
    'feature.basicCvTemplates': true,
    'feature.videoCV': true,
    'feature.aiAssistant': true,
    'feature.unlimitedCvs': true,
  },
  is_active: true,
  paddle_product_id: 'pro_01jpfc9498chc8f3gxw8az5ywc',
  paddle_price_id: 'pri_01jpfcexy9qjyv2m7p040x1hye'
};

// Call initialization on import - this will be handled by the usePaddle hook in components
// that need Paddle functionality

// Subscription service functions
const subscriptionService = {
  // Get all subscription plans
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    try {
      // Get the selected language from localStorage
      const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
      
      // Set Accept-Language header
      const response = await api.get('/api/subscriptions/plans/', {
        headers: {
          'Accept-Language': selectedLanguage
        }
      });
      
      // Transform the response to ensure description uses translation key
      const plans = response.data.map((plan: SubscriptionPlan) => ({
        ...plan,
        name: 'pricing.premium.title',
        description: 'pricing.premium.description'
      }));
      
      return plans;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      // Return default plan if API fails
      return [DEFAULT_SUBSCRIPTION_PLAN];
    }
  },

  // Create a subscription with Paddle
  createSubscription: async (planId: string, isYearly: boolean) => {
    try {
      // Get the selected language from localStorage
      const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
      
      // Call our backend to start the subscription process
      const response = await api.post('/api/subscriptions/subscriptions/create_subscription/', {
        plan_id: planId,
        period: isYearly ? 'yearly' : 'monthly',
      }, {
        headers: {
          'Accept-Language': selectedLanguage
        }
      });
      
      // Return the checkout URL and subscription data
      return {
        checkout_url: response.data.checkout_url,
        subscription_id: response.data.subscription_id,
        passthrough: response.data.passthrough,
        checkout_id: response.data.checkout_id,
        price_id: response.data.price_id,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Open Paddle checkout - this is now simplified and will use the usePaddle hook
  // in components that need checkout functionality
  openPaddleCheckout: async (checkoutData: { 
    checkout_url: string, 
    price_id?: string, 
  }): Promise<boolean> => {
    try {
      // If there's no price_id, just open the checkout URL directly
      if (!checkoutData.price_id && checkoutData.checkout_url) {
        window.open(checkoutData.checkout_url, '_blank');
        return true;
      }
      
      // Otherwise, the component will use the usePaddle hook to open the checkout
      // This is just a fallback method
      return false;
    } catch (error) {
      console.error('Error in openPaddleCheckout fallback:', error);
      
      // Fallback to redirect method
      if (checkoutData.checkout_url) {
        window.open(checkoutData.checkout_url, '_blank');
        return true;
      }
      return false;
    }
  },

  // Get user's current subscription
  getCurrentSubscription: async (): Promise<UserSubscription | null | any> => {
    try {
      // Get the selected language from localStorage
      const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
      
      const response = await api.get('/api/subscriptions/current/', {
        headers: {
          'Accept-Language': selectedLanguage
        }
      });
      
      // Return the data as is, even if it has status: 'no_subscription'
      return response.data;
    } catch (error: any) {
      // If it's a 404 error, return null to indicate no subscription
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error('Error fetching current subscription:', error);
      throw error;
    }
  },

  // Get Paddle customer portal URL
  getCustomerPortalUrl: async (): Promise<string | { portal_url: string, sandbox_mode?: boolean, error?: string } | null> => {
    try {
      const response = await api.get('/api/subscriptions/subscriptions/customer_portal/');
      
      // API sandbox modundayken farklı bir yanıt formatı dönebilir
      if (response.data.sandbox_mode) {
        return {
          portal_url: response.data.portal_url,
          sandbox_mode: true,
          error: response.data.error
        };
      }
      
      return response.data.portal_url;
    } catch (error: any) {
      console.error('Error getting customer portal URL:', error);
      
      // Sandbox URL'si varsa onu döndür
      if (error.response?.data?.sandbox_mode && error.response?.data?.portal_url) {
        return {
          portal_url: error.response.data.portal_url,
          sandbox_mode: true,
          error: error.response.data.error || 'Error getting customer portal URL'
        };
      }
      
      return null;
    }
  },

  // Cancel subscription
  cancelSubscription: async () => {
    try {
      const response = await api.post('/api/subscriptions/subscriptions/cancel_subscription/', {});
      return response.data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },

  // Get URL to update payment method
  getUpdatePaymentMethodUrl: async () => {
    try {
      const response = await api.post('/api/subscriptions/subscriptions/update_payment_method/', {});
      return response.data.update_url;
    } catch (error) {
      console.error('Error getting update payment URL:', error);
      throw error;
    }
  }
};

export default subscriptionService; 