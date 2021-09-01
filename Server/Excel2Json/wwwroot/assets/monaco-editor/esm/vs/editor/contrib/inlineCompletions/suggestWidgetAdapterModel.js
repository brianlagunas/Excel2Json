/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { RunOnceScheduler } from '../../../base/common/async.js';
import { Event } from '../../../base/common/event.js';
import { toDisposable } from '../../../base/common/lifecycle.js';
import { Range } from '../../common/core/range.js';
import { BaseGhostTextWidgetModel, GhostText } from './ghostText.js';
import { inlineCompletionToGhostText } from './inlineCompletionsModel.js';
import { SnippetParser } from '../snippet/snippetParser.js';
import { SnippetSession } from '../snippet/snippetSession.js';
import { SuggestController } from '../suggest/suggestController.js';
export class SuggestWidgetAdapterModel extends BaseGhostTextWidgetModel {
    constructor(editor) {
        super(editor);
        this.isSuggestWidgetVisible = false;
        this.currentGhostText = undefined;
        this._isActive = false;
        this.isShiftKeyPressed = false;
        this.minReservedLineCount = 0;
        // This delay fixes an suggest widget issue when typing "." immediately restarts the suggestion session.
        this.setInactiveDelayed = this._register(new RunOnceScheduler(() => {
            if (!this.isSuggestWidgetVisible) {
                if (this.isActive) {
                    this._isActive = false;
                    this.onDidChangeEmitter.fire();
                }
            }
        }, 100));
        const suggestController = SuggestController.get(this.editor);
        if (suggestController) {
            let isBoundToSuggestWidget = false;
            const bindToSuggestWidget = () => {
                if (isBoundToSuggestWidget) {
                    return;
                }
                isBoundToSuggestWidget = true;
                this._register(suggestController.widget.value.onDidShow(() => {
                    this.isSuggestWidgetVisible = true;
                    this._isActive = true;
                    this.updateFromSuggestion();
                }));
                this._register(suggestController.widget.value.onDidHide(() => {
                    this.isSuggestWidgetVisible = false;
                    this.setInactiveDelayed.schedule();
                    this.minReservedLineCount = 0;
                    this.updateFromSuggestion();
                }));
                this._register(suggestController.widget.value.onDidFocus(() => {
                    this.isSuggestWidgetVisible = true;
                    this._isActive = true;
                    this.updateFromSuggestion();
                }));
            };
            this._register(Event.once(suggestController.model.onDidTrigger)(e => {
                bindToSuggestWidget();
            }));
        }
        this.updateFromSuggestion();
        this._register(this.editor.onDidChangeCursorPosition((e) => {
            if (this.isSuggestionPreviewEnabled()) {
                this.update();
            }
        }));
        this._register(toDisposable(() => {
            const suggestController = SuggestController.get(this.editor);
            if (suggestController) {
                suggestController.stopForceRenderingAbove();
            }
        }));
        // See the command acceptAlternativeSelectedSuggestion that is bound to shift+tab
        this._register(editor.onKeyDown(e => {
            if (e.shiftKey && !this.isShiftKeyPressed) {
                this.isShiftKeyPressed = true;
                this.updateFromSuggestion();
            }
        }));
        this._register(editor.onKeyUp(e => {
            if (e.shiftKey && this.isShiftKeyPressed) {
                this.isShiftKeyPressed = false;
                this.updateFromSuggestion();
            }
        }));
    }
    get isActive() { return this._isActive; }
    setExpanded(expanded) {
        super.setExpanded(expanded);
        this.updateFromSuggestion();
    }
    isSuggestionPreviewEnabled() {
        const suggestOptions = this.editor.getOption(105 /* suggest */);
        return suggestOptions.preview;
    }
    updateFromSuggestion() {
        const suggestController = SuggestController.get(this.editor);
        if (!suggestController) {
            this.setCurrentInlineCompletion(undefined);
            return;
        }
        if (!this.isSuggestWidgetVisible) {
            this.setCurrentInlineCompletion(undefined);
            return;
        }
        const focusedItem = suggestController.widget.value.getFocusedItem();
        if (!focusedItem) {
            this.setCurrentInlineCompletion(undefined);
            return;
        }
        // TODO: item.isResolved
        this.setCurrentInlineCompletion(getInlineCompletion(suggestController, this.editor.getPosition(), focusedItem, this.isShiftKeyPressed));
    }
    setCurrentInlineCompletion(completion) {
        this.currentCompletion = completion;
        this.update();
    }
    update() {
        const completion = this.currentCompletion;
        const mode = this.editor.getOptions().get(105 /* suggest */).previewMode;
        this.setGhostText(completion
            ? (inlineCompletionToGhostText(completion, this.editor.getModel(), mode, this.editor.getPosition()) ||
                // Show an invisible ghost text to reserve space
                new GhostText(completion.range.endLineNumber, [], this.minReservedLineCount))
            : undefined);
    }
    setGhostText(newGhostText) {
        if (GhostText.equals(this.currentGhostText, newGhostText)) {
            return;
        }
        this.currentGhostText = newGhostText;
        if (this.currentGhostText && this.expanded) {
            this.minReservedLineCount = Math.max(this.minReservedLineCount, ...this.currentGhostText.parts.map(p => p.lines.length - 1));
        }
        const suggestController = SuggestController.get(this.editor);
        if (suggestController) {
            if (this.minReservedLineCount >= 1 && this.isSuggestionPreviewEnabled()) {
                suggestController.forceRenderingAbove();
            }
            else {
                suggestController.stopForceRenderingAbove();
            }
        }
        this.onDidChangeEmitter.fire();
    }
    get ghostText() {
        return this.isSuggestionPreviewEnabled()
            ? this.currentGhostText
            : undefined;
    }
}
function getInlineCompletion(suggestController, position, suggestion, toggleMode) {
    const item = suggestion.item;
    if (Array.isArray(item.completion.additionalTextEdits)) {
        // cannot represent additional text edits
        return {
            text: '',
            range: Range.fromPositions(position, position),
        };
    }
    let { insertText } = item.completion;
    if (item.completion.insertTextRules & 4 /* InsertAsSnippet */) {
        const snippet = new SnippetParser().parse(insertText);
        const model = suggestController.editor.getModel();
        SnippetSession.adjustWhitespace(model, position, snippet, true, true);
        insertText = snippet.toString();
    }
    const info = suggestController.getOverwriteInfo(item, toggleMode);
    return {
        text: insertText,
        range: Range.fromPositions(position.delta(0, -info.overwriteBefore), position.delta(0, Math.max(info.overwriteAfter, 0))),
    };
}
