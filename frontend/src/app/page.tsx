"use client";
import React from "react";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-green-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Need Funds For Your <span className="text-[#00AFF0]">Student Goals</span>?
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Raise money for education, projects, and dreams with the support of your community.
              </p>
              <Link 
                href="/create-campaign"
                className="inline-block bg-[#00AFF0] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0099D6] transition-colors"
              >
                Start a Free Fundraiser
              </Link>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#00AFF0] bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-[#00AFF0] font-bold">🎓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Education Fund</h3>
                    <p className="text-sm text-gray-600">STUDENT</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>$2,500 raised</span>
                    <span>Goal $5,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#00AFF0] h-2 rounded-full" style={{width: '50%'}}></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">50% Funded</div>
                  <div className="text-sm text-gray-600">127 supporters</div>
                </div>
              </div>
          </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00AFF0] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#00AFF0] text-xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">0% Platform Fee</h3>
              <p className="text-sm text-gray-600">Keep 100% of donations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00AFF0] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#00AFF0] text-xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Disbursal</h3>
              <p className="text-sm text-gray-600">Fast fund transfers</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00AFF0] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#00AFF0] text-xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">10,000+ Students</h3>
              <p className="text-sm text-gray-600">Successfully funded</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00AFF0] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#00AFF0] text-xl">💝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">$2M+ Raised</h3>
              <p className="text-sm text-gray-600">Total impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                You can Choose Student Fundraising with FundRise if
              </h2>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-[#00AFF0] bg-opacity-10 rounded-full flex items-center justify-center mr-3">
                    <span className="text-[#00AFF0] text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">You need funds for education or projects</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-[#00AFF0] bg-opacity-10 rounded-full flex items-center justify-center mr-3">
                    <span className="text-[#00AFF0] text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">You have limited financial resources</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-[#00AFF0] bg-opacity-10 rounded-full flex items-center justify-center mr-3">
                    <span className="text-[#00AFF0] text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Scholarships and grants are not enough</span>
                </li>
              </ul>
              <p className="text-gray-600 mb-6">
                Get financial support for your educational goals by raising funds with the help of donors, family, and friends online.
              </p>
              <button className="border-2 border-[#00AFF0] text-[#00AFF0] px-6 py-3 rounded-lg font-semibold hover:bg-[#00AFF0] hover:text-white transition-colors">
                GET A CALLBACK
              </button>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-auto">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-[#00AFF0] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Education Fund</h3>
                  <p className="text-sm text-gray-600">STUDENT</p>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>$4,900 raised</span>
                    <span>Goal $10,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#00AFF0] h-2 rounded-full" style={{width: '49%'}}></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">49% Funded</div>
                  <div className="text-sm text-gray-600">89 supporters</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Raise Funds For Your Student Goals
            </h2>
            <p className="text-xl text-gray-600">
              Get financial support for education, projects, and dreams with online fundraising.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#00AFF0] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-[#00AFF0] text-xl">🎓</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tuition Fees</h3>
              <p className="text-gray-600 mb-4">Raise funds for college tuition and educational expenses</p>
              <div className="text-sm text-[#00AFF0] font-semibold">Max Raised: $25,000</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#00AFF0] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-[#00AFF0] text-xl">🔬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Research Projects</h3>
              <p className="text-gray-600 mb-4">Fund your academic research and scientific projects</p>
              <div className="text-sm text-[#00AFF0] font-semibold">Max Raised: $15,000</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#00AFF0] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-[#00AFF0] text-xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Study Abroad</h3>
              <p className="text-gray-600 mb-4">Support international education and exchange programs</p>
              <div className="text-sm text-[#00AFF0] font-semibold">Max Raised: $30,000</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#00AFF0] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-[#00AFF0] text-xl">💻</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tech Equipment</h3>
              <p className="text-gray-600 mb-4">Fund laptops, software, and technology needs</p>
              <div className="text-sm text-[#00AFF0] font-semibold">Max Raised: $8,000</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#00AFF0] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-[#00AFF0] text-xl">🏃</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sports & Activities</h3>
              <p className="text-gray-600 mb-4">Support athletic programs and extracurricular activities</p>
              <div className="text-sm text-[#00AFF0] font-semibold">Max Raised: $12,000</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#00AFF0] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-[#00AFF0] text-xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Creative Projects</h3>
              <p className="text-gray-600 mb-4">Fund art, music, and creative student projects</p>
              <div className="text-sm text-[#00AFF0] font-semibold">Max Raised: $6,000</div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Magnet */}
      <section className="py-12 bg-[#00AFF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-lg">📚</span>
              </div>
              <span className="text-white text-lg font-medium">
                Unlock the secrets of student fundraising - Get your free guide now!
              </span>
            </div>
            <button className="bg-white text-[#00AFF0] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Download Now
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How does Student Fundraising on FundRise work?
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to get the support you need for your educational goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00AFF0] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Start a free fundraiser</h3>
              <p className="text-gray-600">Create your campaign by filling in all the relevant details about your educational goals and funding needs.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00AFF0] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Share Your Fundraiser</h3>
              <p className="text-gray-600">Share your fundraiser with friends, family, and your network to raise funds quickly and effectively.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00AFF0] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Withdraw All Donations</h3>
              <p className="text-gray-600">Withdraw all the money you receive at any point in your fundraising journey to support your education.</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-8">
              Your fundraising journey is successful! We wish you success in your educational pursuits!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/create-campaign"
                className="bg-[#00AFF0] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0099D6] transition-colors"
              >
                START A FREE FUNDRAISER
              </Link>
              <button className="border-2 border-[#00AFF0] text-[#00AFF0] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#00AFF0] hover:text-white transition-colors">
                GET A CALLBACK
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Fundraise With FundRise?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00AFF0] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-[#00AFF0] text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">0% Platform Fee</h3>
              <p className="text-gray-600">Keep 100% of the donations you receive for your educational goals.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00AFF0] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-[#00AFF0] text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Free Mobile App</h3>
              <p className="text-gray-600">Manage your fundraising campaign on the go with our mobile app for iOS and Android.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00AFF0] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-[#00AFF0] text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">50,000+ Donor Community</h3>
              <p className="text-gray-600">Access our large community of supporters who believe in student success.</p>
            </div>
          </div>
          
          <div className="text-center">
            <button className="text-[#00AFF0] font-semibold mb-8">Click to view all features</button>
            <div>
              <Link 
                href="/create-campaign"
                className="bg-[#00AFF0] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0099D6] transition-colors"
              >
                START A FREE FUNDRAISER
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">FAQ's</h2>
          </div>
          
          <div className="space-y-4">
            {[
              {
                question: "How much does it cost to start a fundraiser?",
                answer: "Starting a fundraiser on FundRise is completely free. We don't charge any platform fees, so you keep 100% of the donations you receive."
              },
              {
                question: "How quickly can I receive the funds?",
                answer: "You can withdraw your funds at any time during your fundraising campaign. Most withdrawals are processed within 1-3 business days."
              },
              {
                question: "What types of student goals can I fundraise for?",
                answer: "You can fundraise for tuition fees, study abroad programs, research projects, technology equipment, sports activities, creative projects, and any other educational needs."
              },
              {
                question: "Is there a minimum or maximum amount I can raise?",
                answer: "There's no minimum amount, but we recommend setting realistic goals. There's also no maximum limit - you can raise as much as you need for your educational goals."
              },
              {
                question: "How do I share my fundraiser?",
                answer: "You can share your fundraiser through social media, email, messaging apps, and our platform's built-in sharing tools. We provide templates and tips for effective sharing."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <span className="text-[#00AFF0] text-xl">
                    {faqOpen === index ? '−' : '+'}
                  </span>
                </button>
                {faqOpen === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}