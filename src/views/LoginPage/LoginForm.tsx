import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Zoom
} from "@mui/material";
import { 
  AccountCircle, 
  Info, 
  Visibility, 
  VisibilityOff,
  Lock
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../../services/authService";
import { motion } from "framer-motion";

interface LoginFormProps {
  onForgotPasswordClick: () => void;
}

interface LoginFormData {
  username: string;
  password: string;
}

const LoginForm = ({ onForgotPasswordClick }: LoginFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedUsername) {
      setRememberMe(true);
      setValue("username", rememberedUsername);
    }
  }, [setValue]);

  const { mutate: loginMutation, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      localStorage.setItem("token", data?.token);
      // Remember or forget username based on checkbox
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", variables.username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }
      enqueueSnackbar("Welcome Back!", { variant: "success" });
      navigate("/home");
    },
    onError: () => {
      enqueueSnackbar(`Login Failed`, {
        variant: "error",
      });
    },
  });

  const onSubmit = (data: { username: string; password: string }) => {
    loginMutation(data);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 500 }}>
      <CardContent sx={{ textAlign: "center" }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img src="/images/lgo1.png" alt="Buildtek Logo" width="50px" />
          <Typography variant="h5" fontWeight="bold">
            Smart Flow
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold">
            Seamless Production, Smarter Management
          </Typography>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Typography variant="h6" fontWeight="bold" mt={1} sx={{ textAlign: "left" }}>
            Sign In
          </Typography>
        </motion.div>
      </CardContent>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <TextField
            label="Username"
            fullWidth
            variant="outlined"
            margin="normal"
            {...register("username", {
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters",
              },
            })}
            error={!!errors.username}
            helperText={errors.username?.message}
            sx={{ mb: 2 }}
            autoComplete="username"
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle color={errors.username ? "error" : "action"} />
                </InputAdornment>
              ),
            }}
          />
        </motion.div>

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            variant="outlined"
            margin="normal"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{ mb: 2 }}
            autoComplete="current-password"
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color={errors.password ? "error" : passwordFocused ? "primary" : "action"} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    sx={{
                      transform: showPassword ? "rotate(0deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease-in-out",
                    }}
                  >
                    {showPassword ? (
                      <Zoom in={showPassword}>
                        <VisibilityOff color={passwordFocused ? "primary" : "action"} />
                      </Zoom>
                    ) : (
                      <Zoom in={!showPassword}>
                        <Visibility color={passwordFocused ? "primary" : "action"} />
                      </Zoom>
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                color="primary"
              />
            }
            label="Remember me"
            sx={{ mb: 2 }}
          />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isPending}
            sx={{ 
              mb: 2, 
              height: 48,
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)'
              }
            }}
          >
            {isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                Sign In
              </motion.span>
            )}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: 'center',
            mt: 2
          }}>
            <Button
              startIcon={<Info />}
              onClick={onForgotPasswordClick}
              sx={{ 
                textTransform: "none",
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              Forgot password?
            </Button>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button 
                startIcon={<AccountCircle />} 
                sx={{ 
                  textTransform: "none",
                  color: 'primary.main',
                  '&:hover': {
                    color: 'primary.dark'
                  }
                }}
              >
                Create account
              </Button>
            </Link>
          </Box>
        </motion.div>
      </form>
    </Box>
  );
};

export default LoginForm;