import { invoke } from "@tauri-apps/api";

export type GHRepo = {
  id: string;
  name: string;
  owner: string;
  description: string;
}

export const GH = {
  getRepos: async (username: string) => {
    // const response = await invoke("run_gh_cli", {
    //   args: ["repo", "list", username, "--json", "id,name,description,owner"],
    // });

    // return JSON.parse(response as string) as GHRepo[];
    return [
      {
        id: "1",
        name: "repo1",
        owner: "Veikkosuhonen",
        description: "desc1"
      },
      {
        id: "2",
        name: "repo2",
        owner: "Veikkosuhonen",
        description: "desc2"
      }
    ]
  },

  getIssues: async (name: string, owner: string) => {
    // const response = await invoke("run_gh_cli", {
    //   args: ["issue", "list", owner, name, "--json", "id,title"],
    // });

    // return JSON.parse(response as string) as GHRepo[];
    return [
      {
        id: "1",
        title: "issue1"
      },
      {
        id: "2",
        title: "issue2"
      }
    ]
  }
}
