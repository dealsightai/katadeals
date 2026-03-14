import { prisma } from "./prisma";
// All deals for a user, newest first
export async function getDealsByUser(email: string) {
return prisma.deal.findMany({
where: { user: { email } },
orderBy: { createdAt: "desc" },
});
}
// One specific deal by its ID
export async function getDealById(id: string) {
return prisma.deal.findUnique({
where: { id },
include: {
user: { select: { email: true, name: true } },
},
});
}
// How many deals has this user analyzed this month?
// Used to enforce the free plan limit of 3/month.
export async function getMonthlyDealCount(email: string) {
const start = new Date();
start.setDate(1);
start.setHours(0, 0, 0, 0);
return prisma.deal.count({
where: {
user: { email },
createdAt: { gte: start },
},
});
}
// Delete a deal — only if it belongs to this user
export async function deleteDeal(id: string, userEmail: string) {
return prisma.deal.deleteMany({
where: { id, user: { email: userEmail } },
});
}
