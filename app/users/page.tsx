"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Package, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useWebSocket } from "@/context/WebSocketContext";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { users, setUsers, roles, setRoles, error: wsError } = useWebSocket();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    slackId: "",
  });

  const getToken = () => localStorage.getItem("token");

  const fetchWithAuth = async (endpoint: string, options: { method?: string; body?: string; headers?: Record<string, string> } = {}) => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

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
        router.push("/api/auth/login");
        throw new Error("Unauthorized: Invalid or expired token. Please log in again.");
      }
      if (response.status === 403) throw new Error("Forbidden: You do not have permission to perform this action.");
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    return response.json();
  };

  const fetchData = async () => {
    try {
      const usersData = await fetchWithAuth("/api/users");
      setUsers(usersData);
      const defaultRoles = ["admin", "manager", "employee"];
      const uniqueRoles = Array.from(new Set([...defaultRoles, ...usersData.map((user: User) => user.role)]));
      setRoles(uniqueRoles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (isEditingUser && editingUser) {
      setEditingUser((prev) => (prev ? { ...prev, [id]: value } : null));
    } else {
      setNewUser((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleRoleChange = (value: string) => {
    if (isEditingUser && editingUser) {
      setEditingUser((prev) => (prev ? { ...prev, role: value } : null));
    } else {
      setNewUser((prev) => ({ ...prev, role: value }));
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.slackId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userData = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        slackId: newUser.slackId,
      };

      await fetchWithAuth("/api/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      toast({
        title: "User Added",
        description: `${newUser.name} has been added successfully.`,
        variant: "success",
      });

      setNewUser({
        name: "",
        email: "",
        role: "",
        slackId: "",
      });
      setIsAddingUser(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditingUser(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editingUser.name || !editingUser.email || !editingUser.role || !editingUser.slackId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedUserData = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        slackId: editingUser.slackId,
      };

      await fetchWithAuth(`/api/users/${editingUser._id}`, {
        method: "PUT",
        body: JSON.stringify(updatedUserData),
      });

      toast({
        title: "User Updated",
        description: `${editingUser.name} has been updated successfully.`,
        variant: "success",
      });

      setEditingUser(null);
      setIsEditingUser(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await fetchWithAuth(`/api/users/${userId}`, {
        method: "DELETE",
      });

      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="text-purple-900 dark:text-purple-50 p-8">Loading...</div>;
  if (error || wsError) return <div className="text-red-500 p-8">{error || wsError}</div>;

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
          <h2 className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-50">User Management</h2>
          <div className="flex items-center space-x-2">
            <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
              <DialogTrigger asChild>
                <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] border-purple-200 dark:border-purple-800">
                <DialogHeader>
                  <DialogTitle className="text-purple-900 dark:text-purple-50">Add New User</DialogTitle>
                  <DialogDescription className="text-purple-700 dark:text-purple-300">
                    Create a new user account. Only admin can create new users.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right text-purple-900 dark:text-purple-50">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="col-span-3 border-purple-200 dark:border-purple-800"
                      value={newUser.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right text-purple-900 dark:text-purple-50">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@union.edu"
                      className="col-span-3 border-purple-200 dark:border-purple-800"
                      value={newUser.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right text-purple-900 dark:text-purple-50">
                      Role
                    </Label>
                    <Select value={newUser.role} onValueChange={handleRoleChange}>
                      <SelectTrigger id="role" className="col-span-3 border-purple-200 dark:border-purple-800">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="slackId" className="text-right text-purple-900 dark:text-purple-50">
                      Slack ID
                    </Label>
                    <Input
                      id="slackId"
                      placeholder="Uasdf12345"
                      className="col-span-3 border-purple-200 dark:border-purple-800"
                      value={newUser.slackId}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingUser(false)}
                    className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                  >
                    Cancel
                  </Button>
                  <Button className="bg-purple-700 hover:bg-purple-800 text-white" onClick={handleAddUser}>
                    Add User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-50">User Accounts</CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Manage user accounts and their access levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
              <div className="flex flex-1 items-center space-x-2">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm border-purple-200 dark:border-purple-800"
                />
              </div>
              <div className="flex flex-row space-x-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px] border-purple-200 dark:border-purple-800">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border border-purple-200 dark:border-purple-800">
              <Table>
                <TableHeader className="bg-purple-100 dark:bg-purple-900">
                  <TableRow>
                    <TableHead className="text-purple-900 dark:text-purple-50">User</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Email</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Role</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Slack ID</TableHead>
                    <TableHead className="text-purple-900 dark:text-purple-50">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-purple-700 dark:text-purple-300">
                        No users found matching your search criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id} className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                        <TableCell className="font-medium text-purple-900 dark:text-purple-50">
                          <div className="flex items-center">
                            {user.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-purple-700 dark:text-purple-300">{user.email}</TableCell>
                        <TableCell className="text-purple-700 dark:text-purple-300">
                          <Badge
                            className={
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-100"
                                : user.role === "manager"
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100"
                                  : "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-purple-700 dark:text-purple-300">{user.slackId}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                              onClick={() => handleEditUser(user)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditingUser} onOpenChange={setIsEditingUser}>
          <DialogContent className="sm:max-w-[600px] border-purple-200 dark:border-purple-800">
            <DialogHeader>
              <DialogTitle className="text-purple-900 dark:text-purple-50">Edit User</DialogTitle>
              <DialogDescription className="text-purple-700 dark:text-purple-300">
                Update the user’s information
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-purple-900 dark:text-purple-50">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="col-span-3 border-purple-200 dark:border-purple-800"
                    value={editingUser.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right text-purple-900 dark:text-purple-50">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@union.edu"
                    className="col-span-3 border-purple-200 dark:border-purple-800"
                    value={editingUser.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right text-purple-900 dark:text-purple-50">
                    Role
                  </Label>
                  <Select value={editingUser.role} onValueChange={handleRoleChange}>
                    <SelectTrigger id="role" className="col-span-3 border-purple-200 dark:border-purple-800">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="slackId" className="text-right text-plot-purple-900 dark:text-purple-50">
                    Slack ID
                  </Label>
                  <Input
                    id="slackId"
                    placeholder="Uasdf12345"
                    className="col-span-3 border-purple-200 dark:border-purple-800"
                    value={editingUser.slackId}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditingUser(false)}
                className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900"
              >
                Cancel
              </Button>
              <Button className="bg-purple-700 hover:bg-purple-800 text-white" onClick={handleUpdateUser}>
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}