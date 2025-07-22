"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { MainContent } from "@/components/main-content"

export interface MockEndpoint {
  id: string
  name: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  description?: string
  response: {
    status: number
    headers: Record<string, string>
    body: string
  }
  request?: {
    headers?: Record<string, string>
    body?: string
  }
}

export interface Collection {
  id: string
  name: string
  endpoints: MockEndpoint[]
}

export function MockApiPlatform() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: "1",
      name: "User API",
      endpoints: [
        {
          id: "1",
          name: "Get Users",
          method: "GET",
          path: "/api/users",
          description: "Retrieve all users",
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
          },
        },
        {
          id: "2",
          name: "Create User",
          method: "POST",
          path: "/api/users",
          description: "Create a new user",
          response: {
            status: 201,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: 3, name: "New User", email: "new@example.com" }, null, 2),
          },
          request: {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "New User", email: "new@example.com" }, null, 2),
          },
        },
      ],
    },
    {
      id: "2",
      name: "Product API",
      endpoints: [
        {
          id: "3",
          name: "Get Products",
          method: "GET",
          path: "/api/products",
          description: "Retrieve all products",
          response: {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              [
                { id: 1, name: "Laptop", price: 999.99 },
                { id: 2, name: "Phone", price: 599.99 },
              ],
              null,
              2,
            ),
          },
        },
      ],
    },
  ])

  const [selectedCollection, setSelectedCollection] = useState<Collection>(collections[0])
  const [selectedEndpoint, setSelectedEndpoint] = useState<MockEndpoint | null>(collections[0].endpoints[0])

  const updateEndpoint = (updatedEndpoint: MockEndpoint) => {
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === selectedCollection.id
          ? {
              ...collection,
              endpoints: collection.endpoints.map((endpoint) =>
                endpoint.id === updatedEndpoint.id ? updatedEndpoint : endpoint,
              ),
            }
          : collection,
      ),
    )
    setSelectedEndpoint(updatedEndpoint)
  }

  const addEndpoint = (collectionId: string, endpoint: MockEndpoint) => {
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId ? { ...collection, endpoints: [...collection.endpoints, endpoint] } : collection,
      ),
    )
  }

  const addCollection = (collection: Collection) => {
    setCollections((prev) => [...prev, collection])
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background">
      <AppSidebar
        collections={collections}
        selectedCollection={selectedCollection}
        selectedEndpoint={selectedEndpoint}
        onSelectCollection={setSelectedCollection}
        onSelectEndpoint={setSelectedEndpoint}
        onAddEndpoint={addEndpoint}
        onAddCollection={addCollection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-0" : "ml-0"}`}>
        <MainContent
          selectedEndpoint={selectedEndpoint}
          selectedCollection={selectedCollection}
          onUpdateEndpoint={updateEndpoint}
          onAddEndpoint={addEndpoint}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
    </div>
  )
}
