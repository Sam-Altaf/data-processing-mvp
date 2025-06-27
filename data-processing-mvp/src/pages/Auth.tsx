import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link,
  Grid,
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSnackbar } from '../components/shared/Snackbar';

const AuthContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  backgroundImage: 'linear-gradient(315deg, #f5f7fa 0%, #c3cfe2 100%)'
}));

const AuthCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)'
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  background: 'linear-gradient(45deg, #3f51b5 30%, #f50057 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(4)
}));

const Auth: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const success = await login(formData.email, formData.password);
        if (success) {
          showSuccess('Login successful');
          navigate('/');
        } else {
          showError('Login failed. Please check your credentials.');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          showError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        
        const success = await register(formData.name, formData.email, formData.password);
        if (success) {
          showSuccess('Registration successful');
          navigate('/');
        } else {
          showError('Registration failed. Please try again.');
        }
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
  };
  
  return (
    <AuthContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 480 }}
      >
        <AuthCard>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LogoText variant="h4">
                DataProcess MVP
              </LogoText>
              <Typography variant="h5" gutterBottom>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isLogin
                  ? 'Sign in to continue to the application'
                  : 'Create a new account to get started'}
              </Typography>
            </Box>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {!isLogin && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      autoComplete="name"
                    />
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    autoComplete="email"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                </Grid>
                
                {!isLogin && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!isLogin}
                      variant="outlined"
                      autoComplete="new-password"
                    />
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isLoading}
                    sx={{ height: 56 }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} />
                    ) : isLogin ? (
                      'Sign In'
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <Link
                  component="button"
                  type="button"
                  onClick={toggleAuthMode}
                  sx={{ ml: 1, fontWeight: 500 }}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Link>
              </Typography>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Demo Access
                </Typography>
              </Divider>
              <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
                For demo purposes, you can use any email/password
              </Typography>
            </Box>
          </CardContent>
        </AuthCard>
      </motion.div>
    </AuthContainer>
  );
};

export default Auth;