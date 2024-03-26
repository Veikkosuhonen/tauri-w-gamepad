import { invoke } from "@tauri-apps/api";

export const GH = {
  getRepos: async (username: string) => {
    const response = await invoke("run_gh_cli", {
      args: ["repo", "list", username],
    });

    console.log(response);

    return response as string;
  }
}
