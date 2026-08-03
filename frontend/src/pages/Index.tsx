
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Shield, FileText, BarChart3 } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Plan Your Financial Future
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Use Monte Carlo simulations to model your investment portfolio and make informed decisions about your retirement planning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/simulate">
                <Button size="lg" className="text-lg px-8 py-4">
                  Start Simulation
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth/signup">
                  <Button size="lg" className="text-lg px-8 py-4">
                    Get Started
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card>
            <CardHeader className="text-center">
              <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Monte Carlo Simulation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Run thousands of scenarios to understand the range of possible outcomes for your investments.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get detailed risk metrics including Value at Risk, volatility, and maximum drawdown analysis.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your financial data is encrypted and secure. We never share your personal information.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <FileText className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>PDF Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate comprehensive PDF reports to share with financial advisors or keep for your records.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
                <CardDescription>
                  Create your free account and run your first financial simulation in minutes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/auth/signup">
                  <Button size="lg" className="text-lg px-8 py-4">
                    Create Free Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
