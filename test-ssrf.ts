import { isSafeUrl } from "./src/lib/ssrf-protection";

async function test() {
  console.log("http://127.1/", await isSafeUrl("http://127.1/"));
  console.log("http://2130706433/", await isSafeUrl("http://2130706433/"));
  console.log("http://0x7f000001/", await isSafeUrl("http://0x7f000001/"));
  console.log("http://0177.0.0.1/", await isSafeUrl("http://0177.0.0.1/"));
  console.log("http://0/", await isSafeUrl("http://0/"));
  console.log("http://localhost/", await isSafeUrl("http://localhost/"));
  console.log("http://example.com/", await isSafeUrl("http://example.com/"));
}
test();
