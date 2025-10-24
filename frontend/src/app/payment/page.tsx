"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CampaignAPI } from "@/lib/api";
import Swal from "sweetalert2";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  
  const amount = searchParams.get('amount') || '10';
  const type = searchParams.get('type') || 'campaign';
  const duration = searchParams.get('duration') || '1';

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  const createCampaignAfterPayment = async () => {
    try {
      // Get stored form data
      const storedFormData = sessionStorage.getItem('campaignFormData');
      const hasFile = sessionStorage.getItem('selectedFile') === 'true';
      
      if (!storedFormData) {
        throw new Error('Campaign form data not found');
      }

      const formData = JSON.parse(storedFormData);
      console.log('Creating campaign with stored data:', formData);

      // Create FormData for API call
      const apiFormData = new FormData();
      apiFormData.append("title", formData.title);
      apiFormData.append("description", formData.description);
      apiFormData.append("goal_amount", formData.goal_amount.toString());
      apiFormData.append("duration_months", formData.duration_months);
      apiFormData.append("category", formData.category || "");
      apiFormData.append("story", formData.story || "");
      apiFormData.append("video_url", formData.video_url || "");
      
      // Handle file upload
      if (hasFile) {
        const fileData = sessionStorage.getItem('campaignFileData');
        const fileName = sessionStorage.getItem('campaignFileName');
        
        if (fileData && fileName) {
          // Convert base64 back to file
          const response = await fetch(fileData);
          const blob = await response.blob();
          const file = new File([blob], fileName, { type: blob.type });
          apiFormData.append("image_file", file);
        }
      } else if (formData.image_url) {
        apiFormData.append("image_url", formData.image_url);
      }

      // Create campaign using API
      const response = await CampaignAPI.createWithImage(apiFormData, token as string);
      console.log('Campaign created successfully:', response);

      // Clear stored data
      sessionStorage.removeItem('campaignFormData');
      sessionStorage.removeItem('selectedFile');
      sessionStorage.removeItem('campaignFileData');
      sessionStorage.removeItem('campaignFileName');

      return response;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  };

  const handlePayment = async (method: 'paypal' | 'square') => {
    if (!selectedMethod) {
      Swal.fire({
        title: 'Select Payment Method',
        text: 'Please select a payment method to continue.',
        icon: 'warning',
        customClass: {
          popup: 'swal2-popup-custom'
        }
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create campaign after successful payment
      const campaign = await createCampaignAfterPayment();
      
      // Show success message
      Swal.fire({
        title: 'Payment Successful!',
        html: `
          <div class="text-left">
            <p class="mb-4">Your campaign "<strong>${campaign.title}</strong>" has been created and is now in <strong>draft status</strong>.</p>
            <div class="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 class="font-semibold text-blue-900 mb-2">Next Steps:</h4>
              <ol class="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Refer 5 friends to get your campaign approved</li>
                <li>Share your referral links with friends and family</li>
                <li>Once 5 referrals are accepted, your campaign will go to admin for approval</li>
                <li>Your campaign will become active after admin approval</li>
              </ol>
            </div>
            <p class="text-sm text-gray-600">You can track your referral progress in the referrals section.</p>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'Continue to Referrals',
        customClass: {
          popup: 'swal2-popup-custom',
          confirmButton: 'swal2-confirm'
        }
      }).then(() => {
        router.push('/referrals');
      });
      
    } catch (error) {
      console.error('Payment/Campaign creation failed:', error);
      
      // Try to parse error message for better user feedback
      let errorMessage = 'There was an error processing your payment or creating your campaign. Please try again.';
      
      if (error instanceof Error) {
        try {
          // Try to parse JSON error response
          const errorData = JSON.parse(error.message);
          if (errorData.error && errorData.error.includes('validation error')) {
            errorMessage = 'Please check your campaign details and make sure all fields meet the requirements.';
          } else {
            errorMessage = error.message;
          }
        } catch {
          // If not JSON, use the error message as is
          errorMessage = error.message;
        }
      }
      
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        customClass: {
          popup: 'swal2-popup-custom'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00AFF0] to-[#0099D6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in required</h1>
          <p className="text-gray-600 mb-6">Please sign in to complete your payment.</p>
          <button className="btn-primary w-full" onClick={() => router.push("/signin")}>Sign in</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00AFF0] to-[#0099D6]">
      <div className="max-w-7xl mx-auto px-2 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-16 hover:shadow-xl transition-all duration-300">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Payment</h1>
            <p className="text-gray-600">Choose your preferred payment method to continue</p>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Campaign Duration:</span>
                <span className="font-semibold">{duration} month{duration !== '1' ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Fee:</span>
                <span className="font-semibold">$10/month</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-[#00AFF0] border-t pt-2">
                <span>Total Amount:</span>
                <span>${amount}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Payment Method</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* PayPal */}
              <div 
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  selectedMethod === 'paypal' 
                    ? 'border-[#00AFF0] bg-blue-50' 
                    : 'border-gray-300 hover:border-[#00AFF0] hover:bg-blue-50'
                }`}
                onClick={() => setSelectedMethod('paypal')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#0070BA] rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 16">
                        <rect width="24" height="16" rx="2" fill="white"/>
                        <rect x="0" y="0" width="24" height="2" fill="#1A1F71"/>
                        <rect x="0" y="14" width="24" height="2" fill="#F7A600"/>
                        <text x="12" y="10" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1A1F71">VISA</text>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">PayPal</h3>
                      <p className="text-sm text-gray-600">Pay with your PayPal account</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 ${
                    selectedMethod === 'paypal' 
                      ? 'border-[#00AFF0] bg-[#00AFF0]' 
                      : 'border-gray-300'
                  }`}>
                    {selectedMethod === 'paypal' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>✓ Secure payment processing</p>
                  <p>✓ Buyer protection included</p>
                  <p>✓ Instant confirmation</p>
                </div>
              </div>

              {/* Square */}
              <div 
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  selectedMethod === 'square' 
                    ? 'border-[#00AFF0] bg-blue-50' 
                    : 'border-gray-300 hover:border-[#00AFF0] hover:bg-blue-50'
                }`}
                onClick={() => setSelectedMethod('square')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#3E3E3E] rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 16">
                        <rect width="24" height="16" rx="2" fill="white"/>
                        <rect x="4" y="4" width="16" height="8" rx="1" fill="#3E3E3E"/>
                        <rect x="6" y="6" width="12" height="4" rx="0.5" fill="white"/>
                        <rect x="8" y="8" width="8" height="0.5" fill="#3E3E3E"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Square</h3>
                      <p className="text-sm text-gray-600">Pay with Square payment</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 ${
                    selectedMethod === 'square' 
                      ? 'border-[#00AFF0] bg-[#00AFF0]' 
                      : 'border-gray-300'
                  }`}>
                    {selectedMethod === 'square' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>✓ Fast and secure</p>
                  <p>✓ Multiple payment options</p>
                  <p>✓ Real-time processing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:scale-105 hover:shadow-md transition-all duration-200"
            >
              Back to Campaign
            </button>
            <button
              onClick={() => handlePayment('paypal')}
              disabled={loading || selectedMethod !== 'paypal'}
              className="flex-1 bg-[#0070BA] hover:bg-[#005EA6] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {loading ? 'Processing...' : 'Pay with PayPal'}
            </button>
            <button
              onClick={() => handlePayment('square')}
              disabled={loading || selectedMethod !== 'square'}
              className="flex-1 bg-[#3E3E3E] hover:bg-[#2A2A2A] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {loading ? 'Processing...' : 'Pay with Square'}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-800">
                <strong>Secure Payment:</strong> Your payment information is encrypted and secure. 
                We use industry-standard security measures to protect your data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
