import { spawnSync } from "node:child_process";

const allowedAdvisories = new Map([
    [
        "GHSA-w3rx-r6r6-pgpr",
        "image-size ICNS denial of service; no patched npm release is available",
    ],
    [
        "GHSA-5p2g-fcmc-qvqq",
        "image-size JXL/HEIF denial of service; no patched npm release is available",
    ],
]);

const audit = spawnSync("npm", ["audit", "--omit=dev", "--json"], {
    encoding: "utf8",
    shell: process.platform === "win32",
});

if (audit.error) {
    console.error(`Unable to run npm audit: ${audit.error.message}`);
    process.exit(1);
}

let report;

try {
    report = JSON.parse(audit.stdout);
} catch {
    console.error("npm audit did not return valid JSON.");
    console.error(audit.stderr || audit.stdout);
    process.exit(1);
}

if (report.error) {
    console.error(
        `npm audit failed: ${report.error.summary ?? "unknown registry error"}`,
    );
    process.exit(1);
}

const blockingSeverities = new Set(["high", "critical"]);
const discoveredAdvisories = new Map();

for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
    for (const cause of vulnerability.via ?? []) {
        if (typeof cause !== "object" || !blockingSeverities.has(cause.severity))
            continue;

        const advisoryId = cause.url?.split("/").at(-1) ?? `npm-advisory-${cause.source}`;
        discoveredAdvisories.set(advisoryId, cause);
    }
}

const unexpectedAdvisories = [...discoveredAdvisories].filter(
    ([advisoryId]) => !allowedAdvisories.has(advisoryId),
);

for (const [advisoryId, reason] of allowedAdvisories) {
    if (!discoveredAdvisories.has(advisoryId)) continue;

    console.warn(
        `::warning title=Temporarily allowed npm advisory::${advisoryId}: ${reason}.`,
    );
}

if (unexpectedAdvisories.length > 0) {
    for (const [advisoryId, advisory] of unexpectedAdvisories) {
        console.error(
            `::error title=Production dependency vulnerability::${advisoryId}: ${advisory.title}`,
        );
    }

    process.exit(1);
}

const reportedBlockingCount =
    (report.metadata?.vulnerabilities?.high ?? 0) +
    (report.metadata?.vulnerabilities?.critical ?? 0);

if (reportedBlockingCount > 0 && discoveredAdvisories.size === 0) {
    console.error(
        "npm audit reported high or critical vulnerabilities without advisory details.",
    );
    process.exit(1);
}

console.log(
    "Production dependency audit passed with no unapproved high or critical advisories.",
);
