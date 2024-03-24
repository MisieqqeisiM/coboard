import { Handlers, PageProps } from "$fresh/server.ts";
import { useState } from "preact/hooks";
import { AppServer } from "./_app.tsx"

type HomeProps = PageProps<
  {
    clients: string[];
  }
>

export const handler: Handlers = {
  async GET(_req, ctx) {    
    const resp = await ctx.render({
      clients: AppServer.getClients()
    });
    return resp;
  },
};

export default function Home({data}: HomeProps) {

  return (
    <div class="px-4 py-8 mx-auto bg-[#86efac]">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <h1 class="text-4xl font-bold">Current users:</h1>
        <p class="my-4">
          {data.clients.join(",")}
        </p>
      </div>
    </div>
  );
}
