import * as LocalAuthentication from "expo-local-authentication";

// Function to Authenticate User via Biometrics
const authenticateUser = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    console.log("No biometric hardware available ❌");
    return false;
  }

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) {
    console.log("No biometrics enrolled ❌");
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Authenticate with Biometrics",
    fallbackLabel: "Use Passcode"
  });

  if (result.success) {
    console.log("Biometric Authentication Success ✅");
    return true;
  } else {
    console.log("Biometric Authentication Failed ❌");
    return false;
  }
};

// Example Usage:
authenticateUser();
