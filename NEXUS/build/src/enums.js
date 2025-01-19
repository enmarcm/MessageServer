"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementSend = exports.HttpMethod = exports.Constants = exports.Routes = void 0;
var Routes;
(function (Routes) {
})(Routes || (exports.Routes = Routes = {}));
var Constants;
(function (Constants) {
    Constants["ERROR"] = "error";
})(Constants || (exports.Constants = Constants = {}));
var HttpMethod;
(function (HttpMethod) {
    HttpMethod["GET"] = "GET";
    HttpMethod["POST"] = "POST";
    HttpMethod["PUT"] = "PUT";
    HttpMethod["PATCH"] = "PATCH";
    HttpMethod["DELETE"] = "DELETE";
})(HttpMethod || (exports.HttpMethod = HttpMethod = {}));
var ElementSend;
(function (ElementSend) {
    ElementSend["EMAIL"] = "EMAIL";
    ElementSend["SMS"] = "SMS";
})(ElementSend || (exports.ElementSend = ElementSend = {}));
