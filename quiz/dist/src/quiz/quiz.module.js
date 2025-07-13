"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizModule = void 0;
const common_1 = require("@nestjs/common");
const quiz_service_1 = require("./quiz.service");
const typeorm_1 = require("@nestjs/typeorm");
const choice_entities_1 = require("../entities/choice.entities");
const question_entities_1 = require("../entities/question.entities");
const quiz_entities_1 = require("../entities/quiz.entities");
const quiz_controller_1 = require("./quiz.controller");
const nestjs_rabbitmq_1 = require("@golevelup/nestjs-rabbitmq");
const ai_service_1 = require("../services/ai.service");
let QuizModule = class QuizModule {
};
exports.QuizModule = QuizModule;
exports.QuizModule = QuizModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([quiz_entities_1.Quiz, question_entities_1.Question, choice_entities_1.Choice]),
            nestjs_rabbitmq_1.RabbitMQModule.forRoot({
                uri: 'amqp://hama:hamahama@rabbitmq:5672/',
                exchanges: [
                    {
                        name: 'quiz_exchange',
                        type: 'topic',
                    },
                ],
                connectionInitOptions: {
                    wait: true,
                    timeout: 10000,
                },
            }),
        ],
        providers: [quiz_service_1.QuizService, ai_service_1.AiService],
        controllers: [quiz_controller_1.QuizController],
        exports: [quiz_service_1.QuizService, typeorm_1.TypeOrmModule, nestjs_rabbitmq_1.RabbitMQModule, ai_service_1.AiService]
    })
], QuizModule);
//# sourceMappingURL=quiz.module.js.map