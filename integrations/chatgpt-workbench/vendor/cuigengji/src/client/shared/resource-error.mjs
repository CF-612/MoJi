/** useResource exposes strings; also accept thrown Error values at action boundaries. */
export function resourceError(error,fallback='读取失败，请重试。'){return typeof error==='string'?error:error?.message||fallback;}
