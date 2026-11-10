import { expect, type APIRequestContext } from "@playwright/test";

export const apiOrigin = process.env["STUDENT_API_URL"] ?? "http://localhost:3000";

export async function demoAdminHeaders(request: APIRequestContext, account: string) {
  const password = process.env["UEMP_E2E_PASSWORD"];
  if (!password)
    throw new Error("Set UEMP_E2E_PASSWORD for the disposable demo backend.");
  const response = await request.post(apiOrigin + "/v1/auth/sign-in", {
    data: { email: account + "@demo.example.test", password, role: "admin" },
  });
  expect(response.status()).toBe(200);
  const session = await response.json();
  return { Authorization: "Bearer " + session.access.token };
}

export async function demoSemester(request: APIRequestContext) {
  const headers = await demoAdminHeaders(request, "super-admin");
  const response = await request.get(apiOrigin + "/v1/admin/academic", { headers });
  expect(response.status()).toBe(200);
  const setup = await response.json();
  const faculty = setup.faculties.find(
    (item: { name: string }) => item.name === "Demo Faculty of Science",
  );
  const semester = setup.semesters.find(
    (item: { id: string }) => item.id === faculty?.currentSemesterId,
  );
  if (!semester) throw new Error("The demo faculty needs a current semester.");
  const { id, academicSessionId, name, termNumber, maxUnits, status } = semester;
  return {
    maxUnits,
    async setLimit(limit: number) {
      const response = await request.put(
        apiOrigin + "/v1/admin/academic/semesters/" + id,
        {
          headers,
          data: { academicSessionId, name, termNumber, maxUnits: limit, status },
        },
      );
      expect(response.status()).toBe(200);
    },
  };
}
