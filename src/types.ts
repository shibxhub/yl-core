export type ComponentType = 'text' | 'button' | 'input' | 'chart' | 'table' | 'wyn-report';

export interface ComponentProps {
  text?: string;
  fontSize?: number;
  color?: string;
  reportUrl?: string;
}

export interface PageComponent {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  position: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface PageMeta {
  title: string;
  description: string;
}