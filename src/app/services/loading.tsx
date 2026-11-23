import { CardGridSkeleton, Skeleton } from "@/components/ui/loading-skeleton";
export default function Loading() { return <div className="aayna-loading-page"><Skeleton shape="line" style={{ width: "45%", height: 38 }}/><Skeleton shape="line" style={{ width: "70%" }}/><CardGridSkeleton count={9} /></div>; }
