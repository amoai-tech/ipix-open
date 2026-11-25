import { expect, test } from "bun:test";
import { composeShootPlan } from "./compose-shoot-plan";
import { ShootPlanSchema } from "./plan-schema";

const input = {
  channels: ["shopify" as const],
  shootType: "ecommerce_pdp" as const,
  objective: "Launch a six-look fashion collection",
  productNames: ["Look 1", "Look 2", "Look 3", "Look 4", "Look 5", "Look 6"],
  crewCount: 3,
  studioType: "rental" as const,
  shootDays: 1,
  currency: "USD" as const,
};
const loadChannelSpecs = async () => new Map();

test("six-look draft reuses sourced shots, estimated budget and explicit gaps", async () => {
  const plan = await composeShootPlan(input, {
    loadChannelSpecs,
    loadTrustedShotReferences: async () => [
      {
        id: "synthetic-front-reference",
        angle: "Front",
        description: "Full outfit",
        channelFit: ["shopify_pdp"],
      },
    ],
  });
  expect(ShootPlanSchema.safeParse(plan).success).toBe(true);
  expect(plan.deliverablesResult.totalAssets).toBeGreaterThan(0);
  expect(plan.shotListResult?.totalShots).toBeGreaterThan(0);
  expect(
    plan.referencesUsed.every((ref) => ref.id === "synthetic-front-reference"),
  ).toBe(true);
  expect(plan.budgetResult.total).toBeGreaterThan(0);
  expect(plan.status).toBe("needs_input");
  expect(plan.location.status).toBe("needs_input");
  console.log(
    "Synthetic six-look draft:",
    JSON.stringify({
      assets: plan.deliverablesResult.totalAssets,
      shots: plan.shotListResult?.totalShots,
      estimate: plan.budgetResult.total,
      currency: plan.budgetResult.currency,
      status: plan.status,
    }),
  );
});

test("missing trusted references produce no fabricated shots or complete budget", async () => {
  const plan = await composeShootPlan(input, {
    loadChannelSpecs,
    loadTrustedShotReferences: async () => [],
  });
  expect(plan.status).toBe("needs_input");
  expect(plan.shotListResult).toBeNull();
  expect(plan.budgetResult.status).toBe("needs_input");
  expect(plan.referencesUsed).toEqual([]);
});
