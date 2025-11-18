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
import { Loader2, Plus, Trash2, Coins, Minus } from "lucide-react"
import { toast } from "sonner"
import PageLayout from "@/components/page-layout"

interface User {
  id: string
  email: string
  username: string
  role: string
  isActive: boolean
  balance: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false)
  const [deallocateDialogOpen, setDeallocateDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [allocateAmount, setAllocateAmount] = useState<string>("")
  const [deallocateAmount, setDeallocateAmount] = useState<string>("")
  const [adminBalance, setAdminBalance] = useState<number>(0)
  const [newUser, setNewUser] = useState({
    email: "",
    username: "",
    password: "",
  })

  useEffect(() => {
    checkAuth()
    loadUsers()
    loadAdminBalance()
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

  const loadAdminBalance = async () => {
    try {
      const response = await fetch("/api/balance")
      if (response.ok) {
        const data = await response.json()
        setAdminBalance(data.balance || 0)
      }
    } catch (error) {
      console.error("Load admin balance error:", error)
    }
  }

  const handleOpenAllocateDialog = (user: User) => {
    setSelectedUser(user)
    setAllocateAmount("")
    setAllocateDialogOpen(true)
  }

  const handleOpenDeallocateDialog = (user: User) => {
    setSelectedUser(user)
    setDeallocateAmount("")
    setDeallocateDialogOpen(true)
  }

  const handleAllocateCoins = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser) return

    const amount = parseFloat(allocateAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    try {
      const response = await fetch("/api/admin/allocate-coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: amount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to allocate coins")
        return
      }

      toast.success(`Successfully allocated ₱${amount.toFixed(2)} to ${selectedUser.username}`)
      setAllocateDialogOpen(false)
      setSelectedUser(null)
      setAllocateAmount("")
      loadUsers()
      loadAdminBalance()
    } catch (error) {
      toast.error("An error occurred while allocating coins")
      console.error("Allocate coins error:", error)
    }
  }

  const handleDeallocateCoins = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser) return

    const amount = parseFloat(deallocateAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (amount > selectedUser.balance) {
      toast.error(`Amount exceeds user balance. User has ₱${selectedUser.balance.toFixed(2)}`)
      return
    }

    try {
      const response = await fetch("/api/admin/deallocate-coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: amount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to deallocate coins")
        return
      }

      toast.success(`Successfully deallocated ₱${amount.toFixed(2)} from ${selectedUser.username}`)
      setDeallocateDialogOpen(false)
      setSelectedUser(null)
      setDeallocateAmount("")
      loadUsers()
      loadAdminBalance()
    } catch (error) {
      toast.error("An error occurred while deallocating coins")
      console.error("Deallocate coins error:", error)
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
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-slate-900">
                Your Balance: <span className="text-green-600 font-bold">₱{adminBalance.toFixed(2)}</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                This is the amount you can allocate to users or use for orders
              </p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Balance</TableHead>
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
                      <span className="font-semibold text-green-600">
                        ₱{user.balance.toFixed(2)}
                      </span>
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
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleOpenAllocateDialog(user)}
                          >
                            <Coins className="w-4 h-4 mr-1" />
                            Allocate
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={() => handleOpenDeallocateDialog(user)}
                            disabled={user.balance <= 0}
                          >
                            <Minus className="w-4 h-4 mr-1" />
                            Deallocate
                          </Button>
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

        {/* Allocate Coins Dialog */}
        <Dialog open={allocateDialogOpen} onOpenChange={setAllocateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Allocate Coins to {selectedUser?.username}</DialogTitle>
              <DialogDescription>
                Allocate coins to this user. You can allocate any amount without restrictions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAllocateCoins} className="space-y-4">
              <div className="space-y-2">
                <Label>User Current Balance</Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="font-bold text-green-600">
                    ₱{selectedUser?.balance.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Allocate (₱)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Enter amount"
                  value={allocateAmount}
                  onChange={(e) => setAllocateAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  User will have ₱{((selectedUser?.balance || 0) + (parseFloat(allocateAmount) || 0)).toFixed(2)} after allocation
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAllocateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!allocateAmount || parseFloat(allocateAmount) <= 0}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Allocate Coins
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Deallocate Coins Dialog */}
        <Dialog open={deallocateDialogOpen} onOpenChange={setDeallocateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deallocate Coins from {selectedUser?.username}</DialogTitle>
              <DialogDescription>
                Remove coins from this user's balance. You can deallocate up to their current balance.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleDeallocateCoins} className="space-y-4">
              <div className="space-y-2">
                <Label>User Current Balance</Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="font-bold text-green-600">
                    ₱{selectedUser?.balance.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deallocateAmount">Amount to Deallocate (₱)</Label>
                <Input
                  id="deallocateAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedUser?.balance || 0}
                  placeholder="Enter amount"
                  value={deallocateAmount}
                  onChange={(e) => setDeallocateAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  User will have ₱{Math.max(0, (selectedUser?.balance || 0) - (parseFloat(deallocateAmount) || 0)).toFixed(2)} after deallocation
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeallocateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={!deallocateAmount || parseFloat(deallocateAmount) <= 0 || parseFloat(deallocateAmount) > (selectedUser?.balance || 0)}
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Deallocate Coins
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </PageLayout>
  )
}

