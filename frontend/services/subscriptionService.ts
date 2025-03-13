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
  iyzico_payment_id: string | null;
  iyzico_payment_transaction_id: string | null;
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
  is_active: true
};

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

  // Create a subscription with Iyzico
  createSubscription: async (planId: string, isYearly: boolean, cardToken?: string) => {
    try {
      // Get the selected language from localStorage
      const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
      
      const response = await api.post('/api/subscriptions/subscriptions/create_subscription/', {
        plan_id: planId,
        period: isYearly ? 'yearly' : 'monthly',
        card_token: cardToken
      }, {
        headers: {
          'Accept-Language': selectedLanguage
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Process payment with Iyzico (simulation for demo)
  processPayment: async (planId: string, isYearly: boolean): Promise<{ success: boolean, cardToken?: string }> => {
    try {
      // In a real implementation, this would integrate with Iyzico's payment system
      // For demo purposes, we're simulating a successful payment
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful payment with a fake card token
      const cardToken = `iyzico_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      return {
        success: true,
        cardToken: cardToken
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      return { success: false };
    }
  },

  // Get user's current subscription
  getCurrentSubscription: async (): Promise<UserSubscription | null> => {
    try {
      // Get the selected language from localStorage
      const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
      
      const response = await api.get('/api/subscriptions/subscriptions/current/', {
        headers: {
          'Accept-Language': selectedLanguage
        }
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error('Error fetching current subscription:', error);
      throw error;
    }
  },

  // Get subscription payment history
  getPaymentHistory: async (): Promise<PaymentHistory[]> => {
    try {
      // Get the selected language from localStorage
      const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
      
      const response = await api.get('/api/subscriptions/payment-history/', {
        headers: {
          'Accept-Language': selectedLanguage
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId?: number) => {
    try {
      const response = await api.post('/api/subscriptions/subscriptions/cancel_subscription/', {
        subscription_id: subscriptionId
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },

  // Update subscription
  updateSubscription: async (planId: string, isYearly: boolean, cardToken?: string) => {
    try {
      // Get the selected language from localStorage
      const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
      
      const response = await api.post('/api/subscriptions/subscriptions/update_card/', {
        plan_id: planId,
        period: isYearly ? 'yearly' : 'monthly',
        card_token: cardToken
      }, {
        headers: {
          'Accept-Language': selectedLanguage
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
};

export default subscriptionService; 