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
import { mockApis } from "@/apis/mocket"

interface AddEndpointDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddEndpoint: (endpoint: MockEndpoint) => void
  collectionId: string
}

export function AddEndpointDialog({ open, onOpenChange, onAddEndpoint, collectionId }: AddEndpointDialogProps) {
  const [name, setName] = useState("")
  const [method, setMethod] = useState<MockEndpoint["method"]>("GET")
  const [path, setPath] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [createMockApi] = mockApis.useCreateMockApiMutation()

  const handleSubmit = async () => {
    if (!name || !path) return

    setIsLoading(true)
    try {
      // Create endpoint in backend
      const result = await createMockApi({
        name,
        method,
        endpoint: path, // Backend expects 'endpoint', not 'path'
        description,
        collectionId,
        requestHeaders: { "Content-Type": "application/json" }, // Required field
        request: {body : 'jksdjksjdfs', headers : 'hjshdjfshdj'}, // Required field
        response: {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              [
                { id: 1, name: "John Doe", email: "john@example.com" },
                { id: 2, name: "Jane Smith", email: "jane@example.com" },
              ],
              null,
              2,
            ),
          } // Backend expects 'responseBody', not 'response'
      }).unwrap()

      // Map API response to UI format
      let response = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Success" }, null, 2)
      }
      
      // Handle the new response structure
      if (result.response && typeof result.response === 'object') {
        response = {
          status: result.response.status || 200,
          headers: result.response.headers || { "Content-Type": "application/json" },
          body: result.response.body || JSON.stringify({ message: "Success" }, null, 2)
        }
      }
      
      const newEndpoint: MockEndpoint = {
        id: result._id || result.id, // Handle both _id and id
        name: result.name,
        method: result.method,
        path: result.endpoint, // Backend returns 'endpoint', UI expects 'path'
        description: result.description,
        response,
      }

      // Add to local state
      onAddEndpoint(newEndpoint)

      // Reset form
      setName("")
      setMethod("GET")
      setPath("")
      setDescription("")
      onOpenChange(false)
      
      console.log("Endpoint created successfully:", result)
    } catch (error) {
      console.error("Failed to create endpoint:", error)
      // You might want to show an error toast notification here
    } finally {
      setIsLoading(false)
    }
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
              onChange={(e) => {
                let value = e.target.value
                // Ensure path always starts with /
                if (value && !value.startsWith('/')) {
                  value = '/' + value
                }
                setPath(value)
              }}
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
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading || !name.trim() || !path.trim()}
          >
            {isLoading ? "Creating..." : "Add Endpoint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
