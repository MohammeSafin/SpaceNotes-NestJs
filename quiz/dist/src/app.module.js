"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const quiz_controller_1 = require("./quiz/quiz.controller");
const quiz_module_1 = require("./quiz/quiz.module");
const quiz_service_1 = require("./quiz/quiz.service");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const quiz_entities_1 = require("./entities/quiz.entities");
const question_entities_1 = require("./entities/question.entities");
const choice_entities_1 = require("./entities/choice.entities");
const rabbitmq_module_1 = require("../modules/rabbitmq.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: 5432,
                username: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                database: process.env.POSTGRES_DB,
                entities: [quiz_entities_1.Quiz, question_entities_1.Question, choice_entities_1.Choice],
                autoLoadEntities: true,
                synchronize: true,
            }),
            rabbitmq_module_1.RabbitMQWrapperModule,
            quiz_module_1.QuizModule
        ],
        controllers: [quiz_controller_1.QuizController],
        providers: [quiz_service_1.QuizService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map