"use client"
import { useEffect } from "react"

interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  product: any // Replace 'any' with the actual product type
  tenantId: string
  branchId: string
}

export function ProductDetailModal({ isOpen, onClose, product, tenantId, branchId }: ProductDetailModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = "unset"
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{product?.name}</h2>
          <p className="text-gray-700 mb-4">{product?.description}</p>
          <p className="text-lg font-semibold">Price: ${product?.price?.toFixed(2)}</p>
        </div>
        <div className="px-6 py-4 bg-gray-100 text-right">
          <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
