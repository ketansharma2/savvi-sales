import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export interface IInteraction extends Document {
  leadId: Types.ObjectId;

  date: string;

  contact_person: string;
  contact_no: string;
  email: string;

  status:
    | "Interested"
    | "Not Interested"
    | "Not Picked"
    | "Onboard"
    | "Call Later";

  material:
    | "Liquid Glucose"
    | "Special Syrup"
    | "SMP"
    | "Rice Protein";

  remarks: string;
  next_follow_up: string;
  sale_amount?: number | null;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const InteractionSchema = new Schema<IInteraction>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },

    contact_person: {
      type: String,
      required: true,
      trim: true,
    },

    contact_no: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    status: {
      type: String,
      enum: [
        "Interested",
        "Not Interested",
        "Not Picked",
        "Onboard",
        "Call Later",
      ],
      required: true,
    },

    material: {
      type: String,
      enum: [
        "Liquid Glucose",
        "Special Syrup",
        "SMP",
        "Rice Protein",
      ],
      required: true,
    },

    remarks: {
      type: String,
      required: true,
      trim: true,
    },

    next_follow_up: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    sale_amount: {
  type: Number,
  default: null,
  min: 0,
},

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

InteractionSchema.index({
  leadId: 1,
  date: -1,
});

InteractionSchema.index({
  createdBy: 1,
  createdAt: -1,
});

const Interaction: Model<IInteraction> =
  mongoose.models.Interaction ||
  mongoose.model<IInteraction>("Interaction", InteractionSchema);

export default Interaction;