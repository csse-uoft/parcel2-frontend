import {createNavigation} from 'next-intl/navigation';
import { routing } from './routing';

// Re-export navigation helpers with locale-aware versions
export const {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} = createNavigation(routing);
