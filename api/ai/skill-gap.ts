import { runSkillGapDiagnostic } from '../../server/aiService';
import { createJsonPostHandler } from '../../server/vercelAdapter';

export default createJsonPostHandler(runSkillGapDiagnostic);
