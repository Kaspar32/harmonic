"use client"

import { ReactNode } from "react"

type PopUpProps = {
  onClose: () => void
  children: ReactNode
  width?: string
  bgColor?: string
}

export default function PopUp({
  onClose,
  children,
  width = "max-w-128",
  bgColor = "bg-white/50",
}: PopUpProps) {
  return (
    <div onClick={onClose}
    className="fixed inset-0 flex items-center justify-center bg-white/80 z-[100]">
      <div 
      onClick={(e) => e.stopPropagation()}
      className={`${bgColor} m-4 rounded-2xl shadow-lg w-full ${width} max-h-[90vh] flex flex-col`}>
        <div className="flex justify-end p-2 pb-0 shrink-0">
          <button
            onClick={onClose}
            className="text-black bg-yellow-200 hover:bg-yellow-100 px-3 py-1 rounded font-bold"
          >
            X
          </button>
        </div>
        <div className="p-6 pt-2 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
