import axios from "axios";
import { Box, Container, Typography, TextField, Button, Paper, IconButton, InputAdornment, MenuItem, } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { ToastContainer, toast } from "react-toastify";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: ""
  });
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  const { login } = useAuth();

  const handleLogin = () => {
    axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, formData)
    .then((res) => {
      const { token, user } = res.data;
      login({ token, user });
      navigate("/")
    })
    .catch((e) => toast.error(e?.response.data.error));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #e8efff, #dee8ff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          width: 500,
          maxWidth: '90vw',
          padding: 3,
        }}
      >
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h5" fontWeight="bold">
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account to continue
            </Typography>
          </Box>
          <TextField
            fullWidth
            name="username"
            label="Username"
            variant="outlined"
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            fullWidth
            name="password"
            label="Password"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            margin="normal"
            onChange={handleChange}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            fullWidth
            name="role"
            select
            label="Role"
            margin="normal"
            defaultValue=""
            onChange={handleChange}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </TextField>

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, bgcolor: "#0a1f44", py: 1.2 }}
            disabled={!formData.username || !formData.password || !formData.role}
            onClick={handleLogin}
          >
            Sign In
          </Button>

          <Typography align="center" sx={{ mt: 2 }}>
            Don&apos;t have an account?{" "}
            <Link to="/signup" style={{ color: "#0a1f44" }}>
              Sign up
            </Link>
          </Typography>
        </Paper>
      </Container>
      <ToastContainer position="top-right" autoClose={500} pauseOnHover={false}/>
    </Box>
  );
};