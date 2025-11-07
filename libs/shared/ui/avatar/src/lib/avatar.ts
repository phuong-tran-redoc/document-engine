import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AvatarClick, AvatarItem, AvatarMode, AvatarSize } from './avatar.type';

@Component({
  selector: 'document-engine-avatar',
  imports: [NgTemplateOutlet],
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Avatar {
  // Constants
  readonly overlapClass: Record<AvatarSize, string> = {
    sm: '-space-x-4',
    md: '-space-x-5',
    lg: '-space-x-6',
  };

  readonly sizeClass: Record<AvatarSize, string> = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12 text-lg',
  };

  readonly avatarColors: string[] = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
  ];

  readonly shadowEffect = 'shadow-lg hover:shadow-xl transition-shadow duration-200';

  // Inputs
  mode = input<AvatarMode>('photo');
  size = input<AvatarSize>('md');
  overlapSize = input<AvatarSize>('sm');
  items = input.required<AvatarItem[]>();
  grayscale = input(false, { transform: booleanAttribute });
  avatarClick = output<AvatarClick>();

  // Computed properties
  isStacked = computed(() => this.items().length > 1);
  overlapOffset = computed(() => this.overlapClass[this.overlapSize()]);
  visibleItems = computed(() => this.items().slice(0, 4));
  remainingCount = computed(() => Math.max(0, this.items().length - 4));

  sizeClasses = computed(() => {
    const baseClasses = 'rounded-full border-2 border-white ring-2 ring-white overflow-hidden';
    return this.sizeClass[this.size()] + ' ' + baseClasses;
  });

  imageClasses = computed(() => {
    const grayClass = this.grayscale() ? 'grayscale' : '';
    return `size-full object-cover aspect-square ${grayClass} cursor-pointer`;
  });

  fallbackClasses = computed(() => {
    const grayClass = this.grayscale() ? 'grayscale' : '';
    return `size-full flex items-center justify-center text-white ${grayClass} cursor-pointer`;
  });

  avatarData = computed(() => {
    const items = this.visibleItems();
    const mode = this.mode();
    const sizeClasses = this.sizeClasses();

    return items.map((item, index) => {
      const stackedClasses = `${sizeClasses} ${this.shadowEffect}`;

      const backgroundColor = this.avatarColors[index % this.avatarColors.length];
      const shouldShowPhoto = mode === 'photo' && !!item.photo;
      const displayText = item.initials ? item.initials.slice(0, 2).toUpperCase() : '??';

      return {
        item,
        index,
        stackedClasses,
        backgroundColor,
        shouldShowPhoto,
        displayText,
      };
    });
  });

  // Pre-computed remaining count data
  remainingCountData = computed(() => {
    const count = this.remainingCount();
    if (count <= 0) return null;

    const sizeClasses = this.sizeClasses();
    const stackedClasses = `${sizeClasses} ${this.shadowEffect}`;

    return {
      count,
      stackedClasses,
    };
  });

  // Pre-computed single avatar data
  singleAvatarData = computed(() => {
    const items = this.items();
    if (items.length !== 1) return null;

    const item = items[0];
    const mode = this.mode();
    const shouldShowPhoto = mode === 'photo' && !!item.photo;
    const displayText = item.initials ? item.initials.slice(0, 2).toUpperCase() : '??';
    const backgroundColor = this.avatarColors[0];

    return {
      item,
      shouldShowPhoto,
      displayText,
      backgroundColor,
    };
  });

  // Methods
  emitAvatarClick(item: AvatarItem, index: number, event: Event): void {
    this.avatarClick.emit({ type: 'avatar', item, index, event });
  }

  emitRemainingCountClick(event: Event): void {
    this.avatarClick.emit({ type: 'remaining', event });
  }

  onImageError(event: Event): void {
    // Hide the image element when it fails to load
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
