// Authentication Page for CivicLens
// Login and signup with civic engagement hero image

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await signIn(loginForm.email, loginForm.password);
    
    if (error) {
      setError(error.message);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate("/");
    }
    
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (signupForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { error } = await signUp(signupForm.email, signupForm.password);
    
    if (error) {
      setError(error.message);
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      navigate("/");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/lovable-uploads/2d08962c-20d4-4728-bc6e-1d68d126919b.png')" }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        {/* Logo and Branding */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-wide">
              Civic
            </h1>
            <div className="mx-4 w-16 h-16 md:w-20 md:h-20 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-green-400 rounded-full opacity-80"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-teal-500 to-green-500 rounded-full"></div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-wide">
              Lens
            </h1>
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-2">
            See Your Candidates Clearly
          </h2>
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-0.5 bg-gray-400"></div>
            <span className="mx-4 text-gray-300 text-sm md:text-base tracking-widest uppercase">
              Democracy in Focus
            </span>
            <div className="w-16 h-0.5 bg-gray-400"></div>
          </div>
        </div>

        {/* Main Content Box */}
        <div className="max-w-2xl mx-auto mb-8">
          <div 
            className="p-6 md:p-8 rounded-2xl backdrop-blur-sm border border-white/20"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <p className="text-lg md:text-xl text-white leading-relaxed">
              Empowering Nigerian voters through informed choices.
              <br />
              Your trusted political compass in the complex landscape of elections.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            size="lg"
            onClick={() => navigate("/onboarding")}
            className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-4 rounded-full min-w-[160px]"
          >
            Get Started
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={() => setShowSignIn(!showSignIn)}
            className="border-white text-white hover:bg-white hover:text-black text-lg px-8 py-4 rounded-full min-w-[160px]"
          >
            Sign In
          </Button>
        </div>

        {/* Security Indicators */}
        <div className="flex items-center gap-6 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Trusted</span>
          </div>
        </div>
      </div>

      {/* Sign In Modal/Overlay */}
      {showSignIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <Card className="bg-white">
              <CardHeader className="text-center">
                <CardTitle>Sign In to CivicLens</CardTitle>
                <CardDescription>
                  Access your personalized democracy dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password (min. 6 characters)"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm">Confirm Password</Label>
                        <Input
                          id="signup-confirm"
                          type="password"
                          placeholder="Confirm your password"
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-4 flex justify-between items-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowSignIn(false)}
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    By continuing, you agree to our Terms & Privacy
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;