"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
  Crown,
  ArrowUpRight,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentTransactions = [
  { id: 1, user: "Dr. Anish Kumar", plan: "Premium Monthly", amount: "₹999", date: "Today", status: "success" },
  { id: 2, user: "Priya Sharma", plan: "Premium Yearly", amount: "₹4,999", date: "Yesterday", status: "success" },
  { id: 3, user: "Rahul Verma", plan: "Premium Monthly", amount: "₹999", date: "2 days ago", status: "success" },
  { id: 4, user: "Sarah Johnson", plan: "Premium Monthly", amount: "₹999", date: "3 days ago", status: "failed" },
  { id: 5, user: "Mohammed Ali", plan: "Premium Yearly", amount: "₹4,999", date: "4 days ago", status: "success" },
];

export default function AdminSubscriptionsPage() {
  return (
    <AdminLayout title="Subscriptions & Revenue">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Revenue Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₹4.5L</p>
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <ArrowUpRight className="w-3 h-3" />
                <span>+22% this month</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Monthly Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">1,850</p>
              <p className="text-xs text-gray-500">Premium Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">14.8%</p>
              <p className="text-xs text-gray-500">Conversion Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-xs text-gray-500">New Subs (Week)</p>
            </CardContent>
          </Card>
        </div>

        {/* Plans Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Free", price: "₹0", users: 10600, features: ["Daily Tests", "Basic Analytics", "Leaderboard"] },
                { name: "Premium Monthly", price: "₹999/mo", users: 1200, features: ["Unlimited Practice", "Advanced Analytics", "Grand Mock", "AI Recommendations"] },
                { name: "Premium Yearly", price: "₹4,999/yr", users: 650, features: ["All Premium Features", "12 Months Access", "Priority Support", "Save 58%"] },
              ].map((plan) => (
                <div key={plan.name} className="p-4 border rounded-xl">
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-lg font-bold text-primary mt-1">{plan.price}</p>
                  <p className="text-xs text-gray-500 mt-1">{plan.users.toLocaleString()} users</p>
                  <ul className="mt-3 space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="text-xs text-gray-600 flex items-center space-x-1">
                        <span className="w-1 h-1 bg-primary rounded-full" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{tx.user}</p>
                      <p className="text-xs text-gray-500">{tx.plan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{tx.amount}</p>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={tx.status === "success" ? "success" : "destructive"}
                        className="text-[10px]"
                      >
                        {tx.status}
                      </Badge>
                      <span className="text-xs text-gray-400">{tx.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AdminLayout>
  );
}
