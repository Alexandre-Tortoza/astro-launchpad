export type { SeoMeta, Page, BlogPost, NavLink, SiteSettings, ContentProvider } from './types';
export type { PageSection } from '../../types/blocks';
export { MockContentProvider } from './mock';

import { MockContentProvider } from './mock';
export const mockProvider = new MockContentProvider();
