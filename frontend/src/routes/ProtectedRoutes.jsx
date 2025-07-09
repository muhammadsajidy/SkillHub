import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { CircularProgress, Box } from "@mui/material";

export default function ProtectedRoutes() {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '100vh' 
                }}
            >
                <CircularProgress />
            </Box>
        );
    };

    if (user) {
        return <Outlet />;
    } else {
        return <Navigate to="/login" replace />;
    };
};