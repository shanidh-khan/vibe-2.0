"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Collection } from "./mock-api-platform"

interface AddCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCollection: (collection: Collection) => void
}

export function AddCollectionDialog({ open, onOpenChange, onAddCollection }: AddCollectionDialogProps) {
  const [name, setName] = useState("")

  const handleSubmit = () => {
    if (!name) return

    const newCollection: Collection = {
      id: Date.now().toString(),
      name,
      endpoints: [],
    }

    onAddCollection(newCollection)

    // Reset form
    setName("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Collection</DialogTitle>
          <DialogDescription>Create a new collection to organize your mock endpoints.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="User API"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Add Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
