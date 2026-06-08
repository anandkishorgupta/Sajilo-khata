import { getCategories } from "@/api/categories"
import { createProduct, updateProduct } from "@/api/inventory"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, ChevronsUpDown, Package } from "lucide-react"
import { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"

type Props = {
  open: boolean
  onClose: () => void
  product?: any
  onSuccess?: () => void
}

type FormValues = {
  name: string
  barcode: string
  categoryId: number
  purchasePrice: number
  sellingPrice: number
  stock: number
  lowStockLimit: number
  expiryDate: string
}

const defaultValues: FormValues = {
  name: "",
  barcode: "",
  categoryId: 0,
  purchasePrice: 0,
  sellingPrice: 0,
  stock: 0,
  lowStockLimit: 0,
  expiryDate: "",
}

export default function AddProductSheet({
  open,
  onClose,
  product,
  onSuccess,
}: Props) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [categoryOpen, setCategoryOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    select: (res) => res?.data?.data ?? [],
  })

  // Cleanup preview URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFilePicker,
  } = useDropzone({
    multiple: false,
    noClick: false,
    noKeyboard: true,
    maxSize: 5 * 1024 * 1024,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0]
        if (error.code === "file-too-large") {
          alert("File is too large. Max size is 5MB.")
        } else {
          alert("Invalid file type. Please upload an image.")
        }
        return
      }

      const file = acceptedFiles[0]
      if (!file) return

      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview)
      }

      setImageFile(file)
      setPreview(URL.createObjectURL(file))
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues })

  // Register categoryId once with validation — no hidden input needed
  useEffect(() => {
    register("categoryId", {
      required: "Category is required",
      validate: (v) => v !== 0 || "Category is required",
    })
  }, [register])

  // Reset form when product changes (edit mode)
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        barcode: product.barcode || "",
        categoryId: product.category?.id || 0,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        stock: product.stock,
        lowStockLimit: product.lowStockLimit,
        expiryDate: product.expiryDate || "",
      })
      setPreview(product.imageUrl || "")
      setImageFile(null)
    } else {
      reset(defaultValues)
      setPreview("")
      setImageFile(null)
    }
  }, [product, reset])

  // Live margin preview
  const purchasePrice = watch("purchasePrice")
  const sellingPrice = watch("sellingPrice")
  const categoryId = watch("categoryId")

  const margin =
    purchasePrice > 0 && sellingPrice > 0
      ? Math.round(((sellingPrice - purchasePrice) / sellingPrice) * 100)
      : null

  const getMarginColor = () => {
    if (margin === null) return ""
    if (margin >= 20) return "bg-green-500/10 text-green-500"
    if (margin >= 10) return "bg-yellow-500/10 text-yellow-500"
    return "bg-red-500/10 text-red-500"
  }

  const selectedCategoryName = categoryId
    ? (categories as any[]).find((c) => c.id === categoryId)?.name
    : null

  async function onSubmit(data: FormValues) {
    try {
      const payload = {
        name: data.name,
        barcode: data.barcode,
        categoryId: data.categoryId,
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        stock: data.stock,
        lowStockLimit: data.lowStockLimit,
        expiryDate: data.expiryDate || undefined,
      }

      if (product) {
        await updateProduct(product.id, payload, imageFile || undefined)
        toast.success("Product updated successfully!")
      } else {
        await createProduct(payload, imageFile || undefined)
        toast.success("Product added successfully!")
      }

      await queryClient.invalidateQueries({ queryKey: ["products"] })
      await queryClient.invalidateQueries({ queryKey: ["inventory-stats"] })

      // Reset state before calling onSuccess to avoid stale flash
      handleClose()
      onSuccess?.()
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Something went wrong"
      toast.error(message)
      setError("root", { message })
    }
  }

  function handleClose() {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview)
    }
    reset(defaultValues)
    setImageFile(null)
    setPreview("")
    setCategoryOpen(false)
    onClose()
  }

  const removeImage = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview)
    }
    setImageFile(null)
    setPreview("")
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        {/* Header */}
        <SheetHeader className="flex flex-row items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <SheetTitle>{product ? "Edit Product" : "Add Product"}</SheetTitle>
            <SheetDescription className="text-xs">
              Fill in the details below
            </SheetDescription>
          </div>
        </SheetHeader>

        {/* Body */}
        <form
          id="add-product-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 space-y-6 overflow-y-auto px-6 py-5"
        >
          {/* Root / API error */}
          {errors.root && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errors.root.message}
            </div>
          )}

          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Basic Info
            </h3>

            <Field label="Product Name" error={errors.name?.message} required>
              <Input
                placeholder="e.g. Wai Wai Chicken Noodles"
                {...register("name", {
                  required: "Product name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Barcode" error={errors.barcode?.message} required>
                <Input
                  placeholder="e.g. 8901234567890"
                  className="font-mono"
                  {...register("barcode", {
                    required: "Barcode is required",
                    minLength: {
                      value: 3,
                      message: "Barcode must be valid",
                    },
                  })}
                />
              </Field>

              {/* Combobox for category — searchable, keyboard navigable */}
              <Field
                label="Category"
                error={errors.categoryId?.message}
                required
              >
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className="w-full justify-between font-normal"
                    >
                      <span className="truncate">
                        {selectedCategoryName ?? "Select category..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search category..." />
                      <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                          {(categories as any[]).map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.name}
                              onSelect={() => {
                                setValue("categoryId", c.id, {
                                  shouldValidate: true,
                                })
                                setCategoryOpen(false)
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 transition-opacity ${
                                  categoryId === c.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              {c.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </Field>
            </div>

            {/* Expiry Date */}
            <Field
              label="Expiry Date (Optional)"
              error={errors.expiryDate?.message}
            >
              <Input type="date" {...register("expiryDate")} />
            </Field>

            {/* Image upload */}
            <Field label="Product Image">
              <div
                {...getRootProps()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
                  isDragActive ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <input {...getInputProps()} />

                {preview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={preview}
                      alt="Product preview"
                      className="h-40 w-full max-w-[220px] rounded-xl border object-cover shadow-sm"
                    />
                    {imageFile && (
                      <p className="max-w-[220px] truncate text-xs text-muted-foreground">
                        {imageFile.name}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openFilePicker()
                        }}
                      >
                        Change Image
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage()
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-medium">Drag & drop image here</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      or click to browse (max 5MB)
                    </p>
                  </>
                )}
              </div>
            </Field>
          </section>

          <Separator />

          {/* Pricing */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Pricing
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Purchase Price (Rs)"
                error={errors.purchasePrice?.message}
                required
              >
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="0"
                  {...register("purchasePrice", {
                    valueAsNumber: true,
                    required: "Purchase price is required",
                    min: { value: 0, message: "Price cannot be negative" },
                    // Re-validate sellingPrice whenever purchasePrice changes
                    onChange: () => trigger("sellingPrice"),
                  })}
                />
              </Field>

              <Field
                label="Selling Price (Rs)"
                error={errors.sellingPrice?.message}
                required
              >
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="0"
                  {...register("sellingPrice", {
                    valueAsNumber: true,
                    required: "Selling price is required",
                    min: { value: 0, message: "Price cannot be negative" },
                    validate: (value) =>
                      value >= (purchasePrice || 0) ||
                      "Selling price must be ≥ purchase price",
                  })}
                />
              </Field>
            </div>

            {/* Live margin badge */}
            {margin !== null && (
              <div
                className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm ${getMarginColor()}`}
              >
                <span>Profit margin</span>
                <span className="font-bold">{margin}%</span>
              </div>
            )}
          </section>

          <Separator />

          {/* Stock */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Stock
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Current Stock"
                error={errors.stock?.message}
                required
              >
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  {...register("stock", {
                    valueAsNumber: true,
                    required: "Current stock is required",
                    min: { value: 0, message: "Stock cannot be negative" },
                  })}
                />
              </Field>

              <Field
                label="Low Stock Alert"
                error={errors.lowStockLimit?.message}
                required
              >
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  {...register("lowStockLimit", {
                    valueAsNumber: true,
                    required: "Low stock alert level is required",
                    min: { value: 0, message: "Value cannot be negative" },
                  })}
                />
              </Field>
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-product-form"
            className="bg-gradient-primary shadow-glow flex-1 cursor-pointer text-primary-foreground"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : product
                ? "Update Product"
                : "Add Product"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Helper component for form fields
function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}