# Render builds the final stage; Compose can still target student or admin directly.
ARG FRONTEND_APP=admin

FROM node:24-bookworm-slim AS dependencies
WORKDIR /workspace
RUN npm install --global pnpm@12.11.2
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/student/package.json ./apps/student/package.json
COPY apps/admin/package.json ./apps/admin/package.json
COPY packages/api-contracts/package.json ./packages/api-contracts/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/theme/package.json ./packages/theme/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/web-client/package.json ./packages/web-client/package.json
RUN pnpm install --frozen-lockfile

FROM dependencies AS student-build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 UEMP_STANDALONE=1
RUN mkdir -p apps/student/public/licenses \
    && cp packages/theme/assets/fonts/OFL.txt apps/student/public/licenses/source-sans-3.txt \
    && pnpm --filter @uemp/student build

FROM dependencies AS admin-build
COPY . .
# This address is used by the browser, so it must never be a Compose-only hostname.
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}
RUN pnpm --filter @uemp/admin build

FROM node:24-bookworm-slim AS student
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3001 HOSTNAME=0.0.0.0
COPY --chown=node:node --from=student-build /workspace/apps/student/.next/standalone ./
COPY --chown=node:node --from=student-build /workspace/apps/student/.next/static ./apps/student/.next/static
COPY --chown=node:node --from=student-build /workspace/apps/student/public ./apps/student/public
USER node
EXPOSE 3001
CMD ["node", "apps/student/server.js"]

FROM nginx:stable-alpine AS admin
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=admin-build /workspace/apps/admin/dist /usr/share/nginx/html
COPY packages/theme/assets/fonts/OFL.txt /usr/share/nginx/html/licenses/source-sans-3.txt
USER nginx
EXPOSE 8080
# The static configuration needs no entrypoint scripts or writes to /etc/nginx.
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]

# Select the complete runtime so its command, user, and port settings stay together.
FROM ${FRONTEND_APP} AS app
