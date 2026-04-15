const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

const copyFileSecret = ({ envName, targets, required }) => {
  const source = process.env[envName];

  if (!source) {
    if (required) {
      throw new Error(`${envName} is required for EAS Android builds.`);
    }
    console.log(`${envName} is not set; skipping.`);
    return;
  }

  if (!fs.existsSync(source)) {
    throw new Error(`${envName} points to a file that does not exist: ${source}`);
  }

  for (const target of targets) {
    const destination = path.join(projectRoot, target);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
    console.log(`Copied ${envName} to ${target}`);
  }
};

copyFileSecret({
  envName: "GOOGLE_SERVICES_JSON",
  required: process.env.EAS_BUILD_PLATFORM === "android",
  targets: ["google-services.json", "android/app/google-services.json"],
});

copyFileSecret({
  envName: "GOOGLE_SERVICE_INFO_PLIST",
  required: false,
  targets: ["GoogleService-Info.plist", "ios/NGFreshFoods/GoogleService-Info.plist"],
});
