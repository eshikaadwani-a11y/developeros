/**
 * DeveloperOS - MVP entry point.
 */

export interface AppInfo {
  name: string;
  version: string;
}

export function getAppInfo(): AppInfo {
  return { name: "DeveloperOS", version: "0.1.0" };
}

function main(): void {
  const info = getAppInfo();
  console.log(`${info.name} v${info.version} starting up...`);
}

if (require.main === module) {
  main();
}
