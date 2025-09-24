import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUserProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    
    if (!profile) {
      const user = await ctx.db.get(userId);
      return {
        userId,
        displayName: user?.name || "Usuário",
        reportsCount: 0,
        cleanupsCount: 0,
        joinedAt: Date.now(),
        profileImageUrl: null,
      };
    }
    
    const profileImageUrl = profile.profileImageId 
      ? await ctx.storage.getUrl(profile.profileImageId) 
      : null;
    
    return {
      ...profile,
      profileImageUrl,
    };
  },
});

export const getLeaderboard = query({
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query("userProfiles")
      .withIndex("by_reports_count")
      .order("desc")
      .take(10);
    
    return Promise.all(
      profiles.map(async (profile) => {
        const profileImageUrl = profile.profileImageId 
          ? await ctx.storage.getUrl(profile.profileImageId) 
          : null;
        
        return {
          ...profile,
          profileImageUrl,
        };
      })
    );
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.string(),
    profileImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    
    if (profile) {
      await ctx.db.patch(profile._id, {
        displayName: args.displayName,
        profileImageId: args.profileImageId,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId,
        displayName: args.displayName,
        profileImageId: args.profileImageId,
        reportsCount: 0,
        cleanupsCount: 0,
        joinedAt: Date.now(),
      });
    }
    
    return null;
  },
});
