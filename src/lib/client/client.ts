export async function api(url: string, options: RequestInit = {}) {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const headers = {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
    };
    let response = await fetch(url, { ...options, headers });
    if (response.status === 401 && refreshToken) {
        const refreshRes = await fetch("/api/v1/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
            const { accessToken: newAccess } = await refreshRes.json();
            localStorage.setItem("accessToken", newAccess);
            const retryHeaders = {
                ...headers,
                Authorization: `Bearer ${newAccess}`,
            };
            // Retry original request with new token
            response = await fetch(url, { ...options, headers: retryHeaders });
        }
    }
    return response;
}
