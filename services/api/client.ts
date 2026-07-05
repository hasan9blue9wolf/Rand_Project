export async function simulateRequest<T>(data: T, timeout = 350): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, timeout));
  return data;
}
