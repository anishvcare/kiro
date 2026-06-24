"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Star, Zap, Shield, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Basic FMGE preparation",
    features: [
      "Daily Morning & Evening Tests",
      "Basic Performance Analytics",
      "Leaderboard Access",
      "30-Day Challenge",
      "Limited Subject Practice",
    ],
    limitations: [
      "No Grand Mock Exam access",
      "No AI Recommendations",
      "Ads included",
    ],
    popular: false,
  },
  {
    id: "premium-monthly",
    name: "Premium",
    price: "₹999",
    period: "/month",
    description: "Complete FMGE preparation",
    features: [
      "Everything in Free",
      "Unlimited Subject Practice",
      "Advanced Analytics & AI",
      "Grand Mock Exams (Unlimited)",
      "AI Weakness Detection",
      "Personalized Study Plan",
      "Priority Support",
      "Ad-Free Experience",
    ],
    limitations: [],
    popular: true,
  },
  {
    id: "premium-yearly",
    name: "Premium Yearly",
    price: "₹4,999",
    period: "/year",
    description: "Best value - Save 58%",
    features: [
      "All Premium Features",
      "12 Months Access",
      "Priority Access to New Features",
      "Exclusive Study Materials",
      "Save ₹6,989 vs monthly",
    ],
    limitations: [],
    popular: false,
    savings: "Save 58%",
  },
];

export default function SubscriptionPage() {
  const { user } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const currentPlan = user?.subscription_plan || "free";

  return (
    <AppLayout title="Subscription">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Upgrade Your Preparation</h1>
          <p className="text-gray-500 mt-1">Choose the plan that fits your FMGE journey</p>
        </div>

        {/* Current Plan Badge */}
        {currentPlan === "premium" && (
          <div className="flex justify-center">
            <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white px-4 py-1">
              <Crown className="w-4 h-4 mr-1" />
              You are on Premium Plan
            </Badge>
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-white shadow-lg">
                    <Star className="w-3 h-3 mr-1" /> Most Popular
                  </Badge>
                </div>
              )}
              {plan.savings && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-green-600 text-white shadow-lg">
                    <Zap className="w-3 h-3 mr-1" /> {plan.savings}
                  </Badge>
                </div>
              )}
              <Card className={cn(
                "h-full transition-all",
                plan.popular && "border-primary border-2 shadow-lg",
                selectedPlan === plan.id && "ring-2 ring-primary"
              )}>
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="text-center mb-4 pt-2">
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-xs text-gray-500">{plan.description}</p>
                    <div className="mt-3">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-sm text-gray-500">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 space-y-2 mb-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-700">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation) => (
                      <div key={limitation} className="flex items-start space-x-2">
                        <span className="w-4 h-4 flex items-center justify-center text-gray-300 flex-shrink-0">✕</span>
                        <span className="text-xs text-gray-400 line-through">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {plan.id === "free" ? (
                    <Button variant="outline" className="w-full" disabled={currentPlan === "free"}>
                      {currentPlan === "free" ? "Current Plan" : "Downgrade"}
                    </Button>
                  ) : (
                    <Button
                      className={cn("w-full", plan.popular && "bg-primary")}
                      disabled={currentPlan === "premium"}
                    >
                      {currentPlan === "premium" ? "Active" : "Upgrade Now"}
                      {currentPlan !== "premium" && <ArrowRight className="w-4 h-4 ml-1" />}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Payment Methods */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-4">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-500">Secure payment via</span>
              <div className="flex space-x-3">
                <span className="text-sm font-semibold text-blue-700">Razorpay</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm font-semibold text-purple-700">Stripe</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {[
                { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription anytime. You'll continue to have access until the end of your billing period." },
                { q: "Is there a refund policy?", a: "We offer a 7-day money-back guarantee if you're not satisfied with Premium." },
                { q: "What payment methods are accepted?", a: "We accept UPI, Debit/Credit Cards, Net Banking via Razorpay, and international cards via Stripe." },
              ].map((faq) => (
                <div key={faq.q} className="border-b border-gray-100 pb-3 last:border-0">
                  <p className="text-sm font-medium text-gray-900">{faq.q}</p>
                  <p className="text-xs text-gray-500 mt-1">{faq.a}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
