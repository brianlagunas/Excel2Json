/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as platform from '../../registry/common/platform.js';
import { Color, RGBA } from '../../../base/common/color.js';
import { Emitter } from '../../../base/common/event.js';
import * as nls from '../../../nls.js';
import { Extensions as JSONExtensions } from '../../jsonschemas/common/jsonContributionRegistry.js';
import { RunOnceScheduler } from '../../../base/common/async.js';
import { assertNever } from '../../../base/common/types.js';
// color registry
export const Extensions = {
    ColorContribution: 'base.contributions.colors'
};
class ColorRegistry {
    constructor() {
        this._onDidChangeSchema = new Emitter();
        this.onDidChangeSchema = this._onDidChangeSchema.event;
        this.colorSchema = { type: 'object', properties: {} };
        this.colorReferenceSchema = { type: 'string', enum: [], enumDescriptions: [] };
        this.colorsById = {};
    }
    registerColor(id, defaults, description, needsTransparency = false, deprecationMessage) {
        let colorContribution = { id, description, defaults, needsTransparency, deprecationMessage };
        this.colorsById[id] = colorContribution;
        let propertySchema = { type: 'string', description, format: 'color-hex', defaultSnippets: [{ body: '${1:#ff0000}' }] };
        if (deprecationMessage) {
            propertySchema.deprecationMessage = deprecationMessage;
        }
        this.colorSchema.properties[id] = propertySchema;
        this.colorReferenceSchema.enum.push(id);
        this.colorReferenceSchema.enumDescriptions.push(description);
        this._onDidChangeSchema.fire();
        return id;
    }
    resolveDefaultColor(id, theme) {
        const colorDesc = this.colorsById[id];
        if (colorDesc && colorDesc.defaults) {
            const colorValue = colorDesc.defaults[theme.type];
            return resolveColorValue(colorValue, theme);
        }
        return undefined;
    }
    getColorSchema() {
        return this.colorSchema;
    }
    toString() {
        let sorter = (a, b) => {
            let cat1 = a.indexOf('.') === -1 ? 0 : 1;
            let cat2 = b.indexOf('.') === -1 ? 0 : 1;
            if (cat1 !== cat2) {
                return cat1 - cat2;
            }
            return a.localeCompare(b);
        };
        return Object.keys(this.colorsById).sort(sorter).map(k => `- \`${k}\`: ${this.colorsById[k].description}`).join('\n');
    }
}
const colorRegistry = new ColorRegistry();
platform.Registry.add(Extensions.ColorContribution, colorRegistry);
export function registerColor(id, defaults, description, needsTransparency, deprecationMessage) {
    return colorRegistry.registerColor(id, defaults, description, needsTransparency, deprecationMessage);
}
// ----- base colors
export const foreground = registerColor('foreground', { dark: '#CCCCCC', light: '#616161', hc: '#FFFFFF' }, nls.localize('foreground', "Overall foreground color. This color is only used if not overridden by a component."));
export const errorForeground = registerColor('errorForeground', { dark: '#F48771', light: '#A1260D', hc: '#F48771' }, nls.localize('errorForeground', "Overall foreground color for error messages. This color is only used if not overridden by a component."));
export const iconForeground = registerColor('icon.foreground', { dark: '#C5C5C5', light: '#424242', hc: '#FFFFFF' }, nls.localize('iconForeground', "The default color for icons in the workbench."));
export const focusBorder = registerColor('focusBorder', { dark: '#007FD4', light: '#0090F1', hc: '#F38518' }, nls.localize('focusBorder', "Overall border color for focused elements. This color is only used if not overridden by a component."));
export const contrastBorder = registerColor('contrastBorder', { light: null, dark: null, hc: '#6FC3DF' }, nls.localize('contrastBorder', "An extra border around elements to separate them from others for greater contrast."));
export const activeContrastBorder = registerColor('contrastActiveBorder', { light: null, dark: null, hc: focusBorder }, nls.localize('activeContrastBorder', "An extra border around active elements to separate them from others for greater contrast."));
export const textLinkForeground = registerColor('textLink.foreground', { light: '#006AB1', dark: '#3794FF', hc: '#3794FF' }, nls.localize('textLinkForeground', "Foreground color for links in text."));
export const textLinkActiveForeground = registerColor('textLink.activeForeground', { light: '#006AB1', dark: '#3794FF', hc: '#3794FF' }, nls.localize('textLinkActiveForeground', "Foreground color for links in text when clicked on and on mouse hover."));
export const textCodeBlockBackground = registerColor('textCodeBlock.background', { light: '#dcdcdc66', dark: '#0a0a0a66', hc: Color.black }, nls.localize('textCodeBlockBackground', "Background color for code blocks in text."));
// ----- widgets
export const widgetShadow = registerColor('widget.shadow', { dark: transparent(Color.black, .36), light: transparent(Color.black, .16), hc: null }, nls.localize('widgetShadow', 'Shadow color of widgets such as find/replace inside the editor.'));
export const inputBackground = registerColor('input.background', { dark: '#3C3C3C', light: Color.white, hc: Color.black }, nls.localize('inputBoxBackground', "Input box background."));
export const inputForeground = registerColor('input.foreground', { dark: foreground, light: foreground, hc: foreground }, nls.localize('inputBoxForeground', "Input box foreground."));
export const inputBorder = registerColor('input.border', { dark: null, light: null, hc: contrastBorder }, nls.localize('inputBoxBorder', "Input box border."));
export const inputActiveOptionBorder = registerColor('inputOption.activeBorder', { dark: '#007ACC00', light: '#007ACC00', hc: contrastBorder }, nls.localize('inputBoxActiveOptionBorder', "Border color of activated options in input fields."));
export const inputActiveOptionBackground = registerColor('inputOption.activeBackground', { dark: transparent(focusBorder, 0.4), light: transparent(focusBorder, 0.2), hc: Color.transparent }, nls.localize('inputOption.activeBackground', "Background color of activated options in input fields."));
export const inputActiveOptionForeground = registerColor('inputOption.activeForeground', { dark: Color.white, light: Color.black, hc: null }, nls.localize('inputOption.activeForeground', "Foreground color of activated options in input fields."));
export const inputValidationInfoBackground = registerColor('inputValidation.infoBackground', { dark: '#063B49', light: '#D6ECF2', hc: Color.black }, nls.localize('inputValidationInfoBackground', "Input validation background color for information severity."));
export const inputValidationInfoForeground = registerColor('inputValidation.infoForeground', { dark: null, light: null, hc: null }, nls.localize('inputValidationInfoForeground', "Input validation foreground color for information severity."));
export const inputValidationInfoBorder = registerColor('inputValidation.infoBorder', { dark: '#007acc', light: '#007acc', hc: contrastBorder }, nls.localize('inputValidationInfoBorder', "Input validation border color for information severity."));
export const inputValidationWarningBackground = registerColor('inputValidation.warningBackground', { dark: '#352A05', light: '#F6F5D2', hc: Color.black }, nls.localize('inputValidationWarningBackground', "Input validation background color for warning severity."));
export const inputValidationWarningForeground = registerColor('inputValidation.warningForeground', { dark: null, light: null, hc: null }, nls.localize('inputValidationWarningForeground', "Input validation foreground color for warning severity."));
export const inputValidationWarningBorder = registerColor('inputValidation.warningBorder', { dark: '#B89500', light: '#B89500', hc: contrastBorder }, nls.localize('inputValidationWarningBorder', "Input validation border color for warning severity."));
export const inputValidationErrorBackground = registerColor('inputValidation.errorBackground', { dark: '#5A1D1D', light: '#F2DEDE', hc: Color.black }, nls.localize('inputValidationErrorBackground', "Input validation background color for error severity."));
export const inputValidationErrorForeground = registerColor('inputValidation.errorForeground', { dark: null, light: null, hc: null }, nls.localize('inputValidationErrorForeground', "Input validation foreground color for error severity."));
export const inputValidationErrorBorder = registerColor('inputValidation.errorBorder', { dark: '#BE1100', light: '#BE1100', hc: contrastBorder }, nls.localize('inputValidationErrorBorder', "Input validation border color for error severity."));
export const selectBackground = registerColor('dropdown.background', { dark: '#3C3C3C', light: Color.white, hc: Color.black }, nls.localize('dropdownBackground', "Dropdown background."));
export const selectForeground = registerColor('dropdown.foreground', { dark: '#F0F0F0', light: null, hc: Color.white }, nls.localize('dropdownForeground', "Dropdown foreground."));
export const buttonForeground = registerColor('button.foreground', { dark: Color.white, light: Color.white, hc: Color.white }, nls.localize('buttonForeground', "Button foreground color."));
export const buttonBackground = registerColor('button.background', { dark: '#0E639C', light: '#007ACC', hc: null }, nls.localize('buttonBackground', "Button background color."));
export const buttonHoverBackground = registerColor('button.hoverBackground', { dark: lighten(buttonBackground, 0.2), light: darken(buttonBackground, 0.2), hc: null }, nls.localize('buttonHoverBackground', "Button background color when hovering."));
export const badgeBackground = registerColor('badge.background', { dark: '#4D4D4D', light: '#C4C4C4', hc: Color.black }, nls.localize('badgeBackground', "Badge background color. Badges are small information labels, e.g. for search results count."));
export const badgeForeground = registerColor('badge.foreground', { dark: Color.white, light: '#333', hc: Color.white }, nls.localize('badgeForeground', "Badge foreground color. Badges are small information labels, e.g. for search results count."));
export const scrollbarShadow = registerColor('scrollbar.shadow', { dark: '#000000', light: '#DDDDDD', hc: null }, nls.localize('scrollbarShadow', "Scrollbar shadow to indicate that the view is scrolled."));
export const scrollbarSliderBackground = registerColor('scrollbarSlider.background', { dark: Color.fromHex('#797979').transparent(0.4), light: Color.fromHex('#646464').transparent(0.4), hc: transparent(contrastBorder, 0.6) }, nls.localize('scrollbarSliderBackground', "Scrollbar slider background color."));
export const scrollbarSliderHoverBackground = registerColor('scrollbarSlider.hoverBackground', { dark: Color.fromHex('#646464').transparent(0.7), light: Color.fromHex('#646464').transparent(0.7), hc: transparent(contrastBorder, 0.8) }, nls.localize('scrollbarSliderHoverBackground', "Scrollbar slider background color when hovering."));
export const scrollbarSliderActiveBackground = registerColor('scrollbarSlider.activeBackground', { dark: Color.fromHex('#BFBFBF').transparent(0.4), light: Color.fromHex('#000000').transparent(0.6), hc: contrastBorder }, nls.localize('scrollbarSliderActiveBackground', "Scrollbar slider background color when clicked on."));
export const progressBarBackground = registerColor('progressBar.background', { dark: Color.fromHex('#0E70C0'), light: Color.fromHex('#0E70C0'), hc: contrastBorder }, nls.localize('progressBarBackground', "Background color of the progress bar that can show for long running operations."));
export const editorErrorBackground = registerColor('editorError.background', { dark: null, light: null, hc: null }, nls.localize('editorError.background', 'Background color of error text in the editor. The color must not be opaque so as not to hide underlying decorations.'), true);
export const editorErrorForeground = registerColor('editorError.foreground', { dark: '#F48771', light: '#E51400', hc: null }, nls.localize('editorError.foreground', 'Foreground color of error squigglies in the editor.'));
export const editorErrorBorder = registerColor('editorError.border', { dark: null, light: null, hc: Color.fromHex('#E47777').transparent(0.8) }, nls.localize('errorBorder', 'Border color of error boxes in the editor.'));
export const editorWarningBackground = registerColor('editorWarning.background', { dark: null, light: null, hc: null }, nls.localize('editorWarning.background', 'Background color of warning text in the editor. The color must not be opaque so as not to hide underlying decorations.'), true);
export const editorWarningForeground = registerColor('editorWarning.foreground', { dark: '#CCA700', light: '#BF8803', hc: null }, nls.localize('editorWarning.foreground', 'Foreground color of warning squigglies in the editor.'));
export const editorWarningBorder = registerColor('editorWarning.border', { dark: null, light: null, hc: Color.fromHex('#FFCC00').transparent(0.8) }, nls.localize('warningBorder', 'Border color of warning boxes in the editor.'));
export const editorInfoBackground = registerColor('editorInfo.background', { dark: null, light: null, hc: null }, nls.localize('editorInfo.background', 'Background color of info text in the editor. The color must not be opaque so as not to hide underlying decorations.'), true);
export const editorInfoForeground = registerColor('editorInfo.foreground', { dark: '#75BEFF', light: '#75BEFF', hc: null }, nls.localize('editorInfo.foreground', 'Foreground color of info squigglies in the editor.'));
export const editorInfoBorder = registerColor('editorInfo.border', { dark: null, light: null, hc: Color.fromHex('#75BEFF').transparent(0.8) }, nls.localize('infoBorder', 'Border color of info boxes in the editor.'));
export const editorHintForeground = registerColor('editorHint.foreground', { dark: Color.fromHex('#eeeeee').transparent(0.7), light: '#6c6c6c', hc: null }, nls.localize('editorHint.foreground', 'Foreground color of hint squigglies in the editor.'));
export const editorHintBorder = registerColor('editorHint.border', { dark: null, light: null, hc: Color.fromHex('#eeeeee').transparent(0.8) }, nls.localize('hintBorder', 'Border color of hint boxes in the editor.'));
/**
 * Editor background color.
 * Because of bug https://monacotools.visualstudio.com/DefaultCollection/Monaco/_workitems/edit/13254
 * we are *not* using the color white (or #ffffff, rgba(255,255,255)) but something very close to white.
 */
export const editorBackground = registerColor('editor.background', { light: '#fffffe', dark: '#1E1E1E', hc: Color.black }, nls.localize('editorBackground', "Editor background color."));
/**
 * Editor foreground color.
 */
export const editorForeground = registerColor('editor.foreground', { light: '#333333', dark: '#BBBBBB', hc: Color.white }, nls.localize('editorForeground', "Editor default foreground color."));
/**
 * Editor widgets
 */
export const editorWidgetBackground = registerColor('editorWidget.background', { dark: '#252526', light: '#F3F3F3', hc: '#0C141F' }, nls.localize('editorWidgetBackground', 'Background color of editor widgets, such as find/replace.'));
export const editorWidgetForeground = registerColor('editorWidget.foreground', { dark: foreground, light: foreground, hc: foreground }, nls.localize('editorWidgetForeground', 'Foreground color of editor widgets, such as find/replace.'));
export const editorWidgetBorder = registerColor('editorWidget.border', { dark: '#454545', light: '#C8C8C8', hc: contrastBorder }, nls.localize('editorWidgetBorder', 'Border color of editor widgets. The color is only used if the widget chooses to have a border and if the color is not overridden by a widget.'));
export const editorWidgetResizeBorder = registerColor('editorWidget.resizeBorder', { light: null, dark: null, hc: null }, nls.localize('editorWidgetResizeBorder', "Border color of the resize bar of editor widgets. The color is only used if the widget chooses to have a resize border and if the color is not overridden by a widget."));
/**
 * Quick pick widget
 */
export const quickInputBackground = registerColor('quickInput.background', { dark: editorWidgetBackground, light: editorWidgetBackground, hc: editorWidgetBackground }, nls.localize('pickerBackground', "Quick picker background color. The quick picker widget is the container for pickers like the command palette."));
export const quickInputForeground = registerColor('quickInput.foreground', { dark: editorWidgetForeground, light: editorWidgetForeground, hc: editorWidgetForeground }, nls.localize('pickerForeground', "Quick picker foreground color. The quick picker widget is the container for pickers like the command palette."));
export const quickInputTitleBackground = registerColor('quickInputTitle.background', { dark: new Color(new RGBA(255, 255, 255, 0.105)), light: new Color(new RGBA(0, 0, 0, 0.06)), hc: '#000000' }, nls.localize('pickerTitleBackground', "Quick picker title background color. The quick picker widget is the container for pickers like the command palette."));
export const pickerGroupForeground = registerColor('pickerGroup.foreground', { dark: '#3794FF', light: '#0066BF', hc: Color.white }, nls.localize('pickerGroupForeground', "Quick picker color for grouping labels."));
export const pickerGroupBorder = registerColor('pickerGroup.border', { dark: '#3F3F46', light: '#CCCEDB', hc: Color.white }, nls.localize('pickerGroupBorder', "Quick picker color for grouping borders."));
/**
 * Keybinding label
 */
export const keybindingLabelBackground = registerColor('keybindingLabel.background', { dark: new Color(new RGBA(128, 128, 128, 0.17)), light: new Color(new RGBA(221, 221, 221, 0.4)), hc: Color.transparent }, nls.localize('keybindingLabelBackground', "Keybinding label background color. The keybinding label is used to represent a keyboard shortcut."));
export const keybindingLabelForeground = registerColor('keybindingLabel.foreground', { dark: Color.fromHex('#CCCCCC'), light: Color.fromHex('#555555'), hc: Color.white }, nls.localize('keybindingLabelForeground', "Keybinding label foreground color. The keybinding label is used to represent a keyboard shortcut."));
export const keybindingLabelBorder = registerColor('keybindingLabel.border', { dark: new Color(new RGBA(51, 51, 51, 0.6)), light: new Color(new RGBA(204, 204, 204, 0.4)), hc: new Color(new RGBA(111, 195, 223)) }, nls.localize('keybindingLabelBorder', "Keybinding label border color. The keybinding label is used to represent a keyboard shortcut."));
export const keybindingLabelBottomBorder = registerColor('keybindingLabel.bottomBorder', { dark: new Color(new RGBA(68, 68, 68, 0.6)), light: new Color(new RGBA(187, 187, 187, 0.4)), hc: new Color(new RGBA(111, 195, 223)) }, nls.localize('keybindingLabelBottomBorder', "Keybinding label border bottom color. The keybinding label is used to represent a keyboard shortcut."));
/**
 * Editor selection colors.
 */
export const editorSelectionBackground = registerColor('editor.selectionBackground', { light: '#ADD6FF', dark: '#264F78', hc: '#f3f518' }, nls.localize('editorSelectionBackground', "Color of the editor selection."));
export const editorSelectionForeground = registerColor('editor.selectionForeground', { light: null, dark: null, hc: '#000000' }, nls.localize('editorSelectionForeground', "Color of the selected text for high contrast."));
export const editorInactiveSelection = registerColor('editor.inactiveSelectionBackground', { light: transparent(editorSelectionBackground, 0.5), dark: transparent(editorSelectionBackground, 0.5), hc: transparent(editorSelectionBackground, 0.5) }, nls.localize('editorInactiveSelection', "Color of the selection in an inactive editor. The color must not be opaque so as not to hide underlying decorations."), true);
export const editorSelectionHighlight = registerColor('editor.selectionHighlightBackground', { light: lessProminent(editorSelectionBackground, editorBackground, 0.3, 0.6), dark: lessProminent(editorSelectionBackground, editorBackground, 0.3, 0.6), hc: null }, nls.localize('editorSelectionHighlight', 'Color for regions with the same content as the selection. The color must not be opaque so as not to hide underlying decorations.'), true);
export const editorSelectionHighlightBorder = registerColor('editor.selectionHighlightBorder', { light: null, dark: null, hc: activeContrastBorder }, nls.localize('editorSelectionHighlightBorder', "Border color for regions with the same content as the selection."));
/**
 * Editor find match colors.
 */
export const editorFindMatch = registerColor('editor.findMatchBackground', { light: '#A8AC94', dark: '#515C6A', hc: null }, nls.localize('editorFindMatch', "Color of the current search match."));
export const editorFindMatchHighlight = registerColor('editor.findMatchHighlightBackground', { light: '#EA5C0055', dark: '#EA5C0055', hc: null }, nls.localize('findMatchHighlight', "Color of the other search matches. The color must not be opaque so as not to hide underlying decorations."), true);
export const editorFindRangeHighlight = registerColor('editor.findRangeHighlightBackground', { dark: '#3a3d4166', light: '#b4b4b44d', hc: null }, nls.localize('findRangeHighlight', "Color of the range limiting the search. The color must not be opaque so as not to hide underlying decorations."), true);
export const editorFindMatchBorder = registerColor('editor.findMatchBorder', { light: null, dark: null, hc: activeContrastBorder }, nls.localize('editorFindMatchBorder', "Border color of the current search match."));
export const editorFindMatchHighlightBorder = registerColor('editor.findMatchHighlightBorder', { light: null, dark: null, hc: activeContrastBorder }, nls.localize('findMatchHighlightBorder', "Border color of the other search matches."));
export const editorFindRangeHighlightBorder = registerColor('editor.findRangeHighlightBorder', { dark: null, light: null, hc: transparent(activeContrastBorder, 0.4) }, nls.localize('findRangeHighlightBorder', "Border color of the range limiting the search. The color must not be opaque so as not to hide underlying decorations."), true);
/**
 * Editor hover
 */
export const editorHoverHighlight = registerColor('editor.hoverHighlightBackground', { light: '#ADD6FF26', dark: '#264f7840', hc: '#ADD6FF26' }, nls.localize('hoverHighlight', 'Highlight below the word for which a hover is shown. The color must not be opaque so as not to hide underlying decorations.'), true);
export const editorHoverBackground = registerColor('editorHoverWidget.background', { light: editorWidgetBackground, dark: editorWidgetBackground, hc: editorWidgetBackground }, nls.localize('hoverBackground', 'Background color of the editor hover.'));
export const editorHoverForeground = registerColor('editorHoverWidget.foreground', { light: editorWidgetForeground, dark: editorWidgetForeground, hc: editorWidgetForeground }, nls.localize('hoverForeground', 'Foreground color of the editor hover.'));
export const editorHoverBorder = registerColor('editorHoverWidget.border', { light: editorWidgetBorder, dark: editorWidgetBorder, hc: editorWidgetBorder }, nls.localize('hoverBorder', 'Border color of the editor hover.'));
export const editorHoverStatusBarBackground = registerColor('editorHoverWidget.statusBarBackground', { dark: lighten(editorHoverBackground, 0.2), light: darken(editorHoverBackground, 0.05), hc: editorWidgetBackground }, nls.localize('statusBarBackground', "Background color of the editor hover status bar."));
/**
 * Editor link colors
 */
export const editorActiveLinkForeground = registerColor('editorLink.activeForeground', { dark: '#4E94CE', light: Color.blue, hc: Color.cyan }, nls.localize('activeLinkForeground', 'Color of active links.'));
/**
 * Inline hints
 */
export const editorInlayHintForeground = registerColor('editorInlayHint.foreground', { dark: transparent(badgeForeground, .8), light: transparent(badgeForeground, .8), hc: badgeForeground }, nls.localize('editorInlayHintForeground', 'Foreground color of inline hints'));
export const editorInlayHintBackground = registerColor('editorInlayHint.background', { dark: transparent(badgeBackground, .6), light: transparent(badgeBackground, .3), hc: badgeBackground }, nls.localize('editorInlayHintBackground', 'Background color of inline hints'));
/**
 * Editor lighbulb icon colors
 */
export const editorLightBulbForeground = registerColor('editorLightBulb.foreground', { dark: '#FFCC00', light: '#DDB100', hc: '#FFCC00' }, nls.localize('editorLightBulbForeground', "The color used for the lightbulb actions icon."));
export const editorLightBulbAutoFixForeground = registerColor('editorLightBulbAutoFix.foreground', { dark: '#75BEFF', light: '#007ACC', hc: '#75BEFF' }, nls.localize('editorLightBulbAutoFixForeground', "The color used for the lightbulb auto fix actions icon."));
/**
 * Diff Editor Colors
 */
export const defaultInsertColor = new Color(new RGBA(155, 185, 85, 0.2));
export const defaultRemoveColor = new Color(new RGBA(255, 0, 0, 0.2));
export const diffInserted = registerColor('diffEditor.insertedTextBackground', { dark: defaultInsertColor, light: defaultInsertColor, hc: null }, nls.localize('diffEditorInserted', 'Background color for text that got inserted. The color must not be opaque so as not to hide underlying decorations.'), true);
export const diffRemoved = registerColor('diffEditor.removedTextBackground', { dark: defaultRemoveColor, light: defaultRemoveColor, hc: null }, nls.localize('diffEditorRemoved', 'Background color for text that got removed. The color must not be opaque so as not to hide underlying decorations.'), true);
export const diffInsertedOutline = registerColor('diffEditor.insertedTextBorder', { dark: null, light: null, hc: '#33ff2eff' }, nls.localize('diffEditorInsertedOutline', 'Outline color for the text that got inserted.'));
export const diffRemovedOutline = registerColor('diffEditor.removedTextBorder', { dark: null, light: null, hc: '#FF008F' }, nls.localize('diffEditorRemovedOutline', 'Outline color for text that got removed.'));
export const diffBorder = registerColor('diffEditor.border', { dark: null, light: null, hc: contrastBorder }, nls.localize('diffEditorBorder', 'Border color between the two text editors.'));
export const diffDiagonalFill = registerColor('diffEditor.diagonalFill', { dark: '#cccccc33', light: '#22222233', hc: null }, nls.localize('diffDiagonalFill', "Color of the diff editor's diagonal fill. The diagonal fill is used in side-by-side diff views."));
/**
 * List and tree colors
 */
export const listFocusBackground = registerColor('list.focusBackground', { dark: null, light: null, hc: null }, nls.localize('listFocusBackground', "List/Tree background color for the focused item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."));
export const listFocusForeground = registerColor('list.focusForeground', { dark: null, light: null, hc: null }, nls.localize('listFocusForeground', "List/Tree foreground color for the focused item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."));
export const listFocusOutline = registerColor('list.focusOutline', { dark: focusBorder, light: focusBorder, hc: activeContrastBorder }, nls.localize('listFocusOutline', "List/Tree outline color for the focused item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."));
export const listActiveSelectionBackground = registerColor('list.activeSelectionBackground', { dark: '#094771', light: '#0060C0', hc: null }, nls.localize('listActiveSelectionBackground', "List/Tree background color for the selected item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."));
export const listActiveSelectionForeground = registerColor('list.activeSelectionForeground', { dark: Color.white, light: Color.white, hc: null }, nls.localize('listActiveSelectionForeground', "List/Tree foreground color for the selected item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."));
export const listActiveSelectionIconForeground = registerColor('list.activeSelectionIconForeground', { dark: null, light: null, hc: null }, nls.localize('listActiveSelectionIconForeground', "List/Tree icon foreground color for the selected item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."));
export const listInactiveSelectionBackground = registerColor('list.inactiveSelectionBackground', { dark: '#37373D', light: '#E4E6F1', hc: null }, nls.localize('listInactiveSelectionBackground', "List/Tree background color for the selected item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not."));
export const listInactiveSelectionForeground = registerColor('list.inactiveSelectionForeground', { dark: null, light: null, hc: null }, nls.localize('listInactiveSelectionForeground', "List/Tree foreground color for the selected item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not."));
export const listInactiveSelectionIconForeground = registerColor('list.inactiveSelectionIconForeground', { dark: null, light: null, hc: null }, nls.localize('listInactiveSelectionIconForeground', "List/Tree icon foreground color for the selected item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not."));
export const listInactiveFocusBackground = registerColor('list.inactiveFocusBackground', { dark: null, light: null, hc: null }, nls.localize('listInactiveFocusBackground', "List/Tree background color for the focused item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not."));
export const listInactiveFocusOutline = registerColor('list.inactiveFocusOutline', { dark: null, light: null, hc: null }, nls.localize('listInactiveFocusOutline', "List/Tree outline color for the focused item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not."));
export const listHoverBackground = registerColor('list.hoverBackground', { dark: '#2A2D2E', light: '#F0F0F0', hc: null }, nls.localize('listHoverBackground', "List/Tree background when hovering over items using the mouse."));
export const listHoverForeground = registerColor('list.hoverForeground', { dark: null, light: null, hc: null }, nls.localize('listHoverForeground', "List/Tree foreground when hovering over items using the mouse."));
export const listDropBackground = registerColor('list.dropBackground', { dark: '#062F4A', light: '#D6EBFF', hc: null }, nls.localize('listDropBackground', "List/Tree drag and drop background when moving items around using the mouse."));
export const listHighlightForeground = registerColor('list.highlightForeground', { dark: '#18A3FF', light: '#0066BF', hc: focusBorder }, nls.localize('highlight', 'List/Tree foreground color of the match highlights when searching inside the list/tree.'));
export const listFocusHighlightForeground = registerColor('list.focusHighlightForeground', { dark: listHighlightForeground, light: ifDefinedThenElse(listActiveSelectionBackground, listHighlightForeground, '#9DDDFF'), hc: listHighlightForeground }, nls.localize('listFocusHighlightForeground', 'List/Tree foreground color of the match highlights on actively focused items when searching inside the list/tree.'));
export const listFilterWidgetBackground = registerColor('listFilterWidget.background', { light: '#efc1ad', dark: '#653723', hc: Color.black }, nls.localize('listFilterWidgetBackground', 'Background color of the type filter widget in lists and trees.'));
export const listFilterWidgetOutline = registerColor('listFilterWidget.outline', { dark: Color.transparent, light: Color.transparent, hc: '#f38518' }, nls.localize('listFilterWidgetOutline', 'Outline color of the type filter widget in lists and trees.'));
export const listFilterWidgetNoMatchesOutline = registerColor('listFilterWidget.noMatchesOutline', { dark: '#BE1100', light: '#BE1100', hc: contrastBorder }, nls.localize('listFilterWidgetNoMatchesOutline', 'Outline color of the type filter widget in lists and trees, when there are no matches.'));
export const treeIndentGuidesStroke = registerColor('tree.indentGuidesStroke', { dark: '#585858', light: '#a9a9a9', hc: '#a9a9a9' }, nls.localize('treeIndentGuidesStroke', "Tree stroke color for the indentation guides."));
export const tableColumnsBorder = registerColor('tree.tableColumnsBorder', { dark: '#CCCCCC20', light: '#61616120', hc: null }, nls.localize('treeIndentGuidesStroke', "Tree stroke color for the indentation guides."));
/**
 * Quick pick widget (dependent on List and tree colors)
 */
export const _deprecatedQuickInputListFocusBackground = registerColor('quickInput.list.focusBackground', { dark: null, light: null, hc: null }, '', undefined, nls.localize('quickInput.list.focusBackground deprecation', "Please use quickInputList.focusBackground instead"));
export const quickInputListFocusForeground = registerColor('quickInputList.focusForeground', { dark: listActiveSelectionForeground, light: listActiveSelectionForeground, hc: listActiveSelectionForeground }, nls.localize('quickInput.listFocusForeground', "Quick picker foreground color for the focused item."));
export const quickInputListFocusIconForeground = registerColor('quickInputList.focusIconForeground', { dark: listActiveSelectionIconForeground, light: listActiveSelectionIconForeground, hc: listActiveSelectionIconForeground }, nls.localize('quickInput.listFocusIconForeground', "Quick picker icon foreground color for the focused item."));
export const quickInputListFocusBackground = registerColor('quickInputList.focusBackground', { dark: oneOf(_deprecatedQuickInputListFocusBackground, listActiveSelectionBackground), light: oneOf(_deprecatedQuickInputListFocusBackground, listActiveSelectionBackground), hc: null }, nls.localize('quickInput.listFocusBackground', "Quick picker background color for the focused item."));
/**
 * Menu colors
 */
export const menuBorder = registerColor('menu.border', { dark: null, light: null, hc: contrastBorder }, nls.localize('menuBorder', "Border color of menus."));
export const menuForeground = registerColor('menu.foreground', { dark: selectForeground, light: foreground, hc: selectForeground }, nls.localize('menuForeground', "Foreground color of menu items."));
export const menuBackground = registerColor('menu.background', { dark: selectBackground, light: selectBackground, hc: selectBackground }, nls.localize('menuBackground', "Background color of menu items."));
export const menuSelectionForeground = registerColor('menu.selectionForeground', { dark: listActiveSelectionForeground, light: listActiveSelectionForeground, hc: listActiveSelectionForeground }, nls.localize('menuSelectionForeground', "Foreground color of the selected menu item in menus."));
export const menuSelectionBackground = registerColor('menu.selectionBackground', { dark: listActiveSelectionBackground, light: listActiveSelectionBackground, hc: listActiveSelectionBackground }, nls.localize('menuSelectionBackground', "Background color of the selected menu item in menus."));
export const menuSelectionBorder = registerColor('menu.selectionBorder', { dark: null, light: null, hc: activeContrastBorder }, nls.localize('menuSelectionBorder', "Border color of the selected menu item in menus."));
export const menuSeparatorBackground = registerColor('menu.separatorBackground', { dark: '#BBBBBB', light: '#888888', hc: contrastBorder }, nls.localize('menuSeparatorBackground', "Color of a separator menu item in menus."));
/**
 * Snippet placeholder colors
 */
export const snippetTabstopHighlightBackground = registerColor('editor.snippetTabstopHighlightBackground', { dark: new Color(new RGBA(124, 124, 124, 0.3)), light: new Color(new RGBA(10, 50, 100, 0.2)), hc: new Color(new RGBA(124, 124, 124, 0.3)) }, nls.localize('snippetTabstopHighlightBackground', "Highlight background color of a snippet tabstop."));
export const snippetTabstopHighlightBorder = registerColor('editor.snippetTabstopHighlightBorder', { dark: null, light: null, hc: null }, nls.localize('snippetTabstopHighlightBorder', "Highlight border color of a snippet tabstop."));
export const snippetFinalTabstopHighlightBackground = registerColor('editor.snippetFinalTabstopHighlightBackground', { dark: null, light: null, hc: null }, nls.localize('snippetFinalTabstopHighlightBackground', "Highlight background color of the final tabstop of a snippet."));
export const snippetFinalTabstopHighlightBorder = registerColor('editor.snippetFinalTabstopHighlightBorder', { dark: '#525252', light: new Color(new RGBA(10, 50, 100, 0.5)), hc: '#525252' }, nls.localize('snippetFinalTabstopHighlightBorder', "Highlight border color of the final tabstop of a snippet."));
export const overviewRulerFindMatchForeground = registerColor('editorOverviewRuler.findMatchForeground', { dark: '#d186167e', light: '#d186167e', hc: '#AB5A00' }, nls.localize('overviewRulerFindMatchForeground', 'Overview ruler marker color for find matches. The color must not be opaque so as not to hide underlying decorations.'), true);
export const overviewRulerSelectionHighlightForeground = registerColor('editorOverviewRuler.selectionHighlightForeground', { dark: '#A0A0A0CC', light: '#A0A0A0CC', hc: '#A0A0A0CC' }, nls.localize('overviewRulerSelectionHighlightForeground', 'Overview ruler marker color for selection highlights. The color must not be opaque so as not to hide underlying decorations.'), true);
export const minimapFindMatch = registerColor('minimap.findMatchHighlight', { light: '#d18616', dark: '#d18616', hc: '#AB5A00' }, nls.localize('minimapFindMatchHighlight', 'Minimap marker color for find matches.'), true);
export const minimapSelection = registerColor('minimap.selectionHighlight', { light: '#ADD6FF', dark: '#264F78', hc: '#ffffff' }, nls.localize('minimapSelectionHighlight', 'Minimap marker color for the editor selection.'), true);
export const minimapError = registerColor('minimap.errorHighlight', { dark: new Color(new RGBA(255, 18, 18, 0.7)), light: new Color(new RGBA(255, 18, 18, 0.7)), hc: new Color(new RGBA(255, 50, 50, 1)) }, nls.localize('minimapError', 'Minimap marker color for errors.'));
export const minimapWarning = registerColor('minimap.warningHighlight', { dark: editorWarningForeground, light: editorWarningForeground, hc: editorWarningBorder }, nls.localize('overviewRuleWarning', 'Minimap marker color for warnings.'));
export const minimapBackground = registerColor('minimap.background', { dark: null, light: null, hc: null }, nls.localize('minimapBackground', "Minimap background color."));
export const minimapSliderBackground = registerColor('minimapSlider.background', { light: transparent(scrollbarSliderBackground, 0.5), dark: transparent(scrollbarSliderBackground, 0.5), hc: transparent(scrollbarSliderBackground, 0.5) }, nls.localize('minimapSliderBackground', "Minimap slider background color."));
export const minimapSliderHoverBackground = registerColor('minimapSlider.hoverBackground', { light: transparent(scrollbarSliderHoverBackground, 0.5), dark: transparent(scrollbarSliderHoverBackground, 0.5), hc: transparent(scrollbarSliderHoverBackground, 0.5) }, nls.localize('minimapSliderHoverBackground', "Minimap slider background color when hovering."));
export const minimapSliderActiveBackground = registerColor('minimapSlider.activeBackground', { light: transparent(scrollbarSliderActiveBackground, 0.5), dark: transparent(scrollbarSliderActiveBackground, 0.5), hc: transparent(scrollbarSliderActiveBackground, 0.5) }, nls.localize('minimapSliderActiveBackground', "Minimap slider background color when clicked on."));
export const problemsErrorIconForeground = registerColor('problemsErrorIcon.foreground', { dark: editorErrorForeground, light: editorErrorForeground, hc: editorErrorForeground }, nls.localize('problemsErrorIconForeground', "The color used for the problems error icon."));
export const problemsWarningIconForeground = registerColor('problemsWarningIcon.foreground', { dark: editorWarningForeground, light: editorWarningForeground, hc: editorWarningForeground }, nls.localize('problemsWarningIconForeground', "The color used for the problems warning icon."));
export const problemsInfoIconForeground = registerColor('problemsInfoIcon.foreground', { dark: editorInfoForeground, light: editorInfoForeground, hc: editorInfoForeground }, nls.localize('problemsInfoIconForeground', "The color used for the problems info icon."));
// ----- color functions
export function executeTransform(transform, theme) {
    var _a, _b, _c;
    switch (transform.op) {
        case 0 /* Darken */:
            return (_a = resolveColorValue(transform.value, theme)) === null || _a === void 0 ? void 0 : _a.darken(transform.factor);
        case 1 /* Lighten */:
            return (_b = resolveColorValue(transform.value, theme)) === null || _b === void 0 ? void 0 : _b.lighten(transform.factor);
        case 2 /* Transparent */:
            return (_c = resolveColorValue(transform.value, theme)) === null || _c === void 0 ? void 0 : _c.transparent(transform.factor);
        case 3 /* OneOf */:
            for (const candidate of transform.values) {
                const color = resolveColorValue(candidate, theme);
                if (color) {
                    return color;
                }
            }
            return undefined;
        case 5 /* IfDefinedThenElse */:
            return resolveColorValue(theme.defines(transform.if) ? transform.then : transform.else, theme);
        case 4 /* LessProminent */:
            const from = resolveColorValue(transform.value, theme);
            if (!from) {
                return undefined;
            }
            const backgroundColor = resolveColorValue(transform.background, theme);
            if (!backgroundColor) {
                return from.transparent(transform.factor * transform.transparency);
            }
            return from.isDarkerThan(backgroundColor)
                ? Color.getLighterColor(from, backgroundColor, transform.factor).transparent(transform.transparency)
                : Color.getDarkerColor(from, backgroundColor, transform.factor).transparent(transform.transparency);
        default:
            throw assertNever(transform);
    }
}
export function darken(colorValue, factor) {
    return { op: 0 /* Darken */, value: colorValue, factor };
}
export function lighten(colorValue, factor) {
    return { op: 1 /* Lighten */, value: colorValue, factor };
}
export function transparent(colorValue, factor) {
    return { op: 2 /* Transparent */, value: colorValue, factor };
}
export function oneOf(...colorValues) {
    return { op: 3 /* OneOf */, values: colorValues };
}
export function ifDefinedThenElse(ifArg, thenArg, elseArg) {
    return { op: 5 /* IfDefinedThenElse */, if: ifArg, then: thenArg, else: elseArg };
}
function lessProminent(colorValue, backgroundColorValue, factor, transparency) {
    return { op: 4 /* LessProminent */, value: colorValue, background: backgroundColorValue, factor, transparency };
}
// ----- implementation
/**
 * @param colorValue Resolve a color value in the context of a theme
 */
export function resolveColorValue(colorValue, theme) {
    if (colorValue === null) {
        return undefined;
    }
    else if (typeof colorValue === 'string') {
        if (colorValue[0] === '#') {
            return Color.fromHex(colorValue);
        }
        return theme.getColor(colorValue);
    }
    else if (colorValue instanceof Color) {
        return colorValue;
    }
    else if (typeof colorValue === 'object') {
        return executeTransform(colorValue, theme);
    }
    return undefined;
}
export const workbenchColorsSchemaId = 'vscode://schemas/workbench-colors';
let schemaRegistry = platform.Registry.as(JSONExtensions.JSONContribution);
schemaRegistry.registerSchema(workbenchColorsSchemaId, colorRegistry.getColorSchema());
const delayer = new RunOnceScheduler(() => schemaRegistry.notifySchemaChanged(workbenchColorsSchemaId), 200);
colorRegistry.onDidChangeSchema(() => {
    if (!delayer.isScheduled()) {
        delayer.schedule();
    }
});
// setTimeout(_ => console.log(colorRegistry.toString()), 5000);
