import axios from "axios";

export async function initiateSignin({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  try {
    const res = await axios.post("/api/initiate-signin", { email, name });
    return res;
  } catch (error) {
    console.error("Error initiating sign-in:", error);
  }
}

export async function verifyOtp({
  email,
  name,
  otp,
}: {
  email: string;
  name: string;
  otp: string;
}) {
  try {
    const res = await axios.post("/api/verify-otp", {
      email,
      name,
      otp,
    });
    return res;
  } catch (error) {
    console.error("Error verifying OTP:", error);
  }
}

export async function signOut(user_id: string) {
  try {
    const res = await axios.post(
      "/api/logout",
      {
        userId: user_id,
      },
      { withCredentials: true },
    );
    return res;
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

export async function fetchUserFromSession(user_id: string) {
  try {
    const res = await axios.get(`/api/get-user?user_id=${user_id}`);
    return res;
  } catch (error) {
    console.error("Error fetching user from session:", error);
  }
}

export async function updateUser(user_id: string, newName: string) {
  try {
    const res = await axios.put(
      `/api/update-profile/${user_id}`,
      { name: newName },
      { withCredentials: true },
    );
    return res;
  } catch (error) {
    console.error("Error updating user name:", error);
  }
}
