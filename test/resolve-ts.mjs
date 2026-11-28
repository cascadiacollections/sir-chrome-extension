/**
 * Node's type stripper does not add extensions. Source imports stay
 * extensionless for webpack and tsc; tests resolve them to `.ts`.
 */
export function resolve(specifier, context, nextResolve) {
  if (
    (specifier.startsWith('./') || specifier.startsWith('../')) &&
    !/\.(?:[cm]?js|json|ts|tsx)$/.test(specifier)
  ) {
    return nextResolve(`${specifier}.ts`, context);
  }
  return nextResolve(specifier, context);
}
