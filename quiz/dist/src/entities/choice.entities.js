"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Choice = void 0;
const typeorm_1 = require("typeorm");
const question_entities_1 = require("./question.entities");
let Choice = class Choice {
    id;
    questionId;
    data;
    question;
};
exports.Choice = Choice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Choice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Choice.prototype, "questionId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Choice.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => question_entities_1.Question, question => question.choices),
    __metadata("design:type", question_entities_1.Question)
], Choice.prototype, "question", void 0);
exports.Choice = Choice = __decorate([
    (0, typeorm_1.Entity)()
], Choice);
//# sourceMappingURL=choice.entities.js.map