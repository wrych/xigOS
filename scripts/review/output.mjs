/** Reads `claude -p --output-format json` output into `{ findings }`, or
 * `{ failure }` with a reason. Anything but structured findings is a failure,
 * never an empty pass. */
export function readOutput(stdout) {
  let output;
  try {
    output = JSON.parse(stdout);
  } catch {
    return { failure: "its output was not JSON" };
  }
  if (output.is_error === true) {
    return { failure: `it reported an error: ${output.result ?? "unknown"}` };
  }
  const findings = output.structured_output?.findings;
  return Array.isArray(findings)
    ? { findings }
    : { failure: "it returned no structured findings" };
}
