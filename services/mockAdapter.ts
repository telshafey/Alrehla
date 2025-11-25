
/**
 * This helper simulates network latency.
 * It allows us to switch between Mock Data and Real API easily in the Services layer.
 */
export const mockFetch = <T>(data: T, delay = 500): Promise<T> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(data);
        }, delay);
    });
};
