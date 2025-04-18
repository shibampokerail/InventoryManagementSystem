"use client";

import { useState, useEffect } from "react";
import type React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Package, User, Shield, Save, Eye, EyeOff } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useWebSocket } from "@/context/WebSocketContext";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  slackId: string;
}

const getToken = () => {
  return localStorage.getItem("token");
};

const fetchWithAuth = async (endpoint: string, token: string, options: RequestInit = {}) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized: Invalid or revoked token");
    }
    throw new Error(`Failed to fetch data ${endpoint}: ${response.statusText} contact the administrator` );
  }

  return response.json();
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, error: authError } = useUser();
  const { socket, error: socketError } = useWebSocket();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [originalProfileData, setOriginalProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    const authenticate = async () => {
      try {
        if (authLoading) return;
        if (authError) {
          throw new Error("Auth0 authentication failed");
        }

        if (!user) {
          router.push("/api/auth/login");
          return;
        }

        const email = user.email;
        if (!email) {
          throw new Error("User email not found in Auth0 profile");
        }

        let jwtToken = getToken();
        if (!jwtToken) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          if (!response.ok) {
            throw new Error("Failed to authenticate with Flask server");
          }

          const data = await response.json();
          jwtToken = data.access_token;

          if (!jwtToken) {
            throw new Error("No JWT token received from Flask server");
          }

          localStorage.setItem("token", jwtToken);
        }

        setToken(jwtToken);
        setResetEmail(email);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        if (err instanceof Error && (err.message.includes("Auth0") || err.message.includes("email"))) {
          router.push("/api/auth/login");
        }
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, [user, authLoading, authError, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        const profile = await fetchWithAuth("/api/users/me", token);
        setProfileData(profile);
        setOriginalProfileData(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        if (err instanceof Error && err.message.includes("Unauthorized")) {
          localStorage.removeItem("token");
          router.push("/authapi/auth/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, router]);

  useEffect(() => {
    if (!socket || !profileData) return;

    socket.on("users_update", (updatedUser: UserProfile) => {
      if (updatedUser._id === profileData._id) {
        console.log("Updated user profile:", updatedUser);
        setProfileData(updatedUser);
        setOriginalProfileData(updatedUser);
      }
    });

    return () => {
      socket.off("users_update");
    };
  }, [socket, profileData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSelectChange = (value: string) => {
    setProfileData((prev) => (prev ? { ...prev, role: value } : prev));
  };

  const handleSaveProfile = async () => {
    if (!token || !profileData) return;

    try {
      await fetchWithAuth(`/api/users/${profileData._id}`, token, {
        method: "PUT",
        body: JSON.stringify(profileData),
      });
      setIsEditing(false);
      setOriginalProfileData(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await fetch(`/api/request-password-reset`, {
        method: "POST",
        body: JSON.stringify({ email: resetEmail }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        alert("Password reset email sent!");
      } else {
        alert("Failed to send password reset email.");
      }
    } catch (err) {
      alert("An error occurred while sending the reset email.");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-50/50 dark:bg-purple-950/50">
        <p className="text-purple-900 dark:text-purple-50">Loading...</p>
      </div>
    );
  }

  if (error || socketError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-50/50 dark:bg-purple-950/50">
        <p className="text-red-500">{error || socketError}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-50/50 dark:bg-purple-950/50">
        <p className="text-red-500">Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b bg-purple-50 dark:bg-purple-950">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-purple-700 dark:text-purple-300" />
            <span className="font-bold text-lg text-purple-900 dark:text-purple-50">U&I Services</span>
          </div>
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6 bg-purple-50/50 dark:bg-purple-950/50">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-50">My Profile</h2>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <Button className="bg-purple-700 hover:bg-purple-800 text-white" onClick={handleSaveProfile}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            ) : (
              <Button className="bg-purple-700 hover:bg-purple-800 text-white" onClick={() => setIsEditing(true)}>
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
        <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Profile Information</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  {isEditing ? "Update your personal information" : "View your personal information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-purple-900 dark:text-purple-50">
                        Full Name
                      </Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          className="border-purple-200 dark:border-purple-800"
                        />
                      ) : (
                        <div className="text-purple-900 dark:text-purple-50 font-medium">{profileData.name}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-purple-900 dark:text-purple-50">
                        Email Address
                      </Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          className="border-purple-200 dark:border-purple-800"
                        />
                      ) : (
                        <div className="text-purple-900 dark:text-purple-50 font-medium">{profileData.email}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-purple-900 dark:text-purple-50">
                        Role
                      </Label>
                      {isEditing ? (
                        <Select defaultValue={profileData.role} onValueChange={handleSelectChange}>
                          <SelectTrigger className="border-purple-200 dark:border-purple-800">
                            <SelectValue placeholder={profileData.role} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="employee">employee</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-purple-900 dark:text-purple-50 font-medium">
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-100">
                            {profileData.role}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2"> 
                    <Label htmlFor="slackId" className="text-purple-900 dark:text-purple-50">
                      Slack ID:
                    </Label>
                    {isEditing ? (
                      <Input
                      id="slackId"
                      name="slackId"
                      value={profileData.slackId}
                      onChange={handleInputChange}
                      className="border-purple-200 dark:border-purple-800"
                      />
                    ) : (
                      <div className="text-purple-900 dark:text-purple-50 font-medium">{profileData.slackId}</div>
                    )}
                    </div>
                    
 
                  </div>
                  
               
                
              </div>
              </CardContent>
              {isEditing && (
                <CardFooter className="flex justify-end space-x-2 border-t border-purple-100 dark:border-purple-800 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData(originalProfileData);
                    }}
                    className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                  >
                    Cancel
                  </Button>
                  <Button className="bg-purple-700 hover:bg-purple-800 text-white" onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </CardFooter>
              )}
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-50">Reset Password</CardTitle>
                <CardDescription className="text-purple-700 dark:text-purple-300">
                  Receive a password reset link via email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-purple-900 dark:text-purple-50">
                    Email Address
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="border-purple-200 dark:border-purple-800"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 border-t border-purple-100 dark:border-purple-800 pt-4">
                <Button className="bg-purple-700 hover:bg-purple-800 text-white" onClick={handleResetPassword}>
                  Send Reset Link
                </Button>
              </CardFooter>
            </Card>
      </div>
    </div>
  );
}