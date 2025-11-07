import { Directive } from '@angular/core';

/**
 * Directive for select label content
 * Must be used within document-engine-select component when labelMode="static"
 *
 * Usage:
 * <document-engine-select labelMode="static">
 *   <div documentEngineSelectLabel>
 *     <document-engine-icon name="format_size"></document-engine-icon>
 *     <span>Font Size</span>
 *   </div>
 *   <button documentEngineSelectOption value="14px">14px</button>
 * </document-engine-select>
 */
@Directive({
  selector: '[documentEngineSelectLabel]',
  standalone: true,
})
export class SelectLabelDirective {}
