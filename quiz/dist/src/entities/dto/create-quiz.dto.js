"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQuizDto = exports.CreateQuestionDto = exports.CreateChoiceDto = void 0;
class CreateChoiceDto {
    data;
}
exports.CreateChoiceDto = CreateChoiceDto;
class CreateQuestionDto {
    title;
    answer;
    choices;
}
exports.CreateQuestionDto = CreateQuestionDto;
class CreateQuizDto {
    lectureId;
    isDone;
    questions;
}
exports.CreateQuizDto = CreateQuizDto;
//# sourceMappingURL=create-quiz.dto.js.map