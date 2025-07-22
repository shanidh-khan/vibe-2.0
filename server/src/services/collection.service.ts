import { ICollection } from "@/models/collection.model";
import CollectionRepository from "@/repositories/collection.repository";
import { ClientSession } from "mongoose";

export default class CollectionService {
  constructor(private collectionRepo: CollectionRepository) {}

  async getCollections() {
    return this.collectionRepo.findAll();
  }

  async createCollection(collection: ICollection, session?: ClientSession) {
    // Auto-generate apiKey if not provided
    if (!collection.apiKey) {
      const crypto = await import('crypto');
      collection.apiKey = crypto.randomBytes(16).toString("hex");
    }
    // Auto-generate subDomain if not provided
    if (!collection.subDomain) {
      collection.subDomain = collection.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }
    return this.collectionRepo.create(collection, session);
  }

  async getUserCollections(userId: string) {
    return this.collectionRepo.findBy({ createdBy: userId });
  }

  async getCollection(collectionId: string) {
    return this.collectionRepo.findOneById(collectionId);
  }

  async getCollectionBySubDomain(subDomain: string) {
    return this.collectionRepo.findOneBy({ subDomain });
  }

  async updateCollection(id: string, data: Partial<ICollection>) {
    return this.collectionRepo.update(id, data);
  }

  async deleteCollection(id: string) {
    return this.collectionRepo.delete(id);
  }
}

