"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PlusCircle, MinusCircle, ArrowLeft, Upload, Loader2, X } from "lucide-react"
import { productService } from "@/lib/services/product-service"
import { categoryService } from "@/lib/services/category-service"
import { useBranch } from "@/lib/hooks/use-branch"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import type { ProductExtra, ProductExtraOption } from "@/lib/types/products"

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  discountedPrice: z.coerce.number().min(0, "Discounted price must be a positive number").optional(),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
})

export default function CreateProductPage() {
  const { tenantId } = useParams<{ tenantId: string }>()
  const router = useRouter()
  const { selectedBranch } = useBranch()

  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [extras, setExtras] = useState<ProductExtra[]>([])

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      available: true,
      featured: false,
    },
  })

  useEffect(() => {
    if (!selectedBranch) return

    const fetchCategories = async () => {
      try {
        setLoading(true)
        const categoriesData = await categoryService.getCategories(tenantId, selectedBranch.id)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [tenantId, selectedBranch])

  const handleCategoryChange = async (categoryId: string) => {
    if (!selectedBranch || !categoryId) {
      setSubcategories([])
      return
    }

    try {
      const subcategoriesData = await categoryService.getSubcategories(tenantId, selectedBranch.id, categoryId)
      setSubcategories(subcategoriesData)
    } catch (error) {
      console.error("Error fetching subcategories:", error)
      setSubcategories([])
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      setImageUrl(data.url)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setUploadingImage(false)
    }
  }

  const addExtra = () => {
    const newExtra: ProductExtra = {
      id: uuidv4(),
      name: "",
      required: false,
      minSelect: 0,
      maxSelect: 1,
      options: [],
    }

    setExtras([...extras, newExtra])
  }

  const removeExtra = (extraId: string) => {
    setExtras(extras.filter((extra) => extra.id !== extraId))
  }

  const updateExtra = (extraId: string, field: keyof ProductExtra, value: any) => {
    setExtras(
      extras.map((extra) => {
        if (extra.id === extraId) {
          return { ...extra, [field]: value }
        }
        return extra
      }),
    )
  }

  const addExtraOption = (extraId: string) => {
    const newOption: ProductExtraOption = {
      id: uuidv4(),
      name: "",
      additionalPrice: 0,
    }

    setExtras(
      extras.map((extra) => {
        if (extra.id === extraId) {
          return { ...extra, options: [...extra.options, newOption] }
        }
        return extra
      }),
    )
  }

  const removeExtraOption = (extraId: string, optionId: string) => {
    setExtras(
      extras.map((extra) => {
        if (extra.id === extraId) {
          return { ...extra, options: extra.options.filter((option) => option.id !== optionId) }
        }
        return extra
      }),
    )
  }

  const updateExtraOption = (extraId: string, optionId: string, field: keyof ProductExtraOption, value: any) => {
    setExtras(
      extras.map((extra) => {
        if (extra.id === extraId) {
          return {
            ...extra,
            options: extra.options.map((option) => {
              if (option.id === optionId) {
                return { ...option, [field]: value }
              }
              return option
            }),
          }
        }
        return extra
      }),
    )
  }

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    if (!selectedBranch) return

    try {
      setSubmitting(true)

      // Validate extras
      const validatedExtras = extras.filter((extra) => extra.name.trim() !== "")

      // Validate extra options
      const extrasWithValidOptions = validatedExtras.map((extra) => ({
        ...extra,
        options: extra.options.filter((option) => option.name.trim() !== ""),
      }))

      // Filter out extras with no options
      const finalExtras = extrasWithValidOptions.filter((extra) => extra.options.length > 0)

      await productService.createProduct(tenantId, selectedBranch.id, {
        ...values,
        imageUrl: imageUrl || undefined,
        extras: finalExtras.length > 0 ? finalExtras : undefined,
      })

      router.push(`/tenant/${tenantId}/admin/products`)
    } catch (error) {
      console.error("Error creating product:", error)
      alert("Failed to create product. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!selectedBranch) {
    return <NoBranchSelectedAlert />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/tenant/${tenantId}/admin/products`)}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Create Product</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details of your product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Product description" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountedPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discounted Price (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : Number.parseFloat(e.target.value)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormLabel>Product Image</FormLabel>
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 rounded-md border overflow-hidden">
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt="Product"
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => setImageUrl(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        {uploadingImage ? (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="product-image"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("product-image")?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
              <CardDescription>Select the category for your product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleCategoryChange(value)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {subcategories.length > 0 && (
                <FormField
                  control={form.control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subcategory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
              <CardDescription>Configure additional options for your product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Available</FormLabel>
                      <FormDescription>Make this product available for purchase.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured</FormLabel>
                      <FormDescription>Show this product in featured sections.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Extras</CardTitle>
                <CardDescription>Add customizable options for your product.</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addExtra}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Extra
              </Button>
            </CardHeader>
            <CardContent>
              {extras.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No extras added yet. Click "Add Extra" to create customizable options.
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-4">
                  {extras.map((extra, extraIndex) => (
                    <AccordionItem key={extra.id} value={extra.id} className="border rounded-lg">
                      <AccordionTrigger className="px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{extra.name || `Extra ${extraIndex + 1}`}</span>
                          {extra.required && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Required</span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-2">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <FormLabel>Name</FormLabel>
                              <Input
                                value={extra.name}
                                onChange={(e) => updateExtra(extra.id, "name", e.target.value)}
                                placeholder="Size, Toppings, etc."
                              />
                            </div>
                            <div>
                              <FormLabel>Description (Optional)</FormLabel>
                              <Input
                                value={extra.description || ""}
                                onChange={(e) => updateExtra(extra.id, "description", e.target.value)}
                                placeholder="Choose your size, etc."
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <FormLabel className="text-sm">Required</FormLabel>
                              <Switch
                                checked={extra.required}
                                onCheckedChange={(checked) => updateExtra(extra.id, "required", checked)}
                              />
                            </div>

                            <div>
                              <FormLabel>Min Selection</FormLabel>
                              <Input
                                type="number"
                                min="0"
                                value={extra.minSelect}
                                onChange={(e) => updateExtra(extra.id, "minSelect", Number.parseInt(e.target.value))}
                              />
                            </div>

                            <div>
                              <FormLabel>Max Selection</FormLabel>
                              <Input
                                type="number"
                                min="1"
                                value={extra.maxSelect}
                                onChange={(e) => updateExtra(extra.id, "maxSelect", Number.parseInt(e.target.value))}
                              />
                            </div>
                          </div>

                          <div>
                            <FormLabel>Base Price (Optional)</FormLabel>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={extra.basePrice || ""}
                              onChange={(e) => {
                                const value = e.target.value === "" ? undefined : Number.parseFloat(e.target.value)
                                updateExtra(extra.id, "basePrice", value)
                              }}
                              placeholder="0.00"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Base price will be added to the product price when this extra is selected.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <FormLabel>Options</FormLabel>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addExtraOption(extra.id)}
                              >
                                <PlusCircle className="mr-2 h-3 w-3" />
                                Add Option
                              </Button>
                            </div>

                            {extra.options.length === 0 ? (
                              <div className="text-center py-3 text-sm text-muted-foreground border rounded-md">
                                No options added yet. Click "Add Option" to create options.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {extra.options.map((option, optionIndex) => (
                                  <div
                                    key={option.id}
                                    className="grid grid-cols-[1fr,auto,auto] gap-2 items-center border rounded-md p-2"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      <Input
                                        value={option.name}
                                        onChange={(e) => updateExtraOption(extra.id, option.id, "name", e.target.value)}
                                        placeholder={`Option ${optionIndex + 1}`}
                                      />
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={option.additionalPrice}
                                        onChange={(e) =>
                                          updateExtraOption(
                                            extra.id,
                                            option.id,
                                            "additionalPrice",
                                            Number.parseFloat(e.target.value),
                                          )
                                        }
                                        placeholder="Additional price"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeExtraOption(extra.id, option.id)}
                                      className="text-red-600"
                                    >
                                      <MinusCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <Button type="button" variant="destructive" onClick={() => removeExtra(extra.id)}>
                            Remove Extra
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push(`/tenant/${tenantId}/admin/products`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
