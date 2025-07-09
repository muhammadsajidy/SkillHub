import { useContext } from "react";
import { AuthContext } from "../contexts/authProvider";

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};