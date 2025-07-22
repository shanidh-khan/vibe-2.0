import mongoose, { Schema, Document } from "mongoose";

export interface ICollection extends Document {
  baseUrl: string;
  description: string;
  name: string;
  apiKey: string;
  subDomain: string;
  createdBy: string;
  numberOfRequests: number;
}

const CollectionSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    baseUrl: { type: String },
    description: { type: String },
    apiKey: { type: String, required: true, unique: true },
    subDomain: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    numberOfRequests: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const collectionModel = mongoose.model<ICollection>("Collection", CollectionSchema);
export default collectionModel;
