import mongoose, { Schema, Document } from "mongoose";

export interface IMocket extends Document {
  name: string;
  method: string;
  endpoint: string;
  requestHeaders: Record<string, unknown>;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
  createdBy: string | mongoose.Types.ObjectId;
  collectionId: mongoose.Types.ObjectId;
  slugName: string;
  description: string;
}

const MocketSchema: Schema = new Schema(
  {
    name: { type: String },
    // apikey: { type: String, required: true, unique: true },
    method: { type: String, required: true },
    endpoint: { type: String, required: true },
    requestHeaders: { type: Schema.Types.Mixed, default: {} },
    request: { type: Schema.Types.Mixed },
    response: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    collectionId: { type: Schema.Types.ObjectId, ref: "Collection" },
    slugName: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

const mocketModel = mongoose.model<IMocket>("Mocket", MocketSchema);
export default mocketModel;
