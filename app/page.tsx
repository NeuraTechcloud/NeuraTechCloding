"use client"

import { useState, useEffect } from "react"
import Homepage from "@/components/homepage"
import LoginPage from "@/components/login-page"
import Dashboard from "@/components/dashboard"

export default function RastreRamos() {
  const [currentPage, setCurrentPage] = useState<"homepage" | "login" | "dashboard">("homepage")
  const [userType, setUserType] = useState<"guest" | "client" | null>(null)

  useEffect(() => {
    if (currentPage === "dashboard" || currentPage === "login") {
      document.body.classList.add("overflow-hidden")
      document.documentElement.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
      document.documentElement.classList.remove("overflow-hidden")
    }

    return () => {
      document.body.classList.remove("overflow-hidden")
      document.documentElement.classList.remove("overflow-hidden")
    }
  }, [currentPage])

  const handleLogin = (type: "guest" | "client") => {
    setUserType(type)
    setCurrentPage("dashboard")
  }

  const handleLogout = () => {
    setUserType(null)
    setCurrentPage("homepage")
  }

  return (
    <div className="min-h-screen">
      {currentPage === "homepage" && <Homepage onGoToLogin={() => setCurrentPage("login")} />}

      {currentPage === "login" && <LoginPage onLogin={handleLogin} onBackToHome={() => setCurrentPage("homepage")} />}

      {currentPage === "dashboard" && userType && <Dashboard userType={userType} onLogout={handleLogout} />}
    </div>
  )
}
