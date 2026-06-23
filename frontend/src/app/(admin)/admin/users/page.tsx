"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  MoreVertical,
  Shield,
  Crown,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mockUsers = [
  { id: 1, name: "Dr. Anish Kumar", email: "anish@email.com", role: "student", plan: "premium", streak: 15, tests: 48, joined: "2026-01-15", lastActive: "2 hours ago" },
  { id: 2, name: "Priya Sharma", email: "priya@email.com", role: "student", plan: "free", streak: 7, tests: 32, joined: "2026-02-20", lastActive: "5 min ago" },
  { id: 3, name: "Rahul Verma", email: "rahul@email.com", role: "student", plan: "premium", streak: 22, tests: 56, joined: "2025-12-01", lastActive: "1 hour ago" },
  { id: 4, name: "Sarah Johnson", email: "sarah@email.com", role: "student", plan: "free", streak: 3, tests: 12, joined: "2026-05-10", lastActive: "3 days ago" },
  { id: 5, name: "Mohammed Ali", email: "ali@email.com", role: "student", plan: "premium", streak: 30, tests: 72, joined: "2025-11-15", lastActive: "Online" },
  { id: 6, name: "Sneha Patel", email: "sneha@email.com", role: "admin", plan: "premium", streak: 0, tests: 0, joined: "2025-10-01", lastActive: "10 min ago" },
  { id: 7, name: "Vikram Singh", email: "vikram@email.com", role: "student", plan: "free", streak: 1, tests: 5, joined: "2026-06-01", lastActive: "1 week ago" },
  { id: 8, name: "Lakshmi Nair", email: "lakshmi@email.com", role: "student", plan: "premium", streak: 12, tests: 40, joined: "2026-03-15", lastActive: "30 min ago" },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout title="User Management">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">12,450</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">3,280</p>
              <p className="text-xs text-gray-500">Active Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">1,850</p>
              <p className="text-xs text-gray-500">Premium Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">156</p>
              <p className="text-xs text-gray-500">New This Week</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            {["all", "student", "admin"].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filterRole === role
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-primary/50"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">User</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Role</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Plan</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">Streak</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">Tests</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Last Active</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="text-xs">
                              {user.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs capitalize">
                          {user.role === "admin" && <Shield className="w-3 h-3 mr-1" />}
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge
                          variant={user.plan === "premium" ? "warning" : "outline"}
                          className="text-xs capitalize"
                        >
                          {user.plan === "premium" && <Crown className="w-3 h-3 mr-1" />}
                          {user.plan}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm font-medium">{user.streak} 🔥</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-gray-600">{user.tests}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${user.lastActive === "Online" ? "text-green-600 font-medium" : "text-gray-500"}`}>
                          {user.lastActive}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-xs text-gray-500">Showing 1-8 of 12,450</span>
              <div className="flex space-x-1">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AdminLayout>
  );
}
