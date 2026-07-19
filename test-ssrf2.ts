import dns from "dns/promises";
import { isSafeUrl } from "./src/lib/ssrf-protection.ts";

async function test() {
  console.log("0.0.0.0 bypass:", await isSafeUrl("http://0.0.0.0/"));
  // Let's mock dns.lookup to return 0.0.0.0
  const originalLookup = dns.lookup;
  (dns as any).lookup = async (hostname: string) => {
    return [{ address: "0.0.0.0", family: 4 }];
  };
  
  console.log("DNS to 0.0.0.0 bypass:", await isSafeUrl("http://some-ssrf-domain.com/"));
  
  (dns as any).lookup = originalLookup;
}
test();
