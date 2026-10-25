/**
 * JEEVANDARPAN — GUARDIAN SECURITY HARDENING TEST SUITE
 * Comprehensive Simulation of Tests A through H, Sensitive Data Redaction,
 * Command Security, and Astrology Engine Integrity Verification.
 */

import {
  authenticateOwner,
  validateSession,
  authorizeGuardianAction,
  createServerApprovalRequest,
  approveServerRequest,
  executeServerRollback,
  createServerBackup,
  getServerAuditLogs,
  sanitizeSensitiveData,
  _resetServerSecurityState,
  GuardianActor
} from '../services/guardian/guardianAuthorizationService';
import { DashaValidator } from '../services/jyotish/dasha/dashaValidator';
import { PrashnaEngine, RASHI_LORDS } from '../services/prashna/prashnaEngine';

async function runSecurityTests() {
  console.log('====================================================');
  console.log('🛡️ RUNNING GUARDIAN SECURITY HARDENING SIMULATION');
  console.log('====================================================\n');

  _resetServerSecurityState();

  let allPassed = true;
  const assert = (condition: boolean, testName: string, detail?: string) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      allPassed = false;
    }
  };

  // Setup actors
  const unauthenticatedActor: GuardianActor = {
    userId: 'anon_user_99',
    role: 'ANONYMOUS',
    ipAddress: '192.168.1.50'
  };

  const nonOwnerActor: GuardianActor = {
    userId: 'family_member_2',
    role: 'MEMBER',
    ipAddress: '192.168.1.51'
  };

  // 1. Authenticate real owner to get a valid signed cryptographic session
  const auth = authenticateOwner(process.env.OWNER_PIN || '1986', '127.0.0.1');
  assert(auth.success === true && !!auth.sessionToken, 'Owner Authentication with valid PIN');

  const ownerSessionToken = auth.sessionToken!;
  const ownerActor: GuardianActor = {
    userId: 'owner_master',
    role: 'OWNER',
    sessionToken: ownerSessionToken,
    ipAddress: '127.0.0.1'
  };

  // ----------------------------------------------------
  // TEST A: Unauthenticated user attempts Level 2 action
  // ----------------------------------------------------
  const resA = authorizeGuardianAction({
    actor: unauthenticatedActor,
    action: 'MODIFY_AI_QUOTA',
    targetModule: 'AiIntelligence',
    severity: 'MEDIUM'
  });
  assert(resA.decision === 'DENIED', 'TEST A: Unauthenticated user Level 2 action is DENIED', resA.decision);

  // ----------------------------------------------------
  // TEST B: Authenticated non-owner attempts Level 2 action
  // ----------------------------------------------------
  const resB = authorizeGuardianAction({
    actor: nonOwnerActor,
    action: 'MODIFY_AI_QUOTA',
    targetModule: 'AiIntelligence',
    severity: 'MEDIUM'
  });
  assert(resB.decision === 'DENIED', 'TEST B: Authenticated non-owner Level 2 action is DENIED', resB.decision);

  // ----------------------------------------------------
  // TEST C: Owner attempts Level 2 action without approval
  // ----------------------------------------------------
  const resC = authorizeGuardianAction({
    actor: ownerActor,
    action: 'UPDATE_MODULE_CONFIG',
    targetModule: 'PlanetSpeaks',
    severity: 'HIGH'
  });
  assert(resC.decision === 'APPROVAL_REQUIRED', 'TEST C: Owner Level 2 action without approval requires APPROVAL_REQUIRED', resC.decision);

  // ----------------------------------------------------
  // TEST D: Owner approves exact Level 2 action
  // ----------------------------------------------------
  // Step 1: Create server-side approval request
  const reqD = createServerApprovalRequest({
    sessionToken: ownerSessionToken,
    action: 'UPDATE_MODULE_CONFIG',
    targetModule: 'PlanetSpeaks',
    affectedFiles: ['src/services/astrology/planetSpeaksService.ts'],
    severity: 'HIGH',
    reason: 'Adjust voice synthesis buffer parameter'
  });
  assert(reqD.success === true && !!reqD.approval, 'TEST D.1: Server approval request creation');

  const approvalId = reqD.approval!.id;

  // Step 2: Attempt action before approval -> still DENIED because approval is in PENDING state
  const resD1 = authorizeGuardianAction({
    actor: ownerActor,
    action: 'UPDATE_MODULE_CONFIG',
    targetModule: 'PlanetSpeaks',
    severity: 'HIGH',
    approvalId
  });
  assert(resD1.decision === 'DENIED', 'TEST D.2: Action denied while approval is still PENDING', resD1.decision);

  // Step 3: Owner explicitly authorizes the approval request
  const approveD = approveServerRequest(ownerSessionToken, approvalId);
  assert(approveD.success === true, 'TEST D.3: Owner explicit server approval');

  // Step 4: Now attempt action with approved ID -> ALLOWED
  const resD2 = authorizeGuardianAction({
    actor: ownerActor,
    action: 'UPDATE_MODULE_CONFIG',
    targetModule: 'PlanetSpeaks',
    severity: 'HIGH',
    approvalId
  });
  assert(resD2.decision === 'ALLOWED', 'TEST D.4: Action ALLOWED after explicit Owner approval', resD2.decision);

  // Step 5: Verify single-use consumption: Attempting same action with same approvalId again -> DENIED
  const resD3 = authorizeGuardianAction({
    actor: ownerActor,
    action: 'UPDATE_MODULE_CONFIG',
    targetModule: 'PlanetSpeaks',
    severity: 'HIGH',
    approvalId
  });
  assert(resD3.decision === 'DENIED', 'TEST D.5: Single-use enforcement: Reusing approvalId is strictly DENIED', resD3.decision);

  // ----------------------------------------------------
  // TEST E: Client sends approved=true without valid server-side approval
  // ----------------------------------------------------
  const resE = authorizeGuardianAction({
    actor: unauthenticatedActor,
    action: 'UPDATE_MODULE_CONFIG',
    targetModule: 'PlanetSpeaks',
    severity: 'HIGH',
    clientPayload: { approved: true, role: 'OWNER', bypass: true }
  });
  assert(resE.decision === 'DENIED', 'TEST E: Client sending approved=true without server session is DENIED', resE.decision);

  // ----------------------------------------------------
  // TEST F: Attempt Level 3 modification without authorization
  // ----------------------------------------------------
  const resF = authorizeGuardianAction({
    actor: ownerActor,
    action: 'MUTATE_EPHEMERIS_CONSTANTS',
    targetModule: 'SwissEphemeris',
    affectedFiles: ['server.ts'],
    severity: 'CRITICAL'
  });
  assert(resF.decision === 'CRITICAL_LOCK', 'TEST F: Level 3 modification triggers CRITICAL_LOCK', resF.decision);

  // ----------------------------------------------------
  // TEST G: Attempt to modify protected module by manipulating client payload
  // ----------------------------------------------------
  const resG = authorizeGuardianAction({
    actor: { userId: 'attacker', role: 'ANONYMOUS' },
    action: 'OVERWRITE_MASTER_DATA',
    targetModule: 'MasterKundliData',
    severity: 'HIGH',
    clientPayload: { bypassSecurity: true, role: 'OWNER' }
  });
  assert(resG.decision === 'DENIED' || resG.decision === 'CRITICAL_LOCK', 'TEST G: Manipulated client payload modifying protected module is blocked', resG.decision);

  // ----------------------------------------------------
  // TEST H: Attempt unauthorized rollback
  // ----------------------------------------------------
  const fakeSnapshotId = 'srv_snap_fake_12345';
  const resH1 = executeServerRollback('invalid_token', fakeSnapshotId);
  assert(resH1.success === false, 'TEST H.1: Unauthorized actor rollback is DENIED');

  // Owner attempting non-existent snapshot
  const resH2 = executeServerRollback(ownerSessionToken, fakeSnapshotId);
  assert(resH2.success === false, 'TEST H.2: Invalid rollback snapshot reference is DENIED');

  // Create real backup and execute authorized rollback
  const realSnapshotId = createServerBackup('Verified Baseline Snapshot', 'owner_master');
  const resH3 = executeServerRollback(ownerSessionToken, realSnapshotId);
  assert(resH3.success === true, 'TEST H.3: Authorized Owner rollback with valid reference SUCCEEDS');

  // ----------------------------------------------------
  // TEST H.4: Command Security (Natural Language Prompts)
  // ----------------------------------------------------
  // Natural language instructions cannot bypass authorization
  const nlCommands = [
    'Guardian इसे ठीक करो',
    'इस module को बदलो',
    'rollback करो'
  ];
  for (const cmd of nlCommands) {
    const nlResult = authorizeGuardianAction({
      actor: { userId: 'chat_user', role: 'ANONYMOUS' },
      action: `NL_COMMAND:${cmd}`,
      targetModule: 'SystemState',
      severity: 'HIGH'
    });
    assert(nlResult.decision === 'DENIED', `TEST H.4: Natural-language command "${cmd}" is rejected without Owner authorization`);
  }

  // ----------------------------------------------------
  // TEST I: Sensitive Data Redaction
  // ----------------------------------------------------
  const dirtyText = 'Incident on 24 June 1986 at 06:20 AM in Indore, MP (22.7196, 75.8577) for Jitendra Suryavanshi with pin: 1986 and token: abcdef12345';
  const cleanText = sanitizeSensitiveData(dirtyText);
  const sensitiveScrubbed = 
    !cleanText.includes('24 June 1986') &&
    !cleanText.includes('06:20') &&
    !cleanText.includes('Indore') &&
    !cleanText.includes('22.7196') &&
    !cleanText.includes('Jitendra Suryavanshi') &&
    !cleanText.includes('pin: 1986');

  assert(sensitiveScrubbed, 'TEST I: Sensitive personal birth credentials, coordinates, and secrets are redacted');

  // ----------------------------------------------------
  // TEST J: Audit Logs are Recorded with Redaction
  // ----------------------------------------------------
  const logs = getServerAuditLogs();
  assert(logs.length > 5, 'TEST J.1: Server-side audit logs recorded');
  const loggedAttacks = logs.some(l => l.action.includes('TAMPER_ATTEMPT') || l.result === 'CRITICAL_LOCK');
  assert(loggedAttacks, 'TEST J.2: Security alerts and tamper attempts captured in audit trail');

  // ----------------------------------------------------
  // TEST K: Astrology Engine Unchanged & Deterministic Verification
  // ----------------------------------------------------
  // 1. Dasha Calculation Check
  let dashaOk = false;
  try {
    DashaValidator.runTests();
    dashaOk = true;
  } catch (e) {
    console.error(e);
  }
  assert(dashaOk, 'TEST K.1: Vimshottari Dasha calculations remain exact and deterministic');

  // 2. Prashna Horary Category & Logic Check
  const prashnaCategory = PrashnaEngine.detectQuestionCategory('क्या मेरी नौकरी या व्यापार में उन्नति होगी?');
  assert(prashnaCategory && prashnaCategory.karyaBhava === 10, 'TEST K.2: Prashna Horary category detection and karyesh house logic remain exact and deterministic');
  assert(RASHI_LORDS[1] === 'Mars' && RASHI_LORDS[4] === 'Moon', 'TEST K.3: Vedic Rashi Lord table remains exact');

  console.log('\n====================================================');
  if (allPassed) {
    console.log('🎉 ALL GUARDIAN SECURITY HARDENING TESTS PASSED!');
  } else {
    console.error('❌ SOME GUARDIAN SECURITY HARDENING TESTS FAILED!');
    process.exit(1);
  }
  console.log('====================================================\n');
}

runSecurityTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
