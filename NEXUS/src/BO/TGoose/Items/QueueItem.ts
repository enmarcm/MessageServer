import { prop, modelOptions } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    toObject: {
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toJSON: {
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
})
export class QueueItem {
  @prop({ required: true, enum: ["SMS", "EMAIL"], type: String })
  public type!: "SMS" | "EMAIL";

  @prop({ required: true, type: String })
  public content!: any;

  @prop({
    required: true,
    enum: ["PENDING", "COMPLETED", "ERROR"],
    default: "PENDING",
    type: String,
  })
  public status!: "PENDING" | "COMPLETED" | "ERROR";

  @prop({ required: true, type: Date, default: Date.now })
  public createdAt!: Date;

  @prop({ required: false, type: String })
  public from?: string;

  @prop({ required: false, type: String })
  public to?: string;
}
