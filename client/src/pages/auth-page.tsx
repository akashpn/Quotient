import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z
    .string()
    .min(6, {
      message: "Password must be at least 6 characters",
    })
    .max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  // Handle login form submission
  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };
  
  // Handle register form submission
  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    const { confirmPassword, ...registerData } = values;
    registerMutation.mutate(registerData);
  };
  
  // After hooks are called, redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left column with form */}
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto lg:w-96">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Quotient</h1>
            <h2 className="mt-2 text-xl text-muted-foreground">
              Collaborative Code Editor
            </h2>
          </div>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          "Login"
                        )}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                      className="text-primary underline"
                      onClick={() => setActiveTab("register")}
                    >
                      Register
                    </button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Register</CardTitle>
                  <CardDescription>
                    Create a new account to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button className="w-full" type="submit" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Register"
                        )}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      className="text-primary underline"
                      onClick={() => setActiveTab("login")}
                    >
                      Login
                    </button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right column with hero image/description */}
      <div className="relative flex-1 hidden lg:block">
        <div className="absolute inset-0 flex flex-col justify-center p-12 bg-muted">
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold tracking-tight">
              Collaborative Code Editing in Real-Time
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Quotient is a powerful online code editor that supports over 15 programming languages with
              real-time collaboration features, allowing multiple developers to work on the same file simultaneously.
            </p>
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Key Features</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-primary"></div>
                  <span>Real-time collaboration with multiple users</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-primary"></div>
                  <span>Support for 15+ programming languages</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-primary"></div>
                  <span>Code execution for JavaScript, TypeScript, and Python</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-primary"></div>
                  <span>Project organization with files and folders</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-primary"></div>
                  <span>Share projects with team members</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}