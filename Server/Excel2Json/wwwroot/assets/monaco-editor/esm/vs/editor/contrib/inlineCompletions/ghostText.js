/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
export class GhostText {
    constructor(lineNumber, parts, additionalReservedLineCount = 0) {
        this.lineNumber = lineNumber;
        this.parts = parts;
        this.additionalReservedLineCount = additionalReservedLineCount;
    }
    static equals(a, b) {
        return a === b || (!!a && !!b && a.equals(b));
    }
    equals(other) {
        return this.lineNumber === other.lineNumber &&
            this.parts.length === other.parts.length &&
            this.parts.every((part, index) => part.equals(other.parts[index]));
    }
}
export class GhostTextPart {
    constructor(column, lines) {
        this.column = column;
        this.lines = lines;
    }
    equals(other) {
        return this.column === other.column &&
            this.lines.length === other.lines.length &&
            this.lines.every((line, index) => line === other.lines[index]);
    }
}
export class BaseGhostTextWidgetModel extends Disposable {
    constructor(editor) {
        super();
        this.editor = editor;
        this._expanded = undefined;
        this.onDidChangeEmitter = new Emitter();
        this.onDidChange = this.onDidChangeEmitter.event;
        this._register(editor.onDidChangeConfiguration((e) => {
            if (e.hasChanged(105 /* suggest */) && this._expanded === undefined) {
                this.onDidChangeEmitter.fire();
            }
        }));
    }
    get expanded() {
        if (this._expanded === undefined) {
            // TODO this should use a global hidden setting.
            // See https://github.com/microsoft/vscode/issues/125037.
            return true;
        }
        return this._expanded;
    }
    setExpanded(expanded) {
        this._expanded = true;
        this.onDidChangeEmitter.fire();
    }
}
