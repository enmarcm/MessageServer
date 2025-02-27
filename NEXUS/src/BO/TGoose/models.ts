import { QueueItem } from "./QueueItem";
import { Log } from "./LogItem";
import { ITSGooseHandler } from "../../data/instances";

export const QueueItemModel = ITSGooseHandler.createModel<QueueItem>({
  clazz: QueueItem,
});

export const LogModel = ITSGooseHandler.createModel<Log>({ clazz: Log });
