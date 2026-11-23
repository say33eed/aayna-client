import { CardGridSkeleton, Skeleton } from "@/components/ui/loading-skeleton";
export default function Loading() { return <div className="aayna-loading-page"><Skeleton shape="line" style={{ width: "36%", height: 30 }}/><Skeleton shape="line" style={{ width: "60%" }}/><CardGridSkeleton /></div>; }
