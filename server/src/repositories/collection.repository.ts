import BaseRepository from "./base.repository";
import Collection, { ICollection } from "@/models/collection.model";

export default class CollectionRepository extends BaseRepository<ICollection> {
  constructor() {
    super(Collection);
  }
}
