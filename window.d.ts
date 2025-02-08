import type { PrismaClient } from '@prisma/client';
import type { Pool as PromisePool } from 'mysql2/promise';
import { Player } from './lib/types';

type PopupOptions = {
  key?: string;
  layout?: 'default' | 'modal';
  width?: number;
  alignLeft?: boolean;
  hideTitle?: boolean;
  overlay?: boolean;
  emoji?: {
    text: string;
    animation: 'none' | 'wave' | 'tada' | 'heart-beat' | 'spin' | 'flash' | 'bounce' | 'rubber-band' | 'head-shake';
  };
  autoClose?: number;
  showOnce?: boolean;
  doNotShowAfterSubmit?: boolean;
  customFormUrl?: string;
  hiddenFields?: {
    [key: string]: any,
  };
  onOpen?: () => void;
  onClose?: () => void;
  onPageView?: (page: number) => void;
  onSubmit?: (payload: any) => void;
};

declare global {
  interface Window {
    globalStates: {
      [key: string]: any,
    };
    [key: string]: any;
  }

  var Tally: {
    openPopup: (formId: string, options: PopupOptions) => void,
  };

  var prisma: PrismaClient | undefined;
  var mysqlPool: PromisePool | undefined;
  var clarity: (method: string, property: string, value: string) => void | undefined;
}
