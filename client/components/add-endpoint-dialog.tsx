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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { MockEndpoint } from "./mock-api-platform"

interface AddEndpointDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddEndpoint: (endpoint: MockEndpoint) => void
}

export function AddEndpointDialog({ open, onOpenChange, onAddEndpoint }: AddEndpointDialogProps) {
  const [name, setName] = useState("")
  const [method, setMethod] = useState<MockEndpoint["method"]>("GET")
  const [path, setPath] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = () => {
    if (!name || !path) return

    const newEndpoint: MockEndpoint = {
      id: Date.now().toString(),
      name,
      method,
      path,
      description,
      response: {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Success" }, null, 2),
      },
    }

    onAddEndpoint(newEndpoint)

    // Reset form
    setName("")
    setMethod("GET")
    setPath("")
    setDescription("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Endpoint</DialogTitle>
          <DialogDescription>Create a new mock endpoint for your collection.</DialogDescription>
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
              placeholder="Get Users"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="method" className="text-right">
              Method
            </Label>
            <Select value={method} onValueChange={(value: any) => setMethod(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="path" className="text-right">
              Path
            </Label>
            <Input
              id="path"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="col-span-3"
              placeholder="/api/users"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Retrieve all users"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Add Endpoint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
