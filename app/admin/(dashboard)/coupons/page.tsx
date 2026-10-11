"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  _count: { orders: number };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: "",
    discountPercent: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchCoupons = async () => {
    const response = await fetch("/api/coupons");
    const data = await response.json();
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setForm({ code: "", discountPercent: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code,
      discountPercent: parseInt(form.discountPercent, 10),
    };

    try {
      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.error)
          ? data.error.map((issue: { message?: string }) => issue.message).join(". ")
          : data.error || "Failed to create coupon";
        throw new Error(message);
      }

      toast.success("Coupon created");
      setDialogOpen(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create coupon"
      );
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!response.ok) throw new Error("Failed to update coupon");
      toast.success(active ? "Coupon activated" : "Coupon deactivated");
      fetchCoupons();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update coupon"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete coupon");
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete coupon"
      );
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading coupons...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground">Manage discount coupons.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">Create Coupon</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="SUMMER20"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPercent">Discount % *</Label>
                <Input
                  id="discountPercent"
                  type="number"
                  min="1"
                  max="100"
                  value={form.discountPercent}
                  onChange={(e) =>
                    setForm({ ...form, discountPercent: e.target.value })
                  }
                  placeholder="20"
                  required
                  className="rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full rounded-full">
                Create Coupon
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Used</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono font-medium">{coupon.code}</span>
                  </div>
                </TableCell>
                <TableCell>{coupon.discountPercent}%</TableCell>
                <TableCell>
                  <Switch
                    checked={coupon.active}
                    onCheckedChange={(checked) =>
                      handleToggleActive(coupon.id, checked)
                    }
                  />
                </TableCell>
                <TableCell>{coupon._count.orders}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10"
                    aria-label={`Delete ${coupon.code}`}
                    onClick={() => handleDelete(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {coupons.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No coupons yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
