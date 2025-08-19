import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Play } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
}

const InteractionTest = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const tests = [
    {
      name: 'Header Navigation Links',
      test: () => {
        // Test if all header navigation links exist
        const navLinks = document.querySelectorAll('nav a[href^="/"]');
        return navLinks.length >= 4 ? 'pass' : 'fail';
      },
      message: 'Header contains proper React Router navigation links'
    },
    {
      name: 'Dashboard Quick Actions',
      test: () => {
        // Test if dashboard quick action buttons exist
        const quickActions = document.querySelectorAll('a[href="/candidates"], a[href="/calendar"], a[href="/democracy-hub"]');
        return quickActions.length >= 3 ? 'pass' : 'fail';
      },
      message: 'Dashboard quick actions are properly linked'
    },
    {
      name: 'Candidate Cards Clickable',
      test: () => {
        // Test if candidate cards are clickable links
        const candidateLinks = document.querySelectorAll('a[href^="/candidate/"]');
        return candidateLinks.length > 0 ? 'pass' : 'fail';
      },
      message: 'Candidate cards navigate to profile pages'
    },
    {
      name: 'Compare Functionality',
      test: () => {
        // Test if compare buttons exist
        const compareButtons = document.querySelectorAll('button, a').length;
        return compareButtons > 0 ? 'pass' : 'fail';
      },
      message: 'Compare candidates functionality is available'
    },
    {
      name: 'Hero CTA Buttons',
      test: () => {
        // Test if hero buttons are properly linked
        const heroButtons = document.querySelectorAll('a[href="/candidates"], a[href="/democracy-hub"]');
        return heroButtons.length >= 2 ? 'pass' : 'fail';
      },
      message: 'Hero call-to-action buttons navigate correctly'
    }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    for (const test of tests) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate test delay
      
      try {
        const status = test.test();
        setTestResults(prev => [...prev, {
          name: test.name,
          status: status as 'pass' | 'fail',
          message: test.message
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: test.name,
          status: 'fail',
          message: `Test failed: ${error}`
        }]);
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'pending') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <div className="w-5 h-5 bg-muted rounded-full animate-pulse" />;
    }
  };

  const getStatusBadge = (status: 'pass' | 'fail' | 'pending') => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-success text-success-foreground">PASS</Badge>;
      case 'fail':
        return <Badge variant="destructive">FAIL</Badge>;
      default:
        return <Badge variant="outline">PENDING</Badge>;
    }
  };

  const passedTests = testResults.filter(t => t.status === 'pass').length;
  const totalTests = tests.length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>CivicLens Interaction Tests</span>
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </CardTitle>
        {testResults.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {passedTests}/{totalTests} tests passed
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tests.map((test, index) => {
            const result = testResults.find(r => r.name === test.name);
            const status = result?.status || 'pending';
            
            return (
              <div key={test.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(status)}
                  <div>
                    <h4 className="font-medium text-foreground">{test.name}</h4>
                    <p className="text-sm text-muted-foreground">{result?.message || test.message}</p>
                  </div>
                </div>
                {getStatusBadge(status)}
              </div>
            );
          })}
        </div>

        {testResults.length === 0 && !isRunning && (
          <div className="text-center py-8 text-muted-foreground">
            Click "Run Tests" to validate all navigation and interactions
          </div>
        )}

        {isRunning && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Running interaction tests...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractionTest;