import { Directive } from '@angular/core';
import { CdkPortal } from '@angular/cdk/portal';

@Directive({
  selector: '[documentEngineHeader]',
})
export class DocumentEngineHeaderDirective extends CdkPortal {}
