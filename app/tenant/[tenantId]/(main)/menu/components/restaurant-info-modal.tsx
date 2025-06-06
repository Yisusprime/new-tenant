"use client"

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react"
import type { RestaurantConfig } from "@/app/tenant/[tenantId]/(main)/menu/types"
import Image from "next/image"
import { useState } from "react"

interface Props {
  restaurantConfig: RestaurantConfig | undefined
}

export const RestaurantInfoModal = ({ restaurantConfig }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const restaurantName = restaurantConfig?.basicInfo?.name || "Restaurant Name"

  const [imageError, setImageError] = useState({ logo: false, banner: false })

  const handleLogoError = () => {
    setImageError((prev) => ({ ...prev, logo: true }))
  }

  const handleBannerError = () => {
    setImageError((prev) => ({ ...prev, banner: true }))
  }

  const logoUrl =
    restaurantConfig?.basicInfo?.logo && !imageError.logo
      ? restaurantConfig.basicInfo.logo
      : "/default-restaurant-logo.png"

  const bannerUrl =
    restaurantConfig?.basicInfo?.bannerImage && !imageError.banner
      ? restaurantConfig.basicInfo.bannerImage
      : "/default-restaurant-banner.png"

  return (
    <>
      <Button onPress={onOpen} variant="light">
        Restaurant Info
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{restaurantName}</ModalHeader>
              <ModalBody>
                <div className="relative w-full h-60">
                  <Image
                    src={bannerUrl || "/placeholder.svg"}
                    alt={`Banner de ${restaurantName}`}
                    fill
                    className="object-cover"
                    onError={handleBannerError}
                  />
                </div>
                <div className="flex items-center mt-4">
                  <div className="relative w-20 h-20 mr-4">
                    <Image
                      src={logoUrl || "/placeholder.svg"}
                      alt={`Logo de ${restaurantName}`}
                      fill
                      className="object-cover rounded-full"
                      onError={handleLogoError}
                    />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{restaurantName}</p>
                    <p className="text-sm text-gray-500">{restaurantConfig?.basicInfo?.cuisine || "Cuisine Type"}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-base">{restaurantConfig?.basicInfo?.description || "No description available."}</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
