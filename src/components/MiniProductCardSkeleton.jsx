import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function MiniProductCardSkeleton() {
  return (
    <SkeletonTheme baseColor="var(--color-raised)" highlightColor="var(--color-base)">
      <div className="w-full flex flex-col gap-3">
        {/* Sneaker Image Box */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-border">
          <Skeleton height="100%" containerClassName="w-full h-full block leading-none" />
        </div>

        {/* Sneaker Name */}
        <div className="leading-none mt-0.5">
          <Skeleton height={14} width="85%" borderRadius="0.375rem" />
        </div>

        {/* Sneaker Price */}
        <div className="leading-none mt-0.5">
          <Skeleton height={14} width="35%" borderRadius="0.375rem" />
        </div>
      </div>
    </SkeletonTheme>
  );
}
