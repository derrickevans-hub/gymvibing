import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button-enhanced";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="text-center animate-slide-up max-w-md mx-auto p-6">
        <div className="mb-8">
          <div className="text-8xl mb-4">🏃‍♂️</div>
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Workout Not Found</h2>
          <p className="text-muted-foreground">
            Looks like you took a wrong turn during your fitness journey!
          </p>
        </div>
        
        <div className="space-y-3">
          <Button variant="hero" size="lg" asChild className="w-full">
            <Link to="/">
              <Home className="w-5 h-5" />
              Back to Workouts
            </Link>
          </Button>
          
          <Button variant="gentle" onClick={() => window.history.back()} className="w-full">
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
