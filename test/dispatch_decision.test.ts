import assert from "node:assert/strict";
import test from "node:test";
import { chooseDispatchStatus, type Assessment } from "../src/dispatch_lesson.js";

test("a high-risk photo assessment pauses dispatch for supervisor review", () => {
  const assessment: Assessment = {
    photoFinding: "Scorching is visible beside the breaker terminals",
    safetyRisk: "high",
    recommendedSkill: "licensed electrician",
    followUpQuestion: "Has power to the panel been isolated?"
  };

  assert.equal(chooseDispatchStatus(assessment), "supervisor-review");
});

test("a medium-risk assessment can be scheduled", () => {
  const assessment: Assessment = {
    photoFinding: "Water staining is visible below the valve",
    safetyRisk: "medium",
    recommendedSkill: "plumbing",
    followUpQuestion: "Is the valve still dripping?"
  };

  assert.equal(chooseDispatchStatus(assessment), "scheduled");
});
