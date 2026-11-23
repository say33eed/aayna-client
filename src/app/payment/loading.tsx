import { ContentSkeleton, Skeleton } from "@/components/ui/loading-skeleton";
export default function Loading() { return <div className="aayna-loading-page" style={{ maxWidth: 620 }}><Skeleton shape="circle" style={{ width: 48, height: 48 }}/><Skeleton shape="line" style={{ width: "60%", height: 32 }}/><ContentSkeleton rows={4} title="Checking payment status"/></div>; }
