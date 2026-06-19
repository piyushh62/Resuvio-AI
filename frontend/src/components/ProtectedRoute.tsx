import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "@/components/ui/loader";

const ProtectedRoute: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <Loader fullScreen color="#3B82F6" />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
