/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as nls from '../../../nls.js';
import * as dom from '../../../base/browser/dom.js';
import { toDisposable, DisposableStore, Disposable } from '../../../base/common/lifecycle.js';
import { Range } from '../../common/core/range.js';
import { isNonEmptyArray } from '../../../base/common/arrays.js';
import { IMarkerData, MarkerSeverity } from '../../../platform/markers/common/markers.js';
import { basename } from '../../../base/common/resources.js';
import { IMarkerDecorationsService } from '../../common/services/markersDecorationService.js';
import { onUnexpectedError } from '../../../base/common/errors.js';
import { IOpenerService } from '../../../platform/opener/common/opener.js';
import { MarkerController, NextMarkerAction } from '../gotoError/gotoError.js';
import { createCancelablePromise, disposableTimeout } from '../../../base/common/async.js';
import { getCodeActions } from '../codeAction/codeAction.js';
import { QuickFixAction, QuickFixController } from '../codeAction/codeActionCommands.js';
import { CodeActionKind } from '../codeAction/types.js';
import { Progress } from '../../../platform/progress/common/progress.js';
import { registerThemingParticipant } from '../../../platform/theme/common/themeService.js';
import { textLinkActiveForeground, textLinkForeground } from '../../../platform/theme/common/colorRegistry.js';
const $ = dom.$;
export class MarkerHover {
    constructor(owner, range, marker) {
        this.owner = owner;
        this.range = range;
        this.marker = marker;
    }
    isValidForHoverAnchor(anchor) {
        return (anchor.type === 1 /* Range */
            && this.range.startColumn <= anchor.range.startColumn
            && this.range.endColumn >= anchor.range.endColumn);
    }
}
const markerCodeActionTrigger = {
    type: 1 /* Invoke */,
    filter: { include: CodeActionKind.QuickFix }
};
let MarkerHoverParticipant = class MarkerHoverParticipant {
    constructor(_editor, _hover, _markerDecorationsService, _openerService) {
        this._editor = _editor;
        this._hover = _hover;
        this._markerDecorationsService = _markerDecorationsService;
        this._openerService = _openerService;
        this.recentMarkerCodeActionsInfo = undefined;
    }
    computeSync(anchor, lineDecorations) {
        if (!this._editor.hasModel() || anchor.type !== 1 /* Range */) {
            return [];
        }
        const model = this._editor.getModel();
        const lineNumber = anchor.range.startLineNumber;
        const maxColumn = model.getLineMaxColumn(lineNumber);
        const result = [];
        for (const d of lineDecorations) {
            const startColumn = (d.range.startLineNumber === lineNumber) ? d.range.startColumn : 1;
            const endColumn = (d.range.endLineNumber === lineNumber) ? d.range.endColumn : maxColumn;
            const marker = this._markerDecorationsService.getMarker(model.uri, d);
            if (!marker) {
                continue;
            }
            const range = new Range(anchor.range.startLineNumber, startColumn, anchor.range.startLineNumber, endColumn);
            result.push(new MarkerHover(this, range, marker));
        }
        return result;
    }
    renderHoverParts(hoverParts, fragment, statusBar) {
        if (!hoverParts.length) {
            return Disposable.None;
        }
        const disposables = new DisposableStore();
        hoverParts.forEach(msg => fragment.appendChild(this.renderMarkerHover(msg, disposables)));
        const markerHoverForStatusbar = hoverParts.length === 1 ? hoverParts[0] : hoverParts.sort((a, b) => MarkerSeverity.compare(a.marker.severity, b.marker.severity))[0];
        this.renderMarkerStatusbar(markerHoverForStatusbar, statusBar, disposables);
        return disposables;
    }
    renderMarkerHover(markerHover, disposables) {
        const hoverElement = $('div.hover-row');
        const markerElement = dom.append(hoverElement, $('div.marker.hover-contents'));
        const { source, message, code, relatedInformation } = markerHover.marker;
        this._editor.applyFontInfo(markerElement);
        const messageElement = dom.append(markerElement, $('span'));
        messageElement.style.whiteSpace = 'pre-wrap';
        messageElement.innerText = message;
        if (source || code) {
            // Code has link
            if (code && typeof code !== 'string') {
                const sourceAndCodeElement = $('span');
                if (source) {
                    const sourceElement = dom.append(sourceAndCodeElement, $('span'));
                    sourceElement.innerText = source;
                }
                const codeLink = dom.append(sourceAndCodeElement, $('a.code-link'));
                codeLink.setAttribute('href', code.target.toString());
                disposables.add(dom.addDisposableListener(codeLink, 'click', (e) => {
                    this._openerService.open(code.target, { allowCommands: true });
                    e.preventDefault();
                    e.stopPropagation();
                }));
                const codeElement = dom.append(codeLink, $('span'));
                codeElement.innerText = code.value;
                const detailsElement = dom.append(markerElement, sourceAndCodeElement);
                detailsElement.style.opacity = '0.6';
                detailsElement.style.paddingLeft = '6px';
            }
            else {
                const detailsElement = dom.append(markerElement, $('span'));
                detailsElement.style.opacity = '0.6';
                detailsElement.style.paddingLeft = '6px';
                detailsElement.innerText = source && code ? `${source}(${code})` : source ? source : `(${code})`;
            }
        }
        if (isNonEmptyArray(relatedInformation)) {
            for (const { message, resource, startLineNumber, startColumn } of relatedInformation) {
                const relatedInfoContainer = dom.append(markerElement, $('div'));
                relatedInfoContainer.style.marginTop = '8px';
                const a = dom.append(relatedInfoContainer, $('a'));
                a.innerText = `${basename(resource)}(${startLineNumber}, ${startColumn}): `;
                a.style.cursor = 'pointer';
                disposables.add(dom.addDisposableListener(a, 'click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (this._openerService) {
                        this._openerService.open(resource, {
                            fromUserGesture: true,
                            editorOptions: { selection: { startLineNumber, startColumn } }
                        }).catch(onUnexpectedError);
                    }
                }));
                const messageElement = dom.append(relatedInfoContainer, $('span'));
                messageElement.innerText = message;
                this._editor.applyFontInfo(messageElement);
            }
        }
        return hoverElement;
    }
    renderMarkerStatusbar(markerHover, statusBar, disposables) {
        if (markerHover.marker.severity === MarkerSeverity.Error || markerHover.marker.severity === MarkerSeverity.Warning || markerHover.marker.severity === MarkerSeverity.Info) {
            statusBar.addAction({
                label: nls.localize('view problem', "View Problem"),
                commandId: NextMarkerAction.ID,
                run: () => {
                    this._hover.hide();
                    MarkerController.get(this._editor).showAtMarker(markerHover.marker);
                    this._editor.focus();
                }
            });
        }
        if (!this._editor.getOption(79 /* readOnly */)) {
            const quickfixPlaceholderElement = statusBar.append($('div'));
            if (this.recentMarkerCodeActionsInfo) {
                if (IMarkerData.makeKey(this.recentMarkerCodeActionsInfo.marker) === IMarkerData.makeKey(markerHover.marker)) {
                    if (!this.recentMarkerCodeActionsInfo.hasCodeActions) {
                        quickfixPlaceholderElement.textContent = nls.localize('noQuickFixes', "No quick fixes available");
                    }
                }
                else {
                    this.recentMarkerCodeActionsInfo = undefined;
                }
            }
            const updatePlaceholderDisposable = this.recentMarkerCodeActionsInfo && !this.recentMarkerCodeActionsInfo.hasCodeActions ? Disposable.None : disposables.add(disposableTimeout(() => quickfixPlaceholderElement.textContent = nls.localize('checkingForQuickFixes', "Checking for quick fixes..."), 200));
            if (!quickfixPlaceholderElement.textContent) {
                // Have some content in here to avoid flickering
                quickfixPlaceholderElement.textContent = String.fromCharCode(0xA0); // &nbsp;
            }
            const codeActionsPromise = this.getCodeActions(markerHover.marker);
            disposables.add(toDisposable(() => codeActionsPromise.cancel()));
            codeActionsPromise.then(actions => {
                updatePlaceholderDisposable.dispose();
                this.recentMarkerCodeActionsInfo = { marker: markerHover.marker, hasCodeActions: actions.validActions.length > 0 };
                if (!this.recentMarkerCodeActionsInfo.hasCodeActions) {
                    actions.dispose();
                    quickfixPlaceholderElement.textContent = nls.localize('noQuickFixes', "No quick fixes available");
                    return;
                }
                quickfixPlaceholderElement.style.display = 'none';
                let showing = false;
                disposables.add(toDisposable(() => {
                    if (!showing) {
                        actions.dispose();
                    }
                }));
                statusBar.addAction({
                    label: nls.localize('quick fixes', "Quick Fix..."),
                    commandId: QuickFixAction.Id,
                    run: (target) => {
                        showing = true;
                        const controller = QuickFixController.get(this._editor);
                        const elementPosition = dom.getDomNodePagePosition(target);
                        // Hide the hover pre-emptively, otherwise the editor can close the code actions
                        // context menu as well when using keyboard navigation
                        this._hover.hide();
                        controller.showCodeActions(markerCodeActionTrigger, actions, {
                            x: elementPosition.left + 6,
                            y: elementPosition.top + elementPosition.height + 6
                        });
                    }
                });
            });
        }
    }
    getCodeActions(marker) {
        return createCancelablePromise(cancellationToken => {
            return getCodeActions(this._editor.getModel(), new Range(marker.startLineNumber, marker.startColumn, marker.endLineNumber, marker.endColumn), markerCodeActionTrigger, Progress.None, cancellationToken);
        });
    }
};
MarkerHoverParticipant = __decorate([
    __param(2, IMarkerDecorationsService),
    __param(3, IOpenerService)
], MarkerHoverParticipant);
export { MarkerHoverParticipant };
registerThemingParticipant((theme, collector) => {
    const linkFg = theme.getColor(textLinkForeground);
    if (linkFg) {
        collector.addRule(`.monaco-hover .hover-contents a.code-link span { color: ${linkFg}; }`);
    }
    const activeLinkFg = theme.getColor(textLinkActiveForeground);
    if (activeLinkFg) {
        collector.addRule(`.monaco-hover .hover-contents a.code-link span:hover { color: ${activeLinkFg}; }`);
    }
});
