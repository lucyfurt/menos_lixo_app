import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listReports = query({
  args: {
    status: v.optional(v.union(v.literal("reported"), v.literal("in_progress"), v.literal("cleaned"))),
  },
  handler: async (ctx, args) => {
    let reports;

    if (args.status) {
      reports = await ctx.db
        .query("wasteReports")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      reports = await ctx.db.query("wasteReports").order("desc").collect();
    }

    return Promise.all(
      reports.map(async (report) => {
        const creatorProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", report.userId))
          .unique();

        const imageUrl = report.imageId ? await ctx.storage.getUrl(report.imageId) : null;
        const creatorImageUrl = creatorProfile?.profileImageId
          ? await ctx.storage.getUrl(creatorProfile.profileImageId)
          : null;

        return {
          ...report,
          createdByName: creatorProfile?.displayName || "Usuário Anônimo",
          createdByImageUrl: creatorImageUrl,
          imageUrl,
        };
      })
    );
  },
});

export const getReport = query({
  args: { reportId: v.id("wasteReports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) return null;

    const creatorProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", report.userId))
      .unique();

    const imageUrl = report.imageId ? await ctx.storage.getUrl(report.imageId) : null;
    const creatorImageUrl = creatorProfile?.profileImageId
      ? await ctx.storage.getUrl(creatorProfile.profileImageId)
      : null;

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_report", (q) => q.eq("wasteReportId", args.reportId))
      .order("desc")
      .collect();

    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const commentProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", comment.userId))
          .unique();

        return {
          ...comment,
          userName: commentProfile?.displayName || "Usuário Anônimo",
          userImageUrl: commentProfile?.profileImageId
            ? await ctx.storage.getUrl(commentProfile.profileImageId)
            : null,
        };
      })
    );

    return {
      ...report,
      createdByName: creatorProfile?.displayName || "Usuário Anônimo",
      createdByImageUrl: creatorImageUrl,
      imageUrl,
      comments: commentsWithUsers,
    };
  },
});

export const createReport = mutation({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    description: v.string(),
    wasteType: v.string(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const reportId = await ctx.db.insert("wasteReports", {
      userId,
      latitude: args.latitude,
      longitude: args.longitude,
      description: args.description,
      wasteType: args.wasteType,
      status: "reported",
      imageId: args.imageId,
      reportedAt: Date.now(),
    });

    // Atualiza ou cria perfil
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, { reportsCount: profile.reportsCount + 1 });
    } else {
      await ctx.db.insert("userProfiles", {
        userId,
        displayName: "Usuário",
        reportsCount: 1,
        cleanupsCount: 0,
        joinedAt: Date.now(),
      });
    }

    return reportId;
  },
});

export const addComment = mutation({
  args: {
    wasteReportId: v.id("wasteReports"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    return await ctx.db.insert("comments", {
      wasteReportId: args.wasteReportId,
      userId,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const markAsCleaned = mutation({
  args: { reportId: v.id("wasteReports") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    await ctx.db.patch(args.reportId, {
      status: "cleaned",
      cleanedAt: Date.now(),
      cleanedBy: userId,
    });

    // Atualiza contagem de limpezas do usuário
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, { cleanupsCount: profile.cleanupsCount + 1 });
    }

    return null;
  },
});
