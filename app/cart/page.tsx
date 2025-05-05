"use client"
import { useCart } from "@/components/cart/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { StoreStatusBadge } from "@/components/store-status-badge"
import { useToast } from "@/components/ui/use-toast"

export default function CartPage() {
  const { items, removeItem, updateItemQuantity, updateItemNotes, subtotal, tax, total, isStoreOpen } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleCheckout = () => {
    if (!isStoreOpen) {
      toast({
        title: "Restaurante cerrado",
        description: "Lo sentimos, el restaurante está cerrado en este momento.",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Añade productos a tu carrito antes de continuar.",
        variant: "destructive",
      })
      return
    }

    router.push("/checkout")
  }

  const handleContinueShopping = () => {
    router.push("/menu")
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tu Carrito</h1>
        <StoreStatusBadge tenantId={user?.tenantId || ""} />
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Tu carrito está vacío</h2>
            <p className="text-muted-foreground mb-6">Añade productos para comenzar tu pedido</p>
            <Button onClick={handleContinueShopping}>Explorar Menú</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 mb-6">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {item.image && (
                      <div className="w-20 h-20 relative rounded-md overflow-hidden flex-shrink-0">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      </div>

                      <div className="flex items-center mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-2">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-auto"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      {item.extras.length > 0 && (
                        <div className="mt-2 pl-4 border-l-2 border-muted">
                          {item.extras.map((extra) => (
                            <div key={extra.id} className="flex justify-between text-sm">
                              <span>
                                {extra.quantity}x {extra.name}
                              </span>
                              <span>{formatCurrency(extra.price * extra.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-2">
                        <Textarea
                          placeholder="Instrucciones especiales..."
                          className="text-sm min-h-[60px]"
                          value={item.notes || ""}
                          onChange={(e) => updateItemNotes(item.id, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos (10%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleContinueShopping}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Seguir Comprando
              </Button>
              <Button onClick={handleCheckout} disabled={!isStoreOpen}>
                Continuar
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  )
}
