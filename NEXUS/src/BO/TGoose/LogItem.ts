import { prop, modelOptions } from "@typegoose/typegoose";
import { ITSGooseHandler } from "../../data/instances";
import { LogType } from "../../enums";

@modelOptions({
  schemaOptions: {
    collection: "logEntries",
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
class Log {
  @prop({ required: true, type: String })
  public message!: string;

  @prop({
    required: true,
    enum: LogType,
    default: LogType.LOG,
    type: () => String,
  })
  public type!: LogType;

  @prop({ default: () => new Date(), type: Date })
  public timestamp!: Date;
}

const LogModel = ITSGooseHandler.createModel<Log>({ clazz: Log });

export { LogModel, Log };
