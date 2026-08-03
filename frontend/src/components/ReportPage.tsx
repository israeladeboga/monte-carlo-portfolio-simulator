
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data - in real app this would come from simulation results
const wealthProjection = [
  { year: 2024, median: 100000, p10: 80000, p90: 130000 },
  { year: 2029, median: 150000, p10: 110000, p90: 210000 },
  { year: 2034, median: 220000, p10: 150000, p90: 320000 },
  { year: 2039, median: 320000, p10: 200000, p90: 480000 },
  { year: 2044, median: 450000, p10: 270000, p90: 680000 },
  { year: 2049, median: 620000, p10: 350000, p90: 920000 },
];

const wealthDistribution = [
  { range: '200-300K', count: 5 },
  { range: '300-400K', count: 12 },
  { range: '400-500K', count: 18 },
  { range: '500-600K', count: 25 },
  { range: '600-700K', count: 20 },
  { range: '700-800K', count: 15 },
  { range: '800-900K', count: 5 },
];

const ReportPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const generatePDF = async () => {
    try {
      // Import html2pdf dynamically
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = document.getElementById('report-content');
      const opt = {
        margin: 0.5,
        filename: 'financial-simulation-report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
      
      toast({
        title: "Success",
        description: "PDF report generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/results')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Results
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Financial Simulation Report</h1>
          </div>
          <Button onClick={generatePDF} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>

        {/* Report Content */}
        <div id="report-content" className="bg-background p-8 rounded-lg shadow-sm">
          {/* Report Header */}
          <div className="text-center mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Simulation Report</h1>
            <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          {/* Input Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Simulation Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Current Age</p>
                  <p className="font-semibold">30 years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Retirement Age</p>
                  <p className="font-semibold">65 years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Initial Investment</p>
                  <p className="font-semibold">$100,000</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Contribution</p>
                  <p className="font-semibold">$2,000</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected Return</p>
                  <p className="font-semibold">7.0%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Portfolio Volatility</p>
                  <p className="font-semibold">15.0%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Goal Probability</p>
                  <p className="text-2xl font-bold text-green-600">85%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Median Wealth</p>
                  <p className="text-2xl font-bold">$620K</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">VaR (95%)</p>
                  <p className="text-2xl font-bold text-orange-600">$350K</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Max Drawdown</p>
                  <p className="text-2xl font-bold text-red-600">-28%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wealth Projection Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Wealth Projection Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wealthProjection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${(value as number).toLocaleString()}`, '']} />
                    <Line 
                      type="monotone" 
                      dataKey="p10" 
                      stroke="#ef4444" 
                      strokeDasharray="5 5"
                      name="10th Percentile"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="median" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Median"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="p90" 
                      stroke="#10b981" 
                      strokeDasharray="5 5"
                      name="90th Percentile"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Wealth Distribution */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Final Wealth Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wealthDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Key Findings:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>85% probability of reaching your retirement goal of $500,000</li>
                    <li>In the worst 5% of scenarios, you would have at least $350,000</li>
                    <li>Portfolio volatility of 15% indicates moderate risk level</li>
                    <li>Maximum expected drawdown of 28% during market downturns</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>Consider increasing monthly contributions if possible</li>
                    <li>Review and rebalance portfolio annually</li>
                    <li>Maintain emergency fund separate from retirement savings</li>
                    <li>Re-run simulation annually to track progress</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
