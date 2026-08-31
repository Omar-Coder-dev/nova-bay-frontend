"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import api from "@/lib/api";
import { Product } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Loader2,
  Upload,
  Save,
  ImageIcon,
} from "lucide-react";

const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "home_and_kitchen", label: "Home & Kitchen" },
  { value: "beauty", label: "Beauty" },
  { value: "sports", label: "Sports" },
  { value: "books", label: "Books" },
];

interface ProductFormProps {
  existingProduct?: Product;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function ProductForm({
  existingProduct,
}: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = Boolean(existingProduct);

  const [name, setName] = useState(existingProduct?.name ?? "");
  const [description, setDescription] = useState(
    existingProduct?.description ?? ""
  );
  const [price, setPrice] = useState(
    existingProduct?.price?.toString() ?? ""
  );
  const [category, setCategory] = useState<string>(
    existingProduct?.category ?? "electronics"
  );
  const [stock, setStock] = useState(
    existingProduct?.stock?.toString() ?? ""
  );
  const [imageUrl, setImageUrl] = useState(
    existingProduct?.imageUrl ?? ""
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isBusy = uploading || saving;

  const getErrorMessage = (
    error: unknown,
    fallback: string
  ) => {
    const apiError = error as ApiError;

    return (
      apiError.response?.data?.message ||
      fallback
    );
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Reset input so the same file can be selected again.
    e.target.value = "";

    // Basic client-side validation.
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    // Prevent very large uploads from being sent unnecessarily.
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("Image must be smaller than 10MB.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post<{ imageUrl: string }>(
        "/products/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data.imageUrl) {
        throw new Error("No image URL returned.");
      }

      setImageUrl(response.data.imageUrl);

      toast.success("Image uploaded successfully.");
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Image upload failed. Please try again."
        )
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (isBusy) return;

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!trimmedName) {
      toast.error("Please enter a product name.");
      return;
    }

    if (!trimmedDescription) {
      toast.error("Please enter a product description.");
      return;
    }

    if (!imageUrl) {
      toast.error("Please upload a product image first.");
      return;
    }

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      toast.error("Please enter a valid price.");
      return;
    }

    if (
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      toast.error("Please enter a valid stock quantity.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: trimmedName,
        description: trimmedDescription,
        price: numericPrice,
        category,
        stock: numericStock,
        imageUrl,
      };

      if (isEditMode && existingProduct) {
        await api.patch(
          `/products/${existingProduct._id}`,
          payload
        );

        toast.success("Product updated successfully.");
      } else {
        await api.post("/products", payload);

        toast.success("Product created successfully.");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          isEditMode
            ? "Failed to update product."
            : "Failed to create product."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full max-w-xl
        space-y-5
        rounded-2xl
        border border-border
        bg-card
        p-4
        shadow-sm
        sm:p-6
      "
    >
      {/* Product Image */}
      <div className="space-y-3">
        <Label
          htmlFor="product-image"
          className="
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-muted-foreground
          "
        >
          Product Image
        </Label>

        {imageUrl ? (
          <div
            className="
              relative
              h-48
              w-48
              max-w-full
              overflow-hidden
              rounded-xl
              border
              border-border
              bg-muted
              sm:h-52
              sm:w-52
            "
          >
            <Image
              src={imageUrl}
              alt="Product preview"
              fill
              sizes="208px"
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div
            className="
              flex
              h-48
              w-48
              max-w-full
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              border-border
              bg-muted
              text-muted-foreground
              sm:h-52
              sm:w-52
            "
          >
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs">
                No image selected
              </span>
            </div>
          </div>
        )}

        <label
          htmlFor="product-image"
          className="
            flex
            h-11
            w-full
            cursor-pointer
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-border
            bg-muted
            px-4
            text-sm
            font-medium
            text-foreground
            transition-colors
            hover:bg-muted/70
            sm:w-fit
          "
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}

          {uploading
            ? "Uploading..."
            : imageUrl
              ? "Change Image"
              : "Upload Image"}

          <input
            ref={fileInputRef}
            id="product-image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isBusy}
            className="hidden"
          />
        </label>

        <p className="text-xs text-muted-foreground">
          JPG, PNG, WEBP or other image formats. Maximum 10MB.
        </p>
      </div>

      {/* Product Name */}
      <div className="space-y-2">
        <Label
          htmlFor="name"
          className="
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-muted-foreground
          "
        >
          Product Name
        </Label>

        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isBusy}
          autoComplete="off"
          className="border-border bg-muted"
          placeholder="Enter product name"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-muted-foreground
          "
        >
          Description
        </Label>

        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isBusy}
          rows={4}
          required
          placeholder="Describe the product..."
          className="
            w-full
            resize-y
            rounded-lg
            border
            border-border
            bg-muted
            p-3
            text-sm
            text-foreground
            outline-none
            placeholder:text-muted-foreground
            transition
            focus:border-blue-500
            focus:ring-1
            focus:ring-blue-500
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        />
      </div>

      {/* Price + Stock */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="price"
            className="
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-muted-foreground
            "
          >
            Price ($)
          </Label>

          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isBusy}
            className="border-border bg-muted"
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="stock"
            className="
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-muted-foreground
            "
          >
            Stock Quantity
          </Label>

          <Input
            id="stock"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            disabled={isBusy}
            className="border-border bg-muted"
            placeholder="0"
            required
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label
          htmlFor="category"
          className="
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-muted-foreground
          "
        >
          Category
        </Label>

        <Select
          value={category}
          onValueChange={setCategory}
          disabled={isBusy}
        >
          <SelectTrigger
            id="category"
            className="w-full border-border bg-muted"
          >
            <SelectValue placeholder="Select category" />
          </SelectTrigger>

          <SelectContent className="border-border bg-card text-foreground">
            {CATEGORIES.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isBusy}
        className="
          h-12
          w-full
          bg-blue-600
          font-semibold
          text-white
          transition-all
          hover:bg-blue-500
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {isEditMode
              ? "Saving Changes..."
              : "Creating Product..."}
          </>
        ) : (
          <>
            <Save className="mr-2 h-5 w-5" />
            {isEditMode
              ? "Save Changes"
              : "Create Product"}
          </>
        )}
      </Button>
    </form>
  );
}

