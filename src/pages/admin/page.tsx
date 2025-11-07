"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminAccessPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleEnter = async () => {
    setIsLoading(true)
    try {
      // Direct access: set a local token and navigate
      localStorage.setItem("adminToken", "1")
      navigate("/admin/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!username || !password) {
      setError("Please enter username and password")
      return
    }
    setIsLoading(true)
    try {
      if (username === "admin" && password === "admin123") {
        localStorage.setItem("adminToken", "1")
        navigate("/admin/dashboard")
      } else {
        setError("Invalid credentials")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Access</CardTitle>
          <p className="text-sm text-muted-foreground text-center">Sign in to enter the admin dashboard</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
              <Lock className="mr-2 h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={handleEnter} disabled={isLoading}>
              Quick enter (no auth)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
