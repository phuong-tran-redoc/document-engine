export interface AvatarItem {
  id: string;
  photo?: string;
  initials?: string;
  alt?: string;
}

export type AvatarMode = 'photo' | 'initials';
export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarClick =
  | { type: 'avatar'; item: AvatarItem; index: number; event: Event }
  | { type: 'remaining'; event: Event };
