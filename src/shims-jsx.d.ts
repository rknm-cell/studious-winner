declare module "*.jsx" {
  const component: import("react").ComponentType<Record<string, unknown>>;
  export default component;
}

declare module "./BusinessNamingFlow.jsx" {
  const component: import("react").ComponentType<Record<string, unknown>>;
  export default component;
}

