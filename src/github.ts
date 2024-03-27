import { invoke } from "@tauri-apps/api";
import { Store } from 'tauri-plugin-store-api';

const ghResponseStore = new Store('gh_data.json');

const argsToKey = (args: string[]) => args.join(" ");

const cache = {
  get: async (args: string[]) => {
    const key = argsToKey(args);
    console.log("Getting cache for", key);
    return ghResponseStore.get(key);
  },
  set: async (args: string[], value: any) => {
    const key = argsToKey(args);
    console.log("Setting cache for", key);
    await ghResponseStore.set(key, value);
    await ghResponseStore.save();
  }
}

const invokeWithCache = async (command: string, args: string[]) => {
  const cached = await cache.get(args);
  if (cached) {
    console.log("Cache hit for", argsToKey(args), cached);
    return cached;
  }

  const response = await invoke(command, { args });
  await cache.set(args, response);
  return response;
}
export type Owner = {
  login: string;
}

export type GHRepo = {
  id: string;
  name: string;
  owner: Owner;
  description: string;
}

export type GHIssue = {
  id: string;
  title: string;
}

export const GH = {
  getRepos: async (username: string) => {
    const response = await invokeWithCache("run_gh_cli", ["repo", "list", username, "--json", "id,name,description,owner"]);

    return JSON.parse(response as string) as GHRepo[];
  },

  getIssues: async (name: string, owner: string) => {
    const response = await invokeWithCache("run_gh_cli", ["issue", "list", "--repo", `${owner}/${name}`, "--json", "id,title"]);

    return JSON.parse(response as string) as GHIssue[];
  }
}
