import { FreshContext, Handlers, PageProps } from "../../deps.ts";
import { getAccount, redirectToHome } from "../../server/utils.ts";
import SetName from "../islands/app/SetName.tsx";

export const handler: Handlers = {
  async GET(req: Request, ctx: FreshContext) {
    const account = await getAccount(req);
    if (!account) {
      return redirectToHome();
    }

    const url = new URL(req.url);
    const redirectTo = url.searchParams.get("redirectTo");
    return ctx.render({ redirectTo: redirectTo ?? "/", name: account.name });
  },
};

interface HomePars {
  redirectTo: string;
  name: string;
}

export default function Home(props: PageProps<HomePars>) {
  return <SetName redirectTo={props.data.redirectTo} name={props.data.name} />;
}
