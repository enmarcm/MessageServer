import { prop, modelOptions } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    collection: "data",
    toObject: {
      transform: function (_doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toJSON: {
      transform: function (_doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
})
export class Data {
  @prop({ required: true, type: String })
  public type!: "SMS" | "EMAIL";

  @prop({ required: true, type: String })
  public name!: string;

  @prop({ required: false, type: Number })
  public rest?: number;
}

