import { LeadPriority, ScoreCriterionResult, ScoringEvaluation } from './types.ts';

export interface EvaluateLeadInput {
  industry: string;
  employeeCount: number;
  revenue: number;
  yearFounded: number;
  ceoAge: number;
}

export function evaluateLead(input: EvaluateLeadInput): ScoringEvaluation {
  const criteria: ScoreCriterionResult[] = [];
  let totalScore = 0;

  // 1. Industry = Home Services -> 25 points
  const normalizedIndustry = (input.industry || '').trim().toLowerCase();
  const isHomeServices =
    normalizedIndustry === 'home services' ||
    normalizedIndustry === 'home service' ||
    normalizedIndustry === 'homeservices';

  if (isHomeServices) {
    totalScore += 25;
    criteria.push({
      id: 'industry',
      criterionName: 'Target Industry',
      targetRule: 'Home Services',
      pointsAwarded: 25,
      maxPoints: 25,
      matched: true,
      reason: '✓ Industry matches target criteria (Home Services)',
    });
  } else {
    criteria.push({
      id: 'industry',
      criterionName: 'Target Industry',
      targetRule: 'Home Services',
      pointsAwarded: 0,
      maxPoints: 25,
      matched: false,
      reason: `✗ Industry (${input.industry || 'Not specified'}) does not match Home Services target`,
    });
  }

  // 2. Employee Count between 10–50 -> 20 points
  const employeeCount = Number(input.employeeCount) || 0;
  const isEmployeeMatch = employeeCount >= 10 && employeeCount <= 50;
  if (isEmployeeMatch) {
    totalScore += 20;
    criteria.push({
      id: 'employees',
      criterionName: 'Employee Headcount',
      targetRule: '10–50 Employees',
      pointsAwarded: 20,
      maxPoints: 20,
      matched: true,
      reason: `✓ Employee count (${employeeCount}) is within the ideal 10–50 range`,
    });
  } else {
    criteria.push({
      id: 'employees',
      criterionName: 'Employee Headcount',
      targetRule: '10–50 Employees',
      pointsAwarded: 0,
      maxPoints: 20,
      matched: false,
      reason: `✗ Employee count (${employeeCount}) is outside the target 10–50 range`,
    });
  }

  // 3. Revenue between $1M–$10M -> 20 points
  const revenue = Number(input.revenue) || 0;
  const isRevenueMatch = revenue >= 1_000_000 && revenue <= 10_000_000;
  if (isRevenueMatch) {
    totalScore += 20;
    criteria.push({
      id: 'revenue',
      criterionName: 'Estimated Revenue',
      targetRule: '$1M–$10M Annual Revenue',
      pointsAwarded: 20,
      maxPoints: 20,
      matched: true,
      reason: `✓ Revenue ($${(revenue / 1_000_000).toFixed(1)}M) matches investment criteria ($1M–$10M)`,
    });
  } else {
    const formattedRev =
      revenue >= 1_000_000
        ? `$${(revenue / 1_000_000).toFixed(2)}M`
        : `$${(revenue / 1_000).toFixed(0)}k`;
    criteria.push({
      id: 'revenue',
      criterionName: 'Estimated Revenue',
      targetRule: '$1M–$10M Annual Revenue',
      pointsAwarded: 0,
      maxPoints: 20,
      matched: false,
      reason: `✗ Revenue (${formattedRev}) does not meet the $1M–$10M target range`,
    });
  }

  // 4. Founded after 2000 -> 15 points
  const yearFounded = Number(input.yearFounded) || 0;
  const isFoundedMatch = yearFounded > 2000;
  if (isFoundedMatch) {
    totalScore += 15;
    criteria.push({
      id: 'yearFounded',
      criterionName: 'Year Founded',
      targetRule: 'Founded after 2000',
      pointsAwarded: 15,
      maxPoints: 15,
      matched: true,
      reason: `✓ Company was founded in ${yearFounded} (after 2000 target)`,
    });
  } else {
    criteria.push({
      id: 'yearFounded',
      criterionName: 'Year Founded',
      targetRule: 'Founded after 2000',
      pointsAwarded: 0,
      maxPoints: 15,
      matched: false,
      reason: `✗ Company was founded in ${yearFounded || 'N/A'} (must be founded after 2000)`,
    });
  }

  // 5. CEO Age 45+ -> 20 points
  const ceoAge = Number(input.ceoAge) || 0;
  const isCeoAgeMatch = ceoAge >= 45;
  if (isCeoAgeMatch) {
    totalScore += 20;
    criteria.push({
      id: 'ceoAge',
      criterionName: 'CEO Age',
      targetRule: 'Age 45 or older',
      pointsAwarded: 20,
      maxPoints: 20,
      matched: true,
      reason: `✓ CEO age (${ceoAge}) meets the 45+ leadership experience criteria`,
    });
  } else {
    criteria.push({
      id: 'ceoAge',
      criterionName: 'CEO Age',
      targetRule: 'Age 45 or older',
      pointsAwarded: 0,
      maxPoints: 20,
      matched: false,
      reason: `✗ CEO age (${ceoAge}) is below the 45+ criteria threshold`,
    });
  }

  // Determine Priority
  // 80–100 = HIGH, 50–79 = MEDIUM, Below 50 = LOW
  let priority: LeadPriority = 'LOW';
  if (totalScore >= 80) {
    priority = 'HIGH';
  } else if (totalScore >= 50) {
    priority = 'MEDIUM';
  } else {
    priority = 'LOW';
  }

  const scoreReasons = criteria.map((c) => c.reason);

  return {
    leadScore: totalScore,
    priority,
    scoreReasons,
    detailedCriteria: criteria,
  };
}
