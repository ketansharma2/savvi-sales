import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export interface ILead extends Document {
  company: string;
  category: string;
  state: string;
  district_city: string;
  location: string;
  reference: string;
  sourcingDate: string;

  startup: "Yes" | "No" | "Master Union";

  projection:
    | "Not Projected"
    | "WP > 50"
    | "WP < 50"
    | "MP > 50"
    | "MP < 50";

  status:
    | "New"
    | "Interested"
    | "Not Interested"
    | "Not Picked"
    | "Onboard"
    | "Call Later";
  sale_amount?: number | null;
  contact_person: string;
  contact_no: string;
  phone: string;
  email: string;
  remarks: string;
  material: string;

  nextFollowup: string;
  latestFollowup: string;
  isSubmitted: boolean;
  everContractShare: boolean;

  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
 
  managerId?: Types.ObjectId;
  managerName?: string;
  submittedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    district_city: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    reference: {
      type: String,
      default: "",
      trim: true,
    },

    sourcingDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },

    startup: {
      type: String,
      enum: ["Yes", "No", "Master Union"],
      required: true,
    },

    projection: {
      type: String,
      enum: [
        "Not Projected",
        "WP > 50",
        "WP < 50",
        "MP > 50",
        "MP < 50",
      ],
      required: true,
    },
    sale_amount: {
  type: Number,
  default: null,
  min: 0,
  },

    status: {
      type: String,
      enum: [
        "New",
        "Interested",
        "Not Interested",
        "Not Picked",
        "Onboard",
        "Call Later",
      ],
      default: "New",
    },

    contact_person: {
      type: String,
      default: "",
      trim: true,
    },

    contact_no: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    material: {
  type: String,
  default: "",
  trim: true,
},

    nextFollowup: {
      type: String,
      default: "",
      match: /^$|^\d{4}-\d{2}-\d{2}$/,
    },

    latestFollowup: {
      type: String,
      default: "",
      match: /^$|^\d{4}-\d{2}-\d{2}$/,
    },

    isSubmitted: {
      type: Boolean,
      default: false,
    },

    everContractShare: {
      type: Boolean,
      default: false,
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

    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    managerName: {
      type: String,
      default: "",
      trim: true,
    },

    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

LeadSchema.index({ createdBy: 1, createdAt: -1 });
LeadSchema.index({ company: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ latestFollowup: 1 });
LeadSchema.index({ isSubmitted: 1 });

const Lead: Model<ILead> =
  mongoose.models.Lead ||
  mongoose.model<ILead>("Lead", LeadSchema);

export default Lead;