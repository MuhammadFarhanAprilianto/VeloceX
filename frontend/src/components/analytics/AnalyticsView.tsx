'use client';

import React from 'react';
import { AnalyticsTickerHeader } from '@/components/analytics/AnalyticsTickerHeader';
import { AnalyticsChartPanel } from '@/components/analytics/AnalyticsChartPanel';
import { AnalyticsOrderPanel } from '@/components/analytics/AnalyticsOrderPanel';
import { AnalyticsPositionsTracker } from '@/components/analytics/AnalyticsPositionsTracker';

interface AnalyticsViewProps {
  onOrderSuccess?: (msg: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onOrderSuccess }) => {
  return (
    <div className="flex flex-col w-full gap-5 p-3 sm:p-5 md:p-6 pb-24 md:pb-6 bg-[#131118]">
      {/* 1. Top Ticker Market Stats Header */}
      <AnalyticsTickerHeader />

      {/* 2. Main 2-Column Analytics Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        {/* Left Column (8 cols): Pro Candlestick Chart + Positions & TP/SL Tracker */}
        <div className="flex flex-col gap-5 lg:col-span-8">
          <AnalyticsChartPanel />
          <AnalyticsPositionsTracker />
        </div>

        {/* Right Column (4 cols): Perpetual Futures Order Panel & Margin Usage */}
        <div className="flex flex-col gap-5 lg:col-span-4">
          <AnalyticsOrderPanel onOrderSuccess={onOrderSuccess} />
        </div>
      </div>
    </div>
  );
};
