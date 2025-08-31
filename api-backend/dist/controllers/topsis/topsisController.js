"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopsisResults = void 0;
const alternativeModel_1 = require("../../models/topsis/alternativeModel");
const criteriaModel_1 = require("../../models/topsis/criteriaModel");
const scoreModel_1 = require("../../models/topsis/scoreModel");
const service_topsis_1 = require("../../services/service.topsis");
const getTopsisResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const alternatives = yield (0, alternativeModel_1.getAlternatives)();
        const criteria = yield (0, criteriaModel_1.getAllCriteria)();
        const scores = yield (0, scoreModel_1.getScores)();
        const results = yield (0, service_topsis_1.topsis)(alternatives, criteria, scores);
        res.json(results);
    }
    catch (err) {
        console.error("Error in getTopsesResults:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getTopsisResults = getTopsisResults;
