import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  wasteReports: defineTable({
    userId: v.id("users"),
    latitude: v.number(),
    longitude: v.number(),
    description: v.string(),
    wasteType: v.string(),
    status: v.union(v.literal("reported"), v.literal("in_progress"), v.literal("cleaned")),
    imageId: v.optional(v.id("_storage")),
    reportedAt: v.number(),
    cleanedAt: v.optional(v.number()),
    cleanedBy: v.optional(v.id("users")),
  })
    .index("by_status", ["status"])
    .index("by_user", ["userId"])
    .index("by_location", ["latitude", "longitude"]),

  comments: defineTable({
    wasteReportId: v.id("wasteReports"),
    userId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_report", ["wasteReportId"])
    .index("by_user", ["userId"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    profileImageId: v.optional(v.id("_storage")),
    reportsCount: v.number(),
    cleanupsCount: v.number(),
    joinedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_reports_count", ["reportsCount"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
