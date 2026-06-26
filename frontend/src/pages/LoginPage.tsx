import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Quote } from 'lucide-react';
import { toast } from "sonner";
import { motion } from "framer-motion";
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/ui/loader';

type FirebaseAuthErrorLike = {
    code?: string;
};

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [redirectPath, setRedirectPath] = useState('/dashboard');

    useEffect(() => {
        const savedPath = localStorage.getItem('authRedirectPath');
        if (savedPath) {
            setRedirectPath(savedPath);
            localStorage.removeItem('authRedirectPath');
        }
    }, []);

    useEffect(() => {
        if (user) {
            navigate(redirectPath);
        }
    }, [user, navigate, redirectPath]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter email and password.");
            return;
        }
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);

            toast.success("Login successful! Redirecting...");
            navigate('/dashboard');

        } catch (error: unknown) {
            console.error("Login Error:", error);
            const authError = error as FirebaseAuthErrorLike;
            if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential' || authError.code === 'auth/invalid-email') {
                toast.error("Invalid email or password.");
            } else {
                toast.error("Login failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && <Loader fullScreen />}
            <div className="min-h-[calc(100vh-80px)] flex">
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-6 md:p-12"
                >
                    <div className="w-full max-w-md space-y-6">
                        <div className="text-right w-full mb-4">
                            <span className="text-sm text-muted-foreground">Don't have an account? </span>
                            <Link to="/signup" className="font-semibold text-primary hover:underline text-sm">
                                Sign Up
                            </Link>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground font-heading">Welcome Back!</h1>
                        <p className="text-muted-foreground leading-relaxed">
                            Log in to access your dashboard, manage resumes, and discover job opportunities tailored for you.
                        </p>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label htmlFor="login-email">Email</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    placeholder="example@mail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-1"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <Label htmlFor="login-password">Password</Label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="mt-1"
                                    disabled={isLoading}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full text-base font-semibold py-6 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-primary/25 text-white mt-8 rounded-xl transition-all duration-300 hover:scale-[1.01]"
                                disabled={isLoading}
                            >
                                <LogIn className="mr-2 h-5 w-5" />
                                Sign In
                            </Button>
                        </form>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12 flex-col border-l border-border/40 bg-muted/10"
                >
                    {/* Landing Page Style Background for the right half */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-30" />
                    <div
                        className="absolute w-[500px] h-[500px] rounded-full opacity-20 animate-float-slow"
                        style={{
                            background: 'radial-gradient(circle, hsl(262 83% 58% / 0.3), transparent 70%)',
                            top: '5%', left: '15%',
                            willChange: 'transform',
                        }}
                    />
                    <div
                        className="absolute w-[400px] h-[400px] rounded-full opacity-15 animate-float-delayed"
                        style={{
                            background: 'radial-gradient(circle, hsl(217 91% 60% / 0.25), transparent 70%)',
                            bottom: '10%', right: '10%',
                            willChange: 'transform',
                        }}
                    />
                    
                    <div className="relative z-10 text-center space-y-8 max-w-lg">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto shadow-xl shadow-primary/20">
                            <Quote className="h-8 w-8 text-white" strokeWidth={2} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] font-heading text-foreground">
                            Craft Your Future.
                        </h2>
                        <p className="text-xl font-medium text-muted-foreground leading-relaxed">
                            "Leverage AI to build a resume that stands out and matches you with the perfect job."
                        </p>
                        <div className="pt-8 border-t border-border/40 mt-8 inline-block px-12">
                            <p className="font-bold text-lg tracking-wide text-foreground">Resuvio-AI</p>
                            <p className="text-sm text-muted-foreground font-medium mt-1">Your Career Advancement Partner</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default LoginPage;
