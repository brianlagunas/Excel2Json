/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { onUnexpectedError } from '../../../base/common/errors.js';
import * as strings from '../../../base/common/strings.js';
import { Position } from '../core/position.js';
import { Range } from '../core/range.js';
import { Selection } from '../core/selection.js';
import { TextModel } from '../model/textModel.js';
import { LanguageConfigurationRegistry } from '../modes/languageConfigurationRegistry.js';
const autoCloseAlways = () => true;
const autoCloseNever = () => false;
const autoCloseBeforeWhitespace = (chr) => (chr === ' ' || chr === '\t');
export class CursorConfiguration {
    constructor(languageIdentifier, modelOptions, configuration) {
        this._cursorMoveConfigurationBrand = undefined;
        this._languageIdentifier = languageIdentifier;
        const options = configuration.options;
        const layoutInfo = options.get(129 /* layoutInfo */);
        this.readOnly = options.get(79 /* readOnly */);
        this.tabSize = modelOptions.tabSize;
        this.indentSize = modelOptions.indentSize;
        this.insertSpaces = modelOptions.insertSpaces;
        this.stickyTabStops = options.get(103 /* stickyTabStops */);
        this.lineHeight = options.get(57 /* lineHeight */);
        this.pageSize = Math.max(1, Math.floor(layoutInfo.height / this.lineHeight) - 2);
        this.useTabStops = options.get(114 /* useTabStops */);
        this.wordSeparators = options.get(115 /* wordSeparators */);
        this.emptySelectionClipboard = options.get(30 /* emptySelectionClipboard */);
        this.copyWithSyntaxHighlighting = options.get(19 /* copyWithSyntaxHighlighting */);
        this.multiCursorMergeOverlapping = options.get(67 /* multiCursorMergeOverlapping */);
        this.multiCursorPaste = options.get(69 /* multiCursorPaste */);
        this.autoClosingBrackets = options.get(5 /* autoClosingBrackets */);
        this.autoClosingQuotes = options.get(8 /* autoClosingQuotes */);
        this.autoClosingDelete = options.get(6 /* autoClosingDelete */);
        this.autoClosingOvertype = options.get(7 /* autoClosingOvertype */);
        this.autoSurround = options.get(11 /* autoSurround */);
        this.autoIndent = options.get(9 /* autoIndent */);
        this.surroundingPairs = {};
        this._electricChars = null;
        this.shouldAutoCloseBefore = {
            quote: CursorConfiguration._getShouldAutoClose(languageIdentifier, this.autoClosingQuotes),
            bracket: CursorConfiguration._getShouldAutoClose(languageIdentifier, this.autoClosingBrackets)
        };
        this.autoClosingPairs = LanguageConfigurationRegistry.getAutoClosingPairs(languageIdentifier.id);
        let surroundingPairs = CursorConfiguration._getSurroundingPairs(languageIdentifier);
        if (surroundingPairs) {
            for (const pair of surroundingPairs) {
                this.surroundingPairs[pair.open] = pair.close;
            }
        }
    }
    static shouldRecreate(e) {
        return (e.hasChanged(129 /* layoutInfo */)
            || e.hasChanged(115 /* wordSeparators */)
            || e.hasChanged(30 /* emptySelectionClipboard */)
            || e.hasChanged(67 /* multiCursorMergeOverlapping */)
            || e.hasChanged(69 /* multiCursorPaste */)
            || e.hasChanged(5 /* autoClosingBrackets */)
            || e.hasChanged(8 /* autoClosingQuotes */)
            || e.hasChanged(6 /* autoClosingDelete */)
            || e.hasChanged(7 /* autoClosingOvertype */)
            || e.hasChanged(11 /* autoSurround */)
            || e.hasChanged(114 /* useTabStops */)
            || e.hasChanged(57 /* lineHeight */)
            || e.hasChanged(79 /* readOnly */));
    }
    get electricChars() {
        if (!this._electricChars) {
            this._electricChars = {};
            let electricChars = CursorConfiguration._getElectricCharacters(this._languageIdentifier);
            if (electricChars) {
                for (const char of electricChars) {
                    this._electricChars[char] = true;
                }
            }
        }
        return this._electricChars;
    }
    normalizeIndentation(str) {
        return TextModel.normalizeIndentation(str, this.indentSize, this.insertSpaces);
    }
    static _getElectricCharacters(languageIdentifier) {
        try {
            return LanguageConfigurationRegistry.getElectricCharacters(languageIdentifier.id);
        }
        catch (e) {
            onUnexpectedError(e);
            return null;
        }
    }
    static _getShouldAutoClose(languageIdentifier, autoCloseConfig) {
        switch (autoCloseConfig) {
            case 'beforeWhitespace':
                return autoCloseBeforeWhitespace;
            case 'languageDefined':
                return CursorConfiguration._getLanguageDefinedShouldAutoClose(languageIdentifier);
            case 'always':
                return autoCloseAlways;
            case 'never':
                return autoCloseNever;
        }
    }
    static _getLanguageDefinedShouldAutoClose(languageIdentifier) {
        try {
            const autoCloseBeforeSet = LanguageConfigurationRegistry.getAutoCloseBeforeSet(languageIdentifier.id);
            return c => autoCloseBeforeSet.indexOf(c) !== -1;
        }
        catch (e) {
            onUnexpectedError(e);
            return autoCloseNever;
        }
    }
    static _getSurroundingPairs(languageIdentifier) {
        try {
            return LanguageConfigurationRegistry.getSurroundingPairs(languageIdentifier.id);
        }
        catch (e) {
            onUnexpectedError(e);
            return null;
        }
    }
}
/**
 * Represents the cursor state on either the model or on the view model.
 */
export class SingleCursorState {
    constructor(selectionStart, selectionStartLeftoverVisibleColumns, position, leftoverVisibleColumns) {
        this._singleCursorStateBrand = undefined;
        this.selectionStart = selectionStart;
        this.selectionStartLeftoverVisibleColumns = selectionStartLeftoverVisibleColumns;
        this.position = position;
        this.leftoverVisibleColumns = leftoverVisibleColumns;
        this.selection = SingleCursorState._computeSelection(this.selectionStart, this.position);
    }
    equals(other) {
        return (this.selectionStartLeftoverVisibleColumns === other.selectionStartLeftoverVisibleColumns
            && this.leftoverVisibleColumns === other.leftoverVisibleColumns
            && this.position.equals(other.position)
            && this.selectionStart.equalsRange(other.selectionStart));
    }
    hasSelection() {
        return (!this.selection.isEmpty() || !this.selectionStart.isEmpty());
    }
    move(inSelectionMode, lineNumber, column, leftoverVisibleColumns) {
        if (inSelectionMode) {
            // move just position
            return new SingleCursorState(this.selectionStart, this.selectionStartLeftoverVisibleColumns, new Position(lineNumber, column), leftoverVisibleColumns);
        }
        else {
            // move everything
            return new SingleCursorState(new Range(lineNumber, column, lineNumber, column), leftoverVisibleColumns, new Position(lineNumber, column), leftoverVisibleColumns);
        }
    }
    static _computeSelection(selectionStart, position) {
        let startLineNumber, startColumn, endLineNumber, endColumn;
        if (selectionStart.isEmpty()) {
            startLineNumber = selectionStart.startLineNumber;
            startColumn = selectionStart.startColumn;
            endLineNumber = position.lineNumber;
            endColumn = position.column;
        }
        else {
            if (position.isBeforeOrEqual(selectionStart.getStartPosition())) {
                startLineNumber = selectionStart.endLineNumber;
                startColumn = selectionStart.endColumn;
                endLineNumber = position.lineNumber;
                endColumn = position.column;
            }
            else {
                startLineNumber = selectionStart.startLineNumber;
                startColumn = selectionStart.startColumn;
                endLineNumber = position.lineNumber;
                endColumn = position.column;
            }
        }
        return new Selection(startLineNumber, startColumn, endLineNumber, endColumn);
    }
}
export class CursorContext {
    constructor(model, viewModel, coordinatesConverter, cursorConfig) {
        this._cursorContextBrand = undefined;
        this.model = model;
        this.viewModel = viewModel;
        this.coordinatesConverter = coordinatesConverter;
        this.cursorConfig = cursorConfig;
    }
}
export class PartialModelCursorState {
    constructor(modelState) {
        this.modelState = modelState;
        this.viewState = null;
    }
}
export class PartialViewCursorState {
    constructor(viewState) {
        this.modelState = null;
        this.viewState = viewState;
    }
}
export class CursorState {
    constructor(modelState, viewState) {
        this._cursorStateBrand = undefined;
        this.modelState = modelState;
        this.viewState = viewState;
    }
    static fromModelState(modelState) {
        return new PartialModelCursorState(modelState);
    }
    static fromViewState(viewState) {
        return new PartialViewCursorState(viewState);
    }
    static fromModelSelection(modelSelection) {
        const selectionStartLineNumber = modelSelection.selectionStartLineNumber;
        const selectionStartColumn = modelSelection.selectionStartColumn;
        const positionLineNumber = modelSelection.positionLineNumber;
        const positionColumn = modelSelection.positionColumn;
        const modelState = new SingleCursorState(new Range(selectionStartLineNumber, selectionStartColumn, selectionStartLineNumber, selectionStartColumn), 0, new Position(positionLineNumber, positionColumn), 0);
        return CursorState.fromModelState(modelState);
    }
    static fromModelSelections(modelSelections) {
        let states = [];
        for (let i = 0, len = modelSelections.length; i < len; i++) {
            states[i] = this.fromModelSelection(modelSelections[i]);
        }
        return states;
    }
    equals(other) {
        return (this.viewState.equals(other.viewState) && this.modelState.equals(other.modelState));
    }
}
export class EditOperationResult {
    constructor(type, commands, opts) {
        this._editOperationResultBrand = undefined;
        this.type = type;
        this.commands = commands;
        this.shouldPushStackElementBefore = opts.shouldPushStackElementBefore;
        this.shouldPushStackElementAfter = opts.shouldPushStackElementAfter;
    }
}
/**
 * Common operations that work and make sense both on the model and on the view model.
 */
export class CursorColumns {
    static visibleColumnFromColumn(lineContent, column, tabSize) {
        const lineContentLength = lineContent.length;
        const endOffset = column - 1 < lineContentLength ? column - 1 : lineContentLength;
        let result = 0;
        let i = 0;
        while (i < endOffset) {
            const codePoint = strings.getNextCodePoint(lineContent, endOffset, i);
            i += (codePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
            if (codePoint === 9 /* Tab */) {
                result = CursorColumns.nextRenderTabStop(result, tabSize);
            }
            else {
                let graphemeBreakType = strings.getGraphemeBreakType(codePoint);
                while (i < endOffset) {
                    const nextCodePoint = strings.getNextCodePoint(lineContent, endOffset, i);
                    const nextGraphemeBreakType = strings.getGraphemeBreakType(nextCodePoint);
                    if (strings.breakBetweenGraphemeBreakType(graphemeBreakType, nextGraphemeBreakType)) {
                        break;
                    }
                    i += (nextCodePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
                    graphemeBreakType = nextGraphemeBreakType;
                }
                if (strings.isFullWidthCharacter(codePoint) || strings.isEmojiImprecise(codePoint)) {
                    result = result + 2;
                }
                else {
                    result = result + 1;
                }
            }
        }
        return result;
    }
    /**
     * Returns an array that maps one based columns to one based visible columns. The entry at position 0 is -1.
    */
    static visibleColumnsByColumns(lineContent, tabSize) {
        const endOffset = lineContent.length;
        let result = new Array();
        result.push(-1);
        let pos = 0;
        let i = 0;
        while (i < endOffset) {
            const codePoint = strings.getNextCodePoint(lineContent, endOffset, i);
            i += (codePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
            result.push(pos);
            if (codePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */) {
                result.push(pos);
            }
            if (codePoint === 9 /* Tab */) {
                pos = CursorColumns.nextRenderTabStop(pos, tabSize);
            }
            else {
                let graphemeBreakType = strings.getGraphemeBreakType(codePoint);
                while (i < endOffset) {
                    const nextCodePoint = strings.getNextCodePoint(lineContent, endOffset, i);
                    const nextGraphemeBreakType = strings.getGraphemeBreakType(nextCodePoint);
                    if (strings.breakBetweenGraphemeBreakType(graphemeBreakType, nextGraphemeBreakType)) {
                        break;
                    }
                    i += (nextCodePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
                    result.push(pos);
                    if (codePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */) {
                        result.push(pos);
                    }
                    graphemeBreakType = nextGraphemeBreakType;
                }
                if (strings.isFullWidthCharacter(codePoint) || strings.isEmojiImprecise(codePoint)) {
                    pos = pos + 2;
                }
                else {
                    pos = pos + 1;
                }
            }
        }
        result.push(pos);
        return result;
    }
    static visibleColumnFromColumn2(config, model, position) {
        return this.visibleColumnFromColumn(model.getLineContent(position.lineNumber), position.column, config.tabSize);
    }
    static columnFromVisibleColumn(lineContent, visibleColumn, tabSize) {
        if (visibleColumn <= 0) {
            return 1;
        }
        const lineLength = lineContent.length;
        let beforeVisibleColumn = 0;
        let beforeColumn = 1;
        let i = 0;
        while (i < lineLength) {
            const codePoint = strings.getNextCodePoint(lineContent, lineLength, i);
            i += (codePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
            let afterVisibleColumn;
            if (codePoint === 9 /* Tab */) {
                afterVisibleColumn = CursorColumns.nextRenderTabStop(beforeVisibleColumn, tabSize);
            }
            else {
                let graphemeBreakType = strings.getGraphemeBreakType(codePoint);
                while (i < lineLength) {
                    const nextCodePoint = strings.getNextCodePoint(lineContent, lineLength, i);
                    const nextGraphemeBreakType = strings.getGraphemeBreakType(nextCodePoint);
                    if (strings.breakBetweenGraphemeBreakType(graphemeBreakType, nextGraphemeBreakType)) {
                        break;
                    }
                    i += (nextCodePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
                    graphemeBreakType = nextGraphemeBreakType;
                }
                if (strings.isFullWidthCharacter(codePoint) || strings.isEmojiImprecise(codePoint)) {
                    afterVisibleColumn = beforeVisibleColumn + 2;
                }
                else {
                    afterVisibleColumn = beforeVisibleColumn + 1;
                }
            }
            const afterColumn = i + 1;
            if (afterVisibleColumn >= visibleColumn) {
                const beforeDelta = visibleColumn - beforeVisibleColumn;
                const afterDelta = afterVisibleColumn - visibleColumn;
                if (afterDelta < beforeDelta) {
                    return afterColumn;
                }
                else {
                    return beforeColumn;
                }
            }
            beforeVisibleColumn = afterVisibleColumn;
            beforeColumn = afterColumn;
        }
        // walked the entire string
        return lineLength + 1;
    }
    static columnFromVisibleColumn2(config, model, lineNumber, visibleColumn) {
        let result = this.columnFromVisibleColumn(model.getLineContent(lineNumber), visibleColumn, config.tabSize);
        let minColumn = model.getLineMinColumn(lineNumber);
        if (result < minColumn) {
            return minColumn;
        }
        let maxColumn = model.getLineMaxColumn(lineNumber);
        if (result > maxColumn) {
            return maxColumn;
        }
        return result;
    }
    /**
     * ATTENTION: This works with 0-based columns (as oposed to the regular 1-based columns)
     */
    static nextRenderTabStop(visibleColumn, tabSize) {
        return visibleColumn + tabSize - visibleColumn % tabSize;
    }
    /**
     * ATTENTION: This works with 0-based columns (as oposed to the regular 1-based columns)
     */
    static nextIndentTabStop(visibleColumn, indentSize) {
        return visibleColumn + indentSize - visibleColumn % indentSize;
    }
    /**
     * ATTENTION: This works with 0-based columns (as opposed to the regular 1-based columns)
     */
    static prevRenderTabStop(column, tabSize) {
        return Math.max(0, column - 1 - (column - 1) % tabSize);
    }
    /**
     * ATTENTION: This works with 0-based columns (as opposed to the regular 1-based columns)
     */
    static prevIndentTabStop(column, indentSize) {
        return Math.max(0, column - 1 - (column - 1) % indentSize);
    }
}
export function isQuote(ch) {
    return (ch === '\'' || ch === '"' || ch === '`');
}
