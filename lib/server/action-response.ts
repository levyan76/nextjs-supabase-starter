/**
 * Standard response pattern for Next.js Server Actions.
 *
 * Usage dans une Server Action :
 *   return actionSuccess({ userId: "123" });
 *   return actionError("Unauthorized", 401);
 *
 * Usage dans le client :
 *   const result = await createUser(formData);
 *   if (result.ok) { ... } else { toast.error(result.message); }
 */

export type ActionResponse<T = void> =
  | { ok: true; data: T }
  | { ok: false; message: string; code?: number };

export function actionSuccess<T = void>(data: T): ActionResponse<T> {
  return { ok: true, data };
}

export function actionError(
  message: string,
  code?: number
): ActionResponse<never> {
  return { ok: false, message, code };
}

/**
 * Wraps a server action to catch errors and return a standardized ActionResponse.
 * Usage:
 *   export const myAction = withActionResponse(async (formData) => {
 *     // ... logic that may throw
 *     return { userId: "123" };
 *   });
 */
export function withActionResponse<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>
) {
  return async (...args: TArgs): Promise<ActionResponse<TReturn>> => {
    try {
      const data = await fn(...args);
      return actionSuccess(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inattendue";
      const code = (err as { code?: number }).code;
      return actionError(message, code);
    }
  };
}
