"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export async function resizeImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const maxDim = 1600;
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= 800 * 1024) {
      bitmap.close();
      return file;
    }
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Image processing failed")),
        "image/jpeg",
        0.82
      )
    );
  } catch {
    return file;
  }
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const processed = await resizeImage(file);
      const formData = new FormData();
      formData.append("file", processed, "image.jpg");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onChange([...images, data.url]);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative h-24 w-24 overflow-hidden rounded-xl border"
          >
            <Image
              src={image}
              alt={`Uploaded image ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <div>
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
      </div>
    </div>
  );
}
