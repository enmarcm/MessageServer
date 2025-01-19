"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const functions_1 = require("./functions");
const middlewares_1 = require("./middlewares/middlewares");
const constants_1 = require("./constants");
const allRouters_1 = require("./routers/allRouters");
const app = (0, express_1.default)();
//{ Middlewares
app.use((0, middlewares_1.midJson)());
app.use(middlewares_1.midValidJson);
app.use((0, middlewares_1.midCors)());
app.use(middlewares_1.midNotJson);
app.use("/", allRouters_1.MainRouter);
app.use(middlewares_1.midNotFound);
(0, functions_1.startServer)({ app, PORT: constants_1.PORT });
