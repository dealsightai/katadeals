import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET() {
const session = await getServerSession(authOptions);
if (!session?.user?.email) {
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
const user = await prisma.user.findUnique({
where: { email: session.user.email },
select: {
id: true, name: true, email: true,
image: true, plan: true, createdAt: true,
},
});
if (!user) {
return NextResponse.json({ error: "Not found" }, { status: 404 });
}
// Plan limits — used to enforce free tier
const LIMITS = {
free: { maxAnalyses: 3, maxDeals: 3 },
pro: { maxAnalyses: 9999, maxDeals: 9999 },
team: { maxAnalyses: 9999, maxDeals: 9999 },
};
return NextResponse.json({
...user,
limits: LIMITS[user.plan as keyof typeof LIMITS] ?? LIMITS.free,
});
}
