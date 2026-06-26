import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Quote } from 'lucide-react';
import { toast } from "sonner";
import { motion } from "framer-motion";
import apiClient from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/ui/loader';

type ApiErrorLike = {
    response?: {
        data?: {
            message?: string;
        };
    };
};

const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [redirectPath, setRedirectPath] = useState('/dashboard');

    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !displayName) {
            toast.error("Please fill in all fields.");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiClient.post('/api/auth/signup', {
                email,
                password,
                displayName
            });

            toast.success(`Signup successful for ${response.data.displayName}! Please log in.`);

            navigate('/login');

        } catch (error: unknown) {
            console.error("Signup Error:", error);
            const apiError = error as ApiErrorLike;
            if (apiError.response?.data?.message) {
                toast.error(`Signup failed: ${apiError.response.data.message}`);
            } else {
                toast.error("Signup failed. Please try again.");
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
                            <span className="text-sm text-muted-foreground">Already have an account? </span>
                            <Link to="/login" className="font-semibold text-primary hover:underline text-sm">
                                Log In
                            </Link>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground font-heading">Join Resuvio-AI</h1>
                        <p className="text-muted-foreground leading-relaxed">
                            Create your account to unlock powerful tools designed to accelerate your job search and land your dream role.
                        </p>

                        <form onSubmit={handleSignup} className="space-y-4 pt-4">
                            <div>
                                <Label htmlFor="signup-name">Name</Label>
                                <Input
                                    id="signup-name"
                                    placeholder="Your Name"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required
                                    className="mt-1"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <Label htmlFor="signup-email">Email</Label>
                                <Input
                                    id="signup-email"
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
                                <Label htmlFor="signup-password">Password</Label>
                                <Input
                                    id="signup-password"
                                    type="password"
                                    placeholder="Create a password (min. 6 characters)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="mt-1"
                                    disabled={isLoading}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full text-base font-semibold py-6 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-primary/25 text-white mt-8 rounded-xl transition-all duration-300 hover:scale-[1.01]"
                                disabled={isLoading}
                            >
                                <UserPlus className="mr-2 h-5 w-5" />
                                Create Account
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
                            top: '5%', right: '15%',
                            willChange: 'transform',
                        }}
                    />
                    <div
                        className="absolute w-[400px] h-[400px] rounded-full opacity-15 animate-float-delayed"
                        style={{
                            background: 'radial-gradient(circle, hsl(217 91% 60% / 0.25), transparent 70%)',
                            bottom: '10%', left: '10%',
                            willChange: 'transform',
                        }}
                    />
                    
                    <div className="relative z-10 text-center space-y-8 max-w-lg">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto shadow-xl shadow-primary/20">
                            <Quote className="h-8 w-8 text-white" strokeWidth={2} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] font-heading text-foreground">
                            Your Next Career Move.
                        </h2>
                        <p className="text-xl font-medium text-muted-foreground leading-relaxed">
                            "Stop guessing, start impressing. Let our AI guide you to a better resume and the right opportunities."
                        </p>
                        <div className="pt-8 border-t border-border/40 mt-8 inline-block px-12">
                            <p className="font-bold text-lg tracking-wide text-foreground">Resuvio-AI</p>
                            <p className="text-sm text-muted-foreground font-medium mt-1">Intelligent Career Tools</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default SignupPage;
