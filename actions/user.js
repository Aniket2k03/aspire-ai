
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Start a transaction to handle both operations
    const result = await db.$transaction(
      async (tx) => {
        // First check if industry exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If industry doesn't exist, create it with default values
        if (!industryInsight) {

          // industryInsight = await tx.industryInsight.create({
          //   data: {
          //     industry: data.industry,
          //     salaryRanges:[],
          //     growthRate: 0,
          //     demandLevel:"Medium",
          //     topSkills: [],
          //     marketOutlook: "Stable",
          //     keyTrends: [],
          //     recommendedSkills: [],
          //     nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          //   },
          // });
          const insights = await generateAIInsights(data.industry);

          industryInsight = await db.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Now update the user
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000, // default: 5000
      }
    );

    revalidatePath("/");
    return result.user;
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}


// export async function getUserProfile() {
//   try {
//     // Use absolute URL with window.location.origin
//     const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/profile`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       cache: 'no-cache',
//     });

//     if (!response.ok) {
//       throw new Error('Failed to fetch profile');
//     }

//     return response.json();
//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     throw error;
//   }
// }