import { runAiAssistant } from '../../server/aiService';
import { createJsonPostHandler } from '../../server/vercelAdapter';

export default createJsonPostHandler(runAiAssistant);
