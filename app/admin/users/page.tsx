"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import PageLayout from "@/components/page-layout"

interface User {
  id: string
  email: string
  username: string
  role: string
  isActive: boolean
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    email: "",
    username: "",
    password: "",
  })

  useEffect(() => {
    checkAuth()
    loadUsers()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/session")
      const data = await response.json()

      if (!data.user || data.user.role !== "admin") {
        router.push("/admin/login")
        return
      }
    } catch (error) {
      console.error("Auth check error:", error)
      router.push("/admin/login")
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to load users")
        if (response.status === 401) {
          router.push("/admin/login")
        }
        return
      }

      setUsers(data.users)
    } catch (error) {
      toast.error("Failed to load users")
      console.error("Load users error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to create user")
        return
      }

      toast.success("User created successfully!")
      setCreateDialogOpen(false)
      setNewUser({ email: "", username: "", password: "" })
      loadUsers()
    } catch (error) {
      toast.error("An error occurred while creating user")
      console.error("Create user error:", error)
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        toast.error("Failed to update user status")
        return
      }

      toast.success(`User ${!currentStatus ? "activated" : "deactivated"}`)
      loadUsers()
    } catch (error) {
      toast.error("An error occurred")
      console.error("Toggle user status error:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || "Failed to delete user")
        return
      }

      toast.success("User deleted successfully")
      loadUsers()
    } catch (error) {
      toast.error("An error occurred")
      console.error("Delete user error:", error)
    }
  }

  if (loading) {
    return (
      <PageLayout title="User Management">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="User Management">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Create and manage user accounts
                </CardDescription>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Enter user details to create a new account
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="username"
                        value={newUser.username}
                        onChange={(e) =>
                          setNewUser({ ...newUser, username: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        Create User
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "default" : "destructive"}
                        className={user.isActive ? "bg-green-600" : ""}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {user.role !== "admin" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </PageLayout>
  )
}

