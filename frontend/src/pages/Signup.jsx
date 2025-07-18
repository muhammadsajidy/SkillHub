import axios from "axios";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    emailId: "",
    role: "" 
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSignup = () => {
    axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, formData)
    .then((res) => {
        console.log(res.data);
        navigate("/login");
    })
    .catch((e) => console.error(e));
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
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h5" fontWeight="bold">
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign up to start managing your skills
            </Typography>
          </Box>
          <TextField
            name="username"
            fullWidth
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
            name="emailId"
            label="Email ID"
            variant="outlined"
            margin="normal"
            onChange={handleChange}
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
            disabled={!formData.username || !formData.password || !formData.emailId}
            onClick={handleSignup}
          >
            Sign Up
          </Button>

          <Typography align="center" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#0a1f44" }}>
              Sign in
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
