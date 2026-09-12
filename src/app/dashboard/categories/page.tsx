"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { useInventory } from "@/context/inventory-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const colorOptions = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
];

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(colorOptions[0]);
  const { categories, products, addCategory, deleteCategory } = useInventory();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      await addCategory({ name, description, color });
      toast.success(`Category "${name}" created`);
      setDialogOpen(false);
      setName("");
      setDescription("");
      setColor(colorOptions[0]);
    } catch {
      toast.error("Failed to create category");
    }
  }

  return (
    <>
      <Header
        title="Categories"
        subtitle="Organize your products into categories"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-6 flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Name</Label>
                  <Input
                    id="cat-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Electronics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-desc">Description</Label>
                  <Input
                    id="cat-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Gadgets and devices"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`h-8 w-8 rounded-full transition-transform ${
                          color === c
                            ? "scale-110 ring-2 ring-offset-2 ring-indigo-500"
                            : ""
                        }`}
                        style={{ backgroundColor: c }}
                        onClick={() => setColor(c)}
                      />
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Category</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const count = products.filter(
              (p) => p.categoryId === category.id
            ).length;
            return (
              <Card
                key={category.id}
                className="group overflow-hidden border-border/50 transition-all hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div
                  className="h-1.5"
                  style={{ backgroundColor: category.color }}
                />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={async () => {
                        try {
                          await deleteCategory(category.id);
                          toast.success(`Category "${category.name}" deleted`);
                        } catch {
                          toast.error("Failed to delete category");
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold">{count}</span>
                    <span className="text-sm text-muted-foreground">
                      products
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
