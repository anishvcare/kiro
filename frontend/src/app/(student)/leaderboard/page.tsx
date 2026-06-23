"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Globe, Building, MapPin } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const leaderboardData = [
  { rank: 1, name: "Dr. Anish Kumar", score: 2850, tests: 48, university: "KMC Manipal", avatar: "" },
  { rank: 2, name: "Priya Sharma", score: 2720, tests: 45, university: "AIIMS Delhi", avatar: "" },
  { rank: 3, name: "Rahul Verma", score: 2680, tests: 44, university: "GMC Mumbai", avatar: "" },
  { rank: 4, name: "Sarah Johnson", score: 2550, tests: 42, university: "CMC Vellore", avatar: "" },
  { rank: 5, name: "Mohammed Ali", score: 2480, tests: 40, university: "JNMC Aligarh", avatar: "" },
  { rank: 6, name: "Sneha Patel", score: 2420, tests: 39, university: "KGMC Lucknow", avatar: "" },
  { rank: 7, name: "Vikram Singh", score: 2380, tests: 38, university: "BMC Surat", avatar: "" },
  { rank: 8, name: "Lakshmi Nair", score: 2350, tests: 37, university: "GMC Trivandrum", avatar: "" },
  { rank: 9, name: "Amit Gupta", score: 2300, tests: 36, university: "MAMC Delhi", avatar: "" },
  { rank: 10, name: "Fatima Khan", score: 2250, tests: 35, university: "GMC Nagpur", avatar: "" },
];

const filters = [
  { id: "global", label: "Global", icon: Globe },
  { id: "university", label: "University", icon: Building },
  { id: "country", label: "Country", icon: MapPin },
];

const timeFilters = ["This Week", "This Month", "All Time"];

export default function LeaderboardPage() {
  const [activeFilter, setActiveFilter] = useState("global");
  const [activeTime, setActiveTime] = useState("This Week");
  const myRank = 15;

  return (
    <AppLayout title="Leaderboard">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "flex items-center space-x-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeFilter === filter.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-primary/50"
              )}
            >
              <filter.icon className="w-4 h-4" />
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Time Filter */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {timeFilters.map((time) => (
            <button
              key={time}
              onClick={() => setActiveTime(time)}
              className={cn(
                "flex-1 py-2 text-xs font-medium rounded-md transition-all",
                activeTime === time
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500"
              )}
            >
              {time}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center space-x-4 py-4">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <Avatar className="w-14 h-14 mx-auto border-2 border-gray-300">
              <AvatarFallback className="bg-gray-100 text-gray-600">PS</AvatarFallback>
            </Avatar>
            <div className="mt-2 bg-gray-100 rounded-t-lg pt-2 pb-6 px-3 w-20">
              <Medal className="w-5 h-5 text-gray-400 mx-auto" />
              <p className="text-xs font-semibold mt-1 truncate">{leaderboardData[1].name.split(" ")[0]}</p>
              <p className="text-xs text-gray-500">{leaderboardData[1].score}</p>
            </div>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center -mt-4"
          >
            <div className="relative">
              <Crown className="w-6 h-6 text-amber-500 mx-auto mb-1" />
              <Avatar className="w-16 h-16 mx-auto border-2 border-amber-400">
                <AvatarFallback className="bg-amber-50 text-amber-600">AK</AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-2 bg-gradient-to-b from-amber-100 to-amber-50 rounded-t-lg pt-2 pb-8 px-3 w-24">
              <Trophy className="w-5 h-5 text-amber-500 mx-auto" />
              <p className="text-xs font-semibold mt-1 truncate">{leaderboardData[0].name.split(" ")[0]}</p>
              <p className="text-xs text-amber-600 font-bold">{leaderboardData[0].score}</p>
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <Avatar className="w-14 h-14 mx-auto border-2 border-orange-300">
              <AvatarFallback className="bg-orange-50 text-orange-600">RV</AvatarFallback>
            </Avatar>
            <div className="mt-2 bg-orange-50 rounded-t-lg pt-2 pb-4 px-3 w-20">
              <Medal className="w-5 h-5 text-orange-400 mx-auto" />
              <p className="text-xs font-semibold mt-1 truncate">{leaderboardData[2].name.split(" ")[0]}</p>
              <p className="text-xs text-gray-500">{leaderboardData[2].score}</p>
            </div>
          </motion.div>
        </div>

        {/* My Rank */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg font-bold text-primary">#{myRank}</span>
              <Avatar className="w-10 h-10">
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">You</p>
                <p className="text-xs text-gray-500">Keep going! 🔥</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">1,850</p>
              <p className="text-xs text-gray-500">points</p>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard List */}
        <div className="space-y-2">
          {leaderboardData.slice(3).map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-gray-400 w-6">
                      {entry.rank}
                    </span>
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="text-xs">
                        {entry.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{entry.name}</p>
                      <p className="text-xs text-gray-500">{entry.university}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{entry.score}</p>
                    <p className="text-xs text-gray-500">{entry.tests} tests</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
}
