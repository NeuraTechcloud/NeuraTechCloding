"use client"

import type React from "react"

import { useEffect } from "react"

interface ModalProps {
  children: React.ReactNode
  onClose: () => void
}

export default function Modal({ children, onClose }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center transition-opacity duration-300"
      style={{ zIndex: 9999 }}
    >
      <div
        className="bg-gray-800 text-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 10000 }}
      >
        {children}
      </div>
    </div>
  )
}
