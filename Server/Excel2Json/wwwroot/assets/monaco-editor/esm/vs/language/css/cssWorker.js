/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as cssService from './_deps/vscode-css-languageservice/cssLanguageService.js';
var CSSWorker = /** @class */ (function () {
    function CSSWorker(ctx, createData) {
        this._ctx = ctx;
        this._languageSettings = createData.options;
        this._languageId = createData.languageId;
        var data = createData.options.data;
        var useDefaultDataProvider = data === null || data === void 0 ? void 0 : data.useDefaultDataProvider;
        var customDataProviders = [];
        if (data === null || data === void 0 ? void 0 : data.dataProviders) {
            for (var id in data.dataProviders) {
                customDataProviders.push(cssService.newCSSDataProvider(data.dataProviders[id]));
            }
        }
        var lsOptions = { customDataProviders: customDataProviders, useDefaultDataProvider: useDefaultDataProvider };
        switch (this._languageId) {
            case 'css':
                this._languageService = cssService.getCSSLanguageService(lsOptions);
                break;
            case 'less':
                this._languageService = cssService.getLESSLanguageService(lsOptions);
                break;
            case 'scss':
                this._languageService = cssService.getSCSSLanguageService(lsOptions);
                break;
            default:
                throw new Error('Invalid language id: ' + this._languageId);
        }
        this._languageService.configure(this._languageSettings);
    }
    // --- language service host ---------------
    CSSWorker.prototype.doValidation = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, diagnostics;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                if (document) {
                    stylesheet = this._languageService.parseStylesheet(document);
                    diagnostics = this._languageService.doValidation(document, stylesheet);
                    return [2 /*return*/, Promise.resolve(diagnostics)];
                }
                return [2 /*return*/, Promise.resolve([])];
            });
        });
    };
    CSSWorker.prototype.doComplete = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, completions;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                completions = this._languageService.doComplete(document, position, stylesheet);
                return [2 /*return*/, Promise.resolve(completions)];
            });
        });
    };
    CSSWorker.prototype.doHover = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, hover;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                hover = this._languageService.doHover(document, position, stylesheet);
                return [2 /*return*/, Promise.resolve(hover)];
            });
        });
    };
    CSSWorker.prototype.findDefinition = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, definition;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                definition = this._languageService.findDefinition(document, position, stylesheet);
                return [2 /*return*/, Promise.resolve(definition)];
            });
        });
    };
    CSSWorker.prototype.findReferences = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, references;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                references = this._languageService.findReferences(document, position, stylesheet);
                return [2 /*return*/, Promise.resolve(references)];
            });
        });
    };
    CSSWorker.prototype.findDocumentHighlights = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, highlights;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                highlights = this._languageService.findDocumentHighlights(document, position, stylesheet);
                return [2 /*return*/, Promise.resolve(highlights)];
            });
        });
    };
    CSSWorker.prototype.findDocumentSymbols = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, symbols;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                symbols = this._languageService.findDocumentSymbols(document, stylesheet);
                return [2 /*return*/, Promise.resolve(symbols)];
            });
        });
    };
    CSSWorker.prototype.doCodeActions = function (uri, range, context) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, actions;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                actions = this._languageService.doCodeActions(document, range, context, stylesheet);
                return [2 /*return*/, Promise.resolve(actions)];
            });
        });
    };
    CSSWorker.prototype.findDocumentColors = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, colorSymbols;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                colorSymbols = this._languageService.findDocumentColors(document, stylesheet);
                return [2 /*return*/, Promise.resolve(colorSymbols)];
            });
        });
    };
    CSSWorker.prototype.getColorPresentations = function (uri, color, range) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, colorPresentations;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                colorPresentations = this._languageService.getColorPresentations(document, stylesheet, color, range);
                return [2 /*return*/, Promise.resolve(colorPresentations)];
            });
        });
    };
    CSSWorker.prototype.getFoldingRanges = function (uri, context) {
        return __awaiter(this, void 0, void 0, function () {
            var document, ranges;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                ranges = this._languageService.getFoldingRanges(document, context);
                return [2 /*return*/, Promise.resolve(ranges)];
            });
        });
    };
    CSSWorker.prototype.getSelectionRanges = function (uri, positions) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, ranges;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                ranges = this._languageService.getSelectionRanges(document, positions, stylesheet);
                return [2 /*return*/, Promise.resolve(ranges)];
            });
        });
    };
    CSSWorker.prototype.doRename = function (uri, position, newName) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, renames;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                renames = this._languageService.doRename(document, position, newName, stylesheet);
                return [2 /*return*/, Promise.resolve(renames)];
            });
        });
    };
    CSSWorker.prototype._getTextDocument = function (uri) {
        var models = this._ctx.getMirrorModels();
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
            var model = models_1[_i];
            if (model.uri.toString() === uri) {
                return cssService.TextDocument.create(uri, this._languageId, model.version, model.getValue());
            }
        }
        return null;
    };
    return CSSWorker;
}());
export { CSSWorker };
export function create(ctx, createData) {
    return new CSSWorker(ctx, createData);
}
