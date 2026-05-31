export default async function tokenrefresh(): Promise<Response | { status: number }> {
  try {
    const result = await fetch("/api/users/auth/refresh_accesstoken", { method: "POST" });
    await result.json().catch(() => ({}));
    if (!result.ok) throw new Error();
    console.log("refresh access token obtained succesfully");
    return result;
  } catch (error) {
    console.log("error occred during refreshing ccess token using worker" + error);
    return { status: 500 };
  }
}
