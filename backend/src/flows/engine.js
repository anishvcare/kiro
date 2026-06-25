const Flow = require('../models/Flow');

/**
 * Flow Engine - Incoming messages process cheyth auto-reply return cheyyum
 * 
 * Multi-step flows support cheyyunnu:
 * User "hi" → Bot menu kaaniikkum → User "1" → Bot products kaanikkum
 */

// In-memory store for user conversation states
const userStates = new Map();

// State expiry time (10 minutes)
const STATE_EXPIRY = 10 * 60 * 1000;

async function processMessage(messageBody, phone) {
  const message = messageBody.trim().toLowerCase();

  // Check if user is in an active flow conversation
  const userState = userStates.get(phone);

  if (userState) {
    // Check if state expired
    if (Date.now() - userState.startedAt > STATE_EXPIRY) {
      userStates.delete(phone);
    } else {
      return await handleFlowStep(message, phone, userState);
    }
  }

  // Find matching flow for this message
  const flows = await Flow.find({ active: true }).sort({ priority: -1 });

  for (const flow of flows) {
    if (flow.triggerType !== 'default' && matchesTrigger(message, flow)) {
      return await startFlow(flow, phone);
    }
  }

  // No flow matched - use default flow
  const defaultFlow = await Flow.findOne({ triggerType: 'default', active: true });
  if (defaultFlow) {
    return await startFlow(defaultFlow, phone);
  }

  return null;
}

function matchesTrigger(message, flow) {
  const trigger = flow.trigger.toLowerCase();
  
  switch (flow.triggerType) {
    case 'keyword':
      return message === trigger;
    case 'contains':
      return message.includes(trigger);
    case 'regex':
      try {
        return new RegExp(flow.trigger, 'i').test(message);
      } catch {
        return false;
      }
    default:
      return message === trigger;
  }
}

async function startFlow(flow, phone) {
  if (!flow.steps || flow.steps.length === 0) {
    return flow.defaultReply || null;
  }

  const firstStep = flow.steps[0];

  // If step has options, save user state for next message
  if (firstStep.options && firstStep.options.length > 0) {
    userStates.set(phone, {
      flowId: flow._id.toString(),
      currentStepIndex: 0,
      startedAt: Date.now()
    });
  }

  return firstStep.message;
}

async function handleFlowStep(message, phone, userState) {
  const flow = await Flow.findById(userState.flowId);
  if (!flow) {
    userStates.delete(phone);
    return null;
  }

  const currentStep = flow.steps[userState.currentStepIndex];
  if (!currentStep || !currentStep.options || currentStep.options.length === 0) {
    userStates.delete(phone);
    return null;
  }

  // Find matching option
  const matchedOption = currentStep.options.find(opt =>
    message === opt.match.toLowerCase() ||
    message.includes(opt.match.toLowerCase())
  );

  if (matchedOption && matchedOption.nextStep) {
    const nextStepIndex = flow.steps.findIndex(s => s.id === matchedOption.nextStep);

    if (nextStepIndex !== -1) {
      const nextStep = flow.steps[nextStepIndex];

      if (nextStep.options && nextStep.options.length > 0) {
        // Continue flow
        userStates.set(phone, {
          ...userState,
          currentStepIndex: nextStepIndex,
          startedAt: Date.now()
        });
      } else {
        // End of flow
        userStates.delete(phone);
      }

      return nextStep.message;
    }
  }

  // Invalid option - show current step again
  return `❌ Valid option select cheyyuka:\n\n${currentStep.message}`;
}

// Clear user state (for manual reset)
function clearUserState(phone) {
  userStates.delete(phone);
}

// Get all active user states (for debugging)
function getActiveStates() {
  return Object.fromEntries(userStates);
}

module.exports = { processMessage, clearUserState, getActiveStates };
