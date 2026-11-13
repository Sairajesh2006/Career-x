import { runResumeAnalysis } from '../../server/aiService';
import { createJsonPostHandler } from '../../server/vercelAdapter';

export default createJsonPostHandler(runResumeAnalysis);
