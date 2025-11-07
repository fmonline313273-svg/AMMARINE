"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"

export default function AdminAccessPage() {
  const [isLoading, setIsLoading] = useState(false)
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Access</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Click below to enter the admin dashboard
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleEnter}
            className="w-full bg-accent hover:bg-accent/90"
            disabled={isLoading}
          >
            <Lock className="mr-2 h-4 w-4" />
            {isLoading ? "Entering..." : "Enter Admin Dashboard"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
