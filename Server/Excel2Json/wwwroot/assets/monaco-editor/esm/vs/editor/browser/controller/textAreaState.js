/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as strings from '../../../base/common/strings.js';
import { Position } from '../../common/core/position.js';
import { Range } from '../../common/core/range.js';
export const _debugComposition = false;
export class TextAreaState {
    constructor(value, selectionStart, selectionEnd, selectionStartPosition, selectionEndPosition) {
        this.value = value;
        this.selectionStart = selectionStart;
        this.selectionEnd = selectionEnd;
        this.selectionStartPosition = selectionStartPosition;
        this.selectionEndPosition = selectionEndPosition;
    }
    toString() {
        return '[ <' + this.value + '>, selectionStart: ' + this.selectionStart + ', selectionEnd: ' + this.selectionEnd + ']';
    }
    static readFromTextArea(textArea) {
        return new TextAreaState(textArea.getValue(), textArea.getSelectionStart(), textArea.getSelectionEnd(), null, null);
    }
    collapseSelection() {
        return new TextAreaState(this.value, this.value.length, this.value.length, null, null);
    }
    writeToTextArea(reason, textArea, select) {
        if (_debugComposition) {
            console.log('writeToTextArea ' + reason + ': ' + this.toString());
        }
        textArea.setValue(reason, this.value);
        if (select) {
            textArea.setSelectionRange(reason, this.selectionStart, this.selectionEnd);
        }
    }
    deduceEditorPosition(offset) {
        if (offset <= this.selectionStart) {
            const str = this.value.substring(offset, this.selectionStart);
            return this._finishDeduceEditorPosition(this.selectionStartPosition, str, -1);
        }
        if (offset >= this.selectionEnd) {
            const str = this.value.substring(this.selectionEnd, offset);
            return this._finishDeduceEditorPosition(this.selectionEndPosition, str, 1);
        }
        const str1 = this.value.substring(this.selectionStart, offset);
        if (str1.indexOf(String.fromCharCode(8230)) === -1) {
            return this._finishDeduceEditorPosition(this.selectionStartPosition, str1, 1);
        }
        const str2 = this.value.substring(offset, this.selectionEnd);
        return this._finishDeduceEditorPosition(this.selectionEndPosition, str2, -1);
    }
    _finishDeduceEditorPosition(anchor, deltaText, signum) {
        let lineFeedCnt = 0;
        let lastLineFeedIndex = -1;
        while ((lastLineFeedIndex = deltaText.indexOf('\n', lastLineFeedIndex + 1)) !== -1) {
            lineFeedCnt++;
        }
        return [anchor, signum * deltaText.length, lineFeedCnt];
    }
    static selectedText(text) {
        return new TextAreaState(text, 0, text.length, null, null);
    }
    static deduceInput(previousState, currentState, couldBeEmojiInput) {
        if (!previousState) {
            // This is the EMPTY state
            return {
                text: '',
                replacePrevCharCnt: 0,
                replaceNextCharCnt: 0,
                positionDelta: 0
            };
        }
        if (_debugComposition) {
            console.log('------------------------deduceInput');
            console.log('PREVIOUS STATE: ' + previousState.toString());
            console.log('CURRENT STATE: ' + currentState.toString());
        }
        let previousValue = previousState.value;
        let previousSelectionStart = previousState.selectionStart;
        let previousSelectionEnd = previousState.selectionEnd;
        let currentValue = currentState.value;
        let currentSelectionStart = currentState.selectionStart;
        let currentSelectionEnd = currentState.selectionEnd;
        // Strip the previous suffix from the value (without interfering with the current selection)
        const previousSuffix = previousValue.substring(previousSelectionEnd);
        const currentSuffix = currentValue.substring(currentSelectionEnd);
        const suffixLength = strings.commonSuffixLength(previousSuffix, currentSuffix);
        currentValue = currentValue.substring(0, currentValue.length - suffixLength);
        previousValue = previousValue.substring(0, previousValue.length - suffixLength);
        const previousPrefix = previousValue.substring(0, previousSelectionStart);
        const currentPrefix = currentValue.substring(0, currentSelectionStart);
        const prefixLength = strings.commonPrefixLength(previousPrefix, currentPrefix);
        currentValue = currentValue.substring(prefixLength);
        previousValue = previousValue.substring(prefixLength);
        currentSelectionStart -= prefixLength;
        previousSelectionStart -= prefixLength;
        currentSelectionEnd -= prefixLength;
        previousSelectionEnd -= prefixLength;
        if (_debugComposition) {
            console.log('AFTER DIFFING PREVIOUS STATE: <' + previousValue + '>, selectionStart: ' + previousSelectionStart + ', selectionEnd: ' + previousSelectionEnd);
            console.log('AFTER DIFFING CURRENT STATE: <' + currentValue + '>, selectionStart: ' + currentSelectionStart + ', selectionEnd: ' + currentSelectionEnd);
        }
        if (couldBeEmojiInput && currentSelectionStart === currentSelectionEnd && previousValue.length > 0) {
            // on OSX, emojis from the emoji picker are inserted at random locations
            // the only hints we can use is that the selection is immediately after the inserted emoji
            // and that none of the old text has been deleted
            let potentialEmojiInput = null;
            if (currentSelectionStart === currentValue.length) {
                // emoji potentially inserted "somewhere" after the previous selection => it should appear at the end of `currentValue`
                if (currentValue.startsWith(previousValue)) {
                    // only if all of the old text is accounted for
                    potentialEmojiInput = currentValue.substring(previousValue.length);
                }
            }
            else {
                // emoji potentially inserted "somewhere" before the previous selection => it should appear at the start of `currentValue`
                if (currentValue.endsWith(previousValue)) {
                    // only if all of the old text is accounted for
                    potentialEmojiInput = currentValue.substring(0, currentValue.length - previousValue.length);
                }
            }
            if (potentialEmojiInput !== null && potentialEmojiInput.length > 0) {
                // now we check that this is indeed an emoji
                // emojis can grow quite long, so a length check is of no help
                // e.g. 1F3F4 E0067 E0062 E0065 E006E E0067 E007F  ; fully-qualified     # 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England
                // Oftentimes, emojis use Variation Selector-16 (U+FE0F), so that is a good hint
                // http://emojipedia.org/variation-selector-16/
                // > An invisible codepoint which specifies that the preceding character
                // > should be displayed with emoji presentation. Only required if the
                // > preceding character defaults to text presentation.
                if (/\uFE0F/.test(potentialEmojiInput) || strings.containsEmoji(potentialEmojiInput)) {
                    return {
                        text: potentialEmojiInput,
                        replacePrevCharCnt: 0,
                        replaceNextCharCnt: 0,
                        positionDelta: 0
                    };
                }
            }
        }
        if (currentSelectionStart === currentSelectionEnd) {
            // composition accept case (noticed in FF + Japanese)
            // [blahblah] => blahblah|
            if (previousValue === currentValue
                && previousSelectionStart === 0
                && previousSelectionEnd === previousValue.length
                && currentSelectionStart === currentValue.length
                && currentValue.indexOf('\n') === -1) {
                if (strings.containsFullWidthCharacter(currentValue)) {
                    return {
                        text: '',
                        replacePrevCharCnt: 0,
                        replaceNextCharCnt: 0,
                        positionDelta: 0
                    };
                }
            }
            // no current selection
            const replacePreviousCharacters = (previousPrefix.length - prefixLength);
            if (_debugComposition) {
                console.log('REMOVE PREVIOUS: ' + (previousPrefix.length - prefixLength) + ' chars');
            }
            return {
                text: currentValue,
                replacePrevCharCnt: replacePreviousCharacters,
                replaceNextCharCnt: 0,
                positionDelta: 0
            };
        }
        // there is a current selection => composition case
        const replacePreviousCharacters = previousSelectionEnd - previousSelectionStart;
        return {
            text: currentValue,
            replacePrevCharCnt: replacePreviousCharacters,
            replaceNextCharCnt: 0,
            positionDelta: 0
        };
    }
    static deduceAndroidCompositionInput(previousState, currentState) {
        if (!previousState) {
            // This is the EMPTY state
            return {
                text: '',
                replacePrevCharCnt: 0,
                replaceNextCharCnt: 0,
                positionDelta: 0
            };
        }
        if (_debugComposition) {
            console.log('------------------------deduceAndroidCompositionInput');
            console.log('PREVIOUS STATE: ' + previousState.toString());
            console.log('CURRENT STATE: ' + currentState.toString());
        }
        if (previousState.value === currentState.value) {
            return {
                text: '',
                replacePrevCharCnt: 0,
                replaceNextCharCnt: 0,
                positionDelta: currentState.selectionEnd - previousState.selectionEnd
            };
        }
        const prefixLength = Math.min(strings.commonPrefixLength(previousState.value, currentState.value), previousState.selectionEnd);
        const suffixLength = Math.min(strings.commonSuffixLength(previousState.value, currentState.value), previousState.value.length - previousState.selectionEnd);
        const previousValue = previousState.value.substring(prefixLength, previousState.value.length - suffixLength);
        const currentValue = currentState.value.substring(prefixLength, currentState.value.length - suffixLength);
        const previousSelectionStart = previousState.selectionStart - prefixLength;
        const previousSelectionEnd = previousState.selectionEnd - prefixLength;
        const currentSelectionStart = currentState.selectionStart - prefixLength;
        const currentSelectionEnd = currentState.selectionEnd - prefixLength;
        if (_debugComposition) {
            console.log('AFTER DIFFING PREVIOUS STATE: <' + previousValue + '>, selectionStart: ' + previousSelectionStart + ', selectionEnd: ' + previousSelectionEnd);
            console.log('AFTER DIFFING CURRENT STATE: <' + currentValue + '>, selectionStart: ' + currentSelectionStart + ', selectionEnd: ' + currentSelectionEnd);
        }
        return {
            text: currentValue,
            replacePrevCharCnt: previousSelectionEnd,
            replaceNextCharCnt: previousValue.length - previousSelectionEnd,
            positionDelta: currentSelectionEnd - currentValue.length
        };
    }
}
TextAreaState.EMPTY = new TextAreaState('', 0, 0, null, null);
export class PagedScreenReaderStrategy {
    static _getPageOfLine(lineNumber, linesPerPage) {
        return Math.floor((lineNumber - 1) / linesPerPage);
    }
    static _getRangeForPage(page, linesPerPage) {
        const offset = page * linesPerPage;
        const startLineNumber = offset + 1;
        const endLineNumber = offset + linesPerPage;
        return new Range(startLineNumber, 1, endLineNumber + 1, 1);
    }
    static fromEditorSelection(previousState, model, selection, linesPerPage, trimLongText) {
        const selectionStartPage = PagedScreenReaderStrategy._getPageOfLine(selection.startLineNumber, linesPerPage);
        const selectionStartPageRange = PagedScreenReaderStrategy._getRangeForPage(selectionStartPage, linesPerPage);
        const selectionEndPage = PagedScreenReaderStrategy._getPageOfLine(selection.endLineNumber, linesPerPage);
        const selectionEndPageRange = PagedScreenReaderStrategy._getRangeForPage(selectionEndPage, linesPerPage);
        const pretextRange = selectionStartPageRange.intersectRanges(new Range(1, 1, selection.startLineNumber, selection.startColumn));
        let pretext = model.getValueInRange(pretextRange, 1 /* LF */);
        const lastLine = model.getLineCount();
        const lastLineMaxColumn = model.getLineMaxColumn(lastLine);
        const posttextRange = selectionEndPageRange.intersectRanges(new Range(selection.endLineNumber, selection.endColumn, lastLine, lastLineMaxColumn));
        let posttext = model.getValueInRange(posttextRange, 1 /* LF */);
        let text;
        if (selectionStartPage === selectionEndPage || selectionStartPage + 1 === selectionEndPage) {
            // take full selection
            text = model.getValueInRange(selection, 1 /* LF */);
        }
        else {
            const selectionRange1 = selectionStartPageRange.intersectRanges(selection);
            const selectionRange2 = selectionEndPageRange.intersectRanges(selection);
            text = (model.getValueInRange(selectionRange1, 1 /* LF */)
                + String.fromCharCode(8230)
                + model.getValueInRange(selectionRange2, 1 /* LF */));
        }
        // Chromium handles very poorly text even of a few thousand chars
        // Cut text to avoid stalling the entire UI
        if (trimLongText) {
            const LIMIT_CHARS = 500;
            if (pretext.length > LIMIT_CHARS) {
                pretext = pretext.substring(pretext.length - LIMIT_CHARS, pretext.length);
            }
            if (posttext.length > LIMIT_CHARS) {
                posttext = posttext.substring(0, LIMIT_CHARS);
            }
            if (text.length > 2 * LIMIT_CHARS) {
                text = text.substring(0, LIMIT_CHARS) + String.fromCharCode(8230) + text.substring(text.length - LIMIT_CHARS, text.length);
            }
        }
        return new TextAreaState(pretext + text + posttext, pretext.length, pretext.length + text.length, new Position(selection.startLineNumber, selection.startColumn), new Position(selection.endLineNumber, selection.endColumn));
    }
}
