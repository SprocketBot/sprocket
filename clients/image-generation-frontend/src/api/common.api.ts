export async function handleApiResponse<T>(response: Response): Promise<T> {
  return new Promise((res, rej) => {
    if (response.status !== 200) {
      rej({
        status_code: response.status,
        status_text: response.statusText,
      });
    }
    res(response.json());
  });
}
