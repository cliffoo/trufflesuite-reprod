import { NextResponse } from "next/server";
import { fetchAndCompile } from "@truffle/fetch-and-compile";
import Config from "@truffle/config";

export async function GET(request: Request) {
  const { compileResult } = await fetchAndCompile(
    new URL(request.url).searchParams.get("address")!,
    Config.default().merge({
      networks: {
        mainnet: { url: "http://mainnet.infura.io/v3", network_id: 1 }
      },
      network: "mainnet"
    })
  );
  return NextResponse.json(compileResult);
}
