import { QueueItem } from "./Items/QueueItem";
import { Log } from "./Items/LogItem";
import { ITSGooseHandler } from "../../data/instances";
import { Data } from "./Items/dataItem";

export const QueueItemModel = ITSGooseHandler.createModel<QueueItem>({
  clazz: QueueItem,
});

export const LogModel = ITSGooseHandler.createModel<Log>({ clazz: Log });


export const DataModel = ITSGooseHandler.createModel<Data>({clazz: Data});
