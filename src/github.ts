import { invoke } from "@tauri-apps/api";

type GHRepo = {
  id: string;
  name: string;
  description: string;
}

export const GH = {
  getRepos: async (username: string) => {
    const response = await invoke("run_gh_cli", {
      args: ["repo", "list", username, "--json", "id,name,description"],
    });

    return JSON.parse(response as string) as GHRepo[];
  }
}
