import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import SettingsDropdown from './SettingsDropdown';
const Navbar = () => {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  return <nav className="glass-nav sticky top-0 z-50 shadow-glass" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Capital Forecast</Link>
          </div>
          
          <div className="flex items-center space-x-6">
            {user ? <>
                <Link to="/simulate">
                  <Button variant="ghost" className="font-medium hover:bg-primary-light hover:text-primary">
                    New Simulation
                  </Button>
                </Link>
                <Link to="/saved-results">
                  <Button variant="ghost" className="font-medium hover:bg-primary-light hover:text-primary">
                    Saved Results
                  </Button>
                </Link>
                <SettingsDropdown />
                <div className="flex items-center space-x-3 pl-4 border-l border-border">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{user.email}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="hover:bg-warning-light hover:text-warning hover:border-warning">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </> : <>
                <Link to="/auth/login">
                  <Button variant="ghost" className="font-medium">Sign In</Button>
                </Link>
                <Link to="/auth/signup">
                  <Button className="bg-gradient-primary font-semibold">Get Started</Button>
                </Link>
              </>}
          </div>
        </div>
      </div>
    </nav>;
};
export default Navbar;