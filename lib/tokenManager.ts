let token: string | null = null;

export const getToken = (): string | null => {
    if (!token) {
        try {
            token = localStorage.getItem('accessToken');
        } catch (e) {
            console.error("Could not access localStorage", e);
            token = null;
        }
    }
    return token;
}

export const setToken = (newToken: string): void => {
    token = newToken;
    try {
        localStorage.setItem('accessToken', newToken);
    } catch(e) {
        console.error("Could not set token in localStorage", e);
    }
};

export const clearToken = (): void => {
    token = null;
    try {
        localStorage.removeItem('accessToken');
    } catch(e) {
        console.error("Could not clear token in localStorage", e);
    }
};
