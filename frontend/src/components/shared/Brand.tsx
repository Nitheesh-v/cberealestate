import Link from 'next/link';
import { cn } from '@/lib/utils';
/** Text-based brand mark stays crisp at any screen density. */
export function Brand({
  inverse = false,
  onClick,
}: {
  inverse?: boolean;
  onClick?: () => void;
}): React.JSX.Element {
  return (
    <Link
      href="/"
      aria-label="SBR Real Estate home"
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-3',
        inverse ? 'text-white' : 'text-primary dark:text-white',
      )}
    >
      <span className="font-heading text-4xl font-bold tracking-tight">
        SBR<span className="text-secondary">.</span>
      </span>
      <span className="border-l border-current/25 pl-3 text-[10px] font-medium uppercase leading-[1.6] tracking-[0.22em]">
        Real
        <br />
        Estate
      </span>
    </Link>
  );
}
