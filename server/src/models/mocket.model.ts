import mongoose, { Schema, Document } from "mongoose";

export interface IMocket extends Document {
  name: string;
  requestType: string;
  endpoint: string;
  requestHeaders: Record<string, unknown>;
  requestBody: Record<string, unknown>;
  responseBody: Object;
  createdBy: string | mongoose.Types.ObjectId;
  collectionId: mongoose.Types.ObjectId;
  slugName: string;
  description: string;
}

const MocketSchema: Schema = new Schema(
  {
    name: { type: String },
    // apikey: { type: String, required: true, unique: true },
    requestType: { type: String, required: true },
    endpoint: { type: String, required: true },
    requestHeaders: { type: Schema.Types.Mixed, required: true },
    requestBody: { type: Schema.Types.Mixed },
    responseBody: { type: Schema.Types.Mixed, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    collectionId: { type: Schema.Types.ObjectId, ref: "Collection" },
    slugName: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

const mocketModel = mongoose.model<IMocket>("Mocket", MocketSchema);
export default mocketModel;
