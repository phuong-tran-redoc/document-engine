import { Directive } from '@angular/core';

/**
 * Directive for select label content
 * Must be used within notum-select component when labelMode="static"
 *
 * Usage:
 * <notum-select labelMode="static">
 *   <div notumSelectLabel>
 *     <notum-icon name="format_size"></notum-icon>
 *     <span>Font Size</span>
 *   </div>
 *   <button notumSelectOption value="14px">14px</button>
 * </notum-select>
 */
@Directive({
  selector: '[notumSelectLabel]',
  standalone: true,
})
export class SelectLabelDirective {}
