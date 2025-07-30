"use client"
import { useEffect, useState } from "react"
import { X, AlertCircle, CheckCircle } from "lucide-react"

interface ToastProps {
  message: string
  type: "error" | "success"
  isVisible: boolean
  onClose: () => void
}

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  return (
    <div
      className={`fixed top-20 left-4 z-50 transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      }`}
    >
      <div
        className={`flex items-center p-4 rounded-lg shadow-lg border max-w-sm min-w-[300px] ${
          type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800"
        }`}
      >
        {type === "error" ? (
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
        ) : (
          <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
        )}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className={`ml-3 p-1 rounded-full hover:bg-opacity-20 ${
            type === "error" ? "hover:bg-red-200" : "hover:bg-green-200"
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Hook for managing toasts
export function useToast() {
  const [toast, setToast] = useState<{
    message: string
    type: "error" | "success"
    isVisible: boolean
  }>({
    message: "",
    type: "error",
    isVisible: false,
  })

  const showError = (message: string) => {
    setToast({ message, type: "error", isVisible: true })
  }

  const showSuccess = (message: string) => {
    setToast({ message, type: "success", isVisible: true })
  }

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }

  return {
    toast,
    showError,
    showSuccess,
    hideToast,
  }
}
