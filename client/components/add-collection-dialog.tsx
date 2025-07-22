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
import { collectionApis } from "@/apis/collection"

interface AddCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCollection: (collection: Collection) => void
}

export function AddCollectionDialog({ open, onOpenChange, onAddCollection }: AddCollectionDialogProps) {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [createCollection] = collectionApis.useCreateCollectionMutation()

  const handleSubmit = async () => {
    if (!name) return

    setIsLoading(true)
    try {
      // Create collection in backend
      const result = await createCollection({
        name,
        baseUrl: "", // Add default or make this configurable
        description: "", // Add default or make this configurable
      }).unwrap()

      // Map API response to UI format
      const newCollection: Collection = {
        id: result._id, // Map _id to id for UI
        name: result.name,
        endpoints: [],
      }

      // Add to local state
      onAddCollection(newCollection)

      // Reset form
      setName("")
      onOpenChange(false)
      
      console.log("Collection created successfully:", result)
    } catch (error) {
      console.error("Failed to create collection:", error)
      // You might want to show an error toast notification here
    } finally {
      setIsLoading(false)
    }
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
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? "Creating..." : "Add Collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
