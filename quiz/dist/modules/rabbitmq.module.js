"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQWrapperModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_rabbitmq_1 = require("@golevelup/nestjs-rabbitmq");
let RabbitMQWrapperModule = class RabbitMQWrapperModule {
};
exports.RabbitMQWrapperModule = RabbitMQWrapperModule;
exports.RabbitMQWrapperModule = RabbitMQWrapperModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_rabbitmq_1.RabbitMQModule.forRoot({
                uri: "amqp://hama:hamahama@localhost:5672/",
                exchanges: [
                    {
                        name: 'quiz-exchange',
                        type: 'topic',
                    },
                ],
                connectionInitOptions: {
                    wait: true,
                    timeout: 10000,
                },
            }),
        ],
        exports: [nestjs_rabbitmq_1.RabbitMQModule],
    })
], RabbitMQWrapperModule);
//# sourceMappingURL=rabbitmq.module.js.map