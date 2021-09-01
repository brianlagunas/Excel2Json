/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import './codicon/codicon.css';
import './codicon/codicon-modifiers.css';
import { Codicon } from '../../../common/codicons.js';
export function formatRule(c) {
    let def = c.definition;
    while (def instanceof Codicon) {
        def = def.definition;
    }
    return `.codicon-${c.id}:before { content: '${def.fontCharacter}'; }`;
}
