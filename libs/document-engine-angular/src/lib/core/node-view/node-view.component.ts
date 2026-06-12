import { Component, Input } from '@angular/core';
import type { NodeViewProps } from '@tiptap/core';

type Inputs =
  | 'editor'
  | 'node'
  | 'decorations'
  | 'innerDecorations'
  | 'view'
  | 'selected'
  | 'extension'
  | 'HTMLAttributes'
  | 'getPos'
  | 'updateAttributes'
  | 'deleteNode';

type NodeViewPropsWithoutInputs = Omit<NodeViewProps, Inputs>;

// NOTE: decorator `@Input()` (not signal `input()`) is used deliberately to keep
// the published lib compilable on the lowest supported Angular (peer floor `>=16`,
// see ADR-006); signal inputs require 17.1+. The angular-floor guard enforces this. Inputs are
// set imperatively via `ComponentRef.setInput` in `AngularRenderer`, so plain
// decorator inputs are read as values (e.g. `instance.selected`).
@Component({
  template: '',
})
export class AngularNodeViewComponent implements NodeViewPropsWithoutInputs {
  @Input() editor!: NodeViewProps['editor'];
  @Input() node!: NodeViewProps['node'];
  @Input() decorations!: NodeViewProps['decorations'];
  @Input() innerDecorations!: NodeViewProps['innerDecorations'];
  @Input() view!: NodeViewProps['view'];
  @Input() selected!: NodeViewProps['selected'];
  @Input() extension!: NodeViewProps['extension'];
  @Input() HTMLAttributes!: NodeViewProps['HTMLAttributes'];
  @Input() getPos!: NodeViewProps['getPos'];
  @Input() updateAttributes!: NodeViewProps['updateAttributes'];
  @Input() deleteNode!: NodeViewProps['deleteNode'];
}
