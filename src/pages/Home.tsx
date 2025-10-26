import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Dumbbell } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100, { message: "Password must be less than 100 characters" })
});

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/dashboard');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate('/dashboard');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateInput = (email: string, password: string) => {
    try {
      authSchema.parse({ email, password });
      return null;
    } catch (error: any) {
      return error.errors[0]?.message || 'Invalid input';
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateInput(email, password);
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/dashboard`;
        
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Try signing in instead.",
              variant: "destructive",
            });
            setIsSignUp(false);
          } else {
            throw error;
          }
        } else {
          toast({
            title: "Check your email",
            description: "Please check your email for the confirmation link.",
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Invalid credentials",
              description: "Please check your email and password.",
              variant: "destructive",
            });
          } else if (error.message.includes('Email not confirmed')) {
            toast({
              title: "Email not confirmed",
              description: "Please check your email and click the confirmation link.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Decorative Header */}
        <div className="text-center space-y-6">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 transition-transform hover:scale-105">
            <Dumbbell className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Auth Card */}
        <Card className="p-8 space-y-6">
          <form onSubmit={handleAuth} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                className="transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2 relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={100}
                className="pr-12 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            {!isSignUp && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label 
                    htmlFor="remember" 
                    className="cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Save Login Info
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password
                </button>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 font-semibold tracking-wide"
                disabled={loading}
              >
                {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
              </Button>
              
              {!isSignUp && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="w-14 h-12"
                  title="Face ID"
                >
                  <svg 
                    className="w-5 h-5" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </Button>
              )}
            </div>

            {/* Toggle Sign In/Sign Up */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {isSignUp ? 'Already have an account? ' : 'New to GymGuide? '}
              </span>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-foreground font-medium hover:text-primary transition-colors underline-offset-2 hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>

            {/* Test Skip Button */}
            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs text-muted-foreground"
              onClick={() => navigate('/dashboard')}
            >
              Skip for testing
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Home;
