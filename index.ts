import { provider } from "ganache";
// @ts-ignore
import { forTx } from "@truffle/debugger";
import * as Codec from "@truffle/codec";
import { fetchAndCompile } from "@truffle/fetch-and-compile";
import Config from "@truffle/config";
import type { Session } from "./types";

const tx = "0x2c15334d80f1fbb291589bd062c99b703ac86d5ea6d3d721caee08bcaff6b7ed";
const network = "goerli";
const config = Config.default().merge({
  networks: {
    [network]: { network_id: 5 }
  },
  network
});

(async () => {
  log("creating session");
  const session = await createSession();
  log("session created");

  log("adding compilations to session");
  await fetchCompilationsAndAddToSession(session);
  log("compilations added");

  log("session starting full mode");
  await session.startFullMode();
  log("full mode started");

  log("calling session.continueUntilBreakpoint");
  await session.continueUntilBreakpoint();
  log("called");
})();

function createSession() {
  return forTx(tx, {
    provider: provider({ fork: { network } }),
    compilations: [],
    lightMode: true
  });
}

async function fetchCompilationsAndAddToSession(session: Session) {
  const $ = session.selectors;
  const instances = session.view($.session.info.affectedInstances);
  const addresses = Object.entries(instances)
    .filter(([_, { contractName }]: any) => contractName === undefined)
    .map(([address, _]) => address);

  for (const address of addresses) {
    const { compilations } = (await fetchAndCompile(address, config))
      .compileResult;
    const shimmedCompilations = Codec.Compilations.Utils.shimCompilations(
      compilations,
      `externalFor(${address})Via(Etherscan)`
    );
    await session.addExternalCompilations(shimmedCompilations);
  }
}

function log(message: string) {
  console.log(`\x1b[36m${message}\x1b[0m`);
}
