'use client';

import { useState } from 'react';
import { 
  useGetWeeklyInsightQuery, 
  useGetMonthlyInsightQuery,
  useRefreshWeeklyInsightMutation,
  useRefreshMonthlyInsightMutation
} from '@/store/services/aiApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, TrendingDown, Minus, AlertTriangle, 
  CheckCircle, Lightbulb, Target, Calendar, RefreshCw
} from 'lucide-react';

export default function InsightsDashboardPage() {
  const [activeTab, setActiveTab] = useState('weekly');
  
  const { data: weeklyData, isLoading: weeklyLoading, refetch: refetchWeekly } = useGetWeeklyInsightQuery();
  const { data: monthlyData, isLoading: monthlyLoading, refetch: refetchMonthly } = useGetMonthlyInsightQuery();

  const [refreshWeekly, { isLoading: isRefreshingWeekly }] = useRefreshWeeklyInsightMutation();
  const [refreshMonthly, { isLoading: isRefreshingMonthly }] = useRefreshMonthlyInsightMutation();

  const isRefreshing = isRefreshingWeekly || isRefreshingMonthly;

  const handleRefresh = async () => {
    try {
      if (activeTab === 'weekly') {
        await refreshWeekly().unwrap();
        refetchWeekly();
      } else {
        await refreshMonthly().unwrap();
        refetchMonthly();
      }
    } catch (error) {
      console.error("Failed to refresh insights", error);
    }
  };

  const renderInsight = (data: any, loading: boolean) => {
    if (loading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      );
    }

    if (!data?.data) {
      return (
        <div className="text-center py-20 text-slate-400 flex flex-col items-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p>No insights available for this period</p>
        </div>
      );
    }

    const insight = data.data;

    return (
      <div className="space-y-6">
        {/* Headline */}
        {insight.headline && (
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {insight.headline}
            </h2>
            <p className="text-sm text-slate-600">
              {new Date(insight.periodStart).toLocaleDateString()} - {new Date(insight.periodEnd).toLocaleDateString()}
            </p>
          </Card>
        )}

        {/* Performance Summary */}
        {insight.performanceSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase">Revenue Trend</p>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-lg font-bold text-slate-900">
                {insight.performanceSummary.revenueTrend}
              </p>
            </Card>

            <Card className="p-5 border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase">Key Win</p>
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-slate-700">
                {insight.performanceSummary.keyWin}
              </p>
            </Card>

            <Card className="p-5 border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase">Key Concern</p>
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-sm text-slate-700">
                {insight.performanceSummary.keyConcern}
              </p>
            </Card>
          </div>
        )}

        {/* Inventory Alerts */}
        {insight.inventoryAlerts && insight.inventoryAlerts.length > 0 && (
          <Card className="p-6 border-slate-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Inventory Alerts
              <Badge variant="destructive" className="ml-auto">
                {insight.inventoryAlerts.length}
              </Badge>
            </h3>
            <div className="space-y-3">
              {insight.inventoryAlerts.map((alert: any, i: number) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{alert.product}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      {alert.unitsLeft} units left • {alert.daysUntilStockout} days until stockout
                    </p>
                  </div>
                  <Badge className="bg-orange-600 text-white">
                    {alert.action}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Platform Insights */}
        {insight.platformInsights && insight.platformInsights.length > 0 && (
          <Card className="p-6 border-slate-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Platform Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insight.platformInsights.map((platform: any, i: number) => (
                <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">{platform.platform}</p>
                  <p className="text-sm text-slate-700 mb-3">{platform.observation}</p>
                  <p className="text-xs text-blue-700 font-medium">
                    💡 {platform.suggestedAction}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Items */}
        {insight.actionItems && insight.actionItems.length > 0 && (
          <Card className="p-6 border-slate-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Action Items
            </h3>
            <div className="space-y-3">
              {insight.actionItems.map((item: any, i: number) => (
                <div 
                  key={i} 
                  className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={
                        item.priority === 'HIGH' ? 'destructive' : 
                        item.priority === 'MEDIUM' ? 'default' : 
                        'secondary'
                      }
                    >
                      {item.priority}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 mb-1">{item.action}</p>
                    <p className="text-sm text-slate-600">
                      Expected Impact: {item.expectedImpact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Strategic Recommendations (Monthly only) */}
        {insight.strategicRecommendations && insight.strategicRecommendations.length > 0 && (
          <Card className="p-6 border-slate-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Strategic Recommendations
            </h3>
            <div className="space-y-4">
              {insight.strategicRecommendations.map((rec: any, i: number) => (
                <div key={i} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="font-semibold text-slate-900 mb-2">{rec.recommendation}</p>
                  <p className="text-sm text-slate-700 mb-2">{rec.rationale}</p>
                  <p className="text-xs text-yellow-700 font-medium">
                    ⏱️ Timeframe: {rec.timeframe}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Next Period Forecast */}
        {insight.nextPeriodForecast && (
          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Next Period Forecast
            </h3>
            <p className="text-slate-700">{insight.nextPeriodForecast}</p>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AI Business Insights</h1>
            <p className="text-slate-500">Data-driven recommendations for your business</p>
          </div>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Generating...' : 'Refresh Insights'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="weekly">Weekly Insights</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Review</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-6">
          {renderInsight(weeklyData, weeklyLoading)}
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          {renderInsight(monthlyData, monthlyLoading)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
