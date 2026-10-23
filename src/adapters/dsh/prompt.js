import { persona } from './skills.js';

const PERSONA_NAME = 'moji:writing';
const OWN_NAMES = new Set([PERSONA_NAME, 'moji:handoff', 'moji:preset', 'moji:novel', 'cuigengji:writing', 'cuigengji:handoff', 'cuigengji:preset', 'cuigengji:novel']);

export function registerPrompt(ctx, { store, resolveBinding } = {}) {
  // Only author-enabled writing requirements join the stable persona. Story
  // content stays on demand; omit changing metadata to keep this text stable.
  ctx.on('system-prompt/assemble', async (assembly, context, next) => {
    const result = await next();
    if (!context.agent?.id) return result;
    context.signal?.throwIfAborted();
    const actor = { kind: 'agent', sessionId: String(context.agent.session?.id || context.agent.id) };
    let binding,preset;
    try {binding = store && await (resolveBinding
      ? resolveBinding(actor.sessionId)
      : store.dispatch('binding.get', {}, actor));
      preset=binding ? await store.dispatch('preset.read', {}, actor) : null;}
    catch (error) {
      if (!['UPGRADE_REQUIRED','UNAUTHENTICATED','NOT_AUTHENTICATED','UNAUTHORIZED','TOKEN_EXPIRED','NETWORK_ERROR','TIMEOUT','REFRESH_FAILED'].includes(error.code)) throw error;
      // A broken project must not prevent the host agent from calling the
      // unbound maintenance tool or the native plugin manager.
      return {...result,sections:result.sections.filter(entry => !OWN_NAMES.has(entry.name)),contexts:result.contexts.filter(entry => !OWN_NAMES.has(entry.name))};
    }
    context.signal?.throwIfAborted();
    return {
      ...result,
      sections: [
        ...result.sections.filter(entry => !OWN_NAMES.has(entry.name)),
        { name: PERSONA_NAME, text: persona, interpolate: false },
        ...(preset?.enabled && preset.content ? [{ name: 'moji:preset', text: `作者的写作要求：\n${preset.content}`, interpolate: false }] : []),
      ],
      contexts: result.contexts.filter(entry => !OWN_NAMES.has(entry.name)),
    };
  });
}
