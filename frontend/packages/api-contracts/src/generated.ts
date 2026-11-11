export interface paths {
    "/v1/academic-references": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AcademicReferencesController_list_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/academic": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AcademicSetupController_read_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/academic/departments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AcademicSetupController_createDepartment_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/academic/departments/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["AcademicSetupController_updateDepartment_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/academic/faculties": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AcademicSetupController_createFaculty_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/academic/faculties/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["AcademicSetupController_updateFaculty_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/academic/faculties/{id}/current-semester": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["AcademicSetupController_setCurrentSemester_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/academic/levels/{id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["AcademicSetupController_setLevelStatus_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/academic/programmes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AcademicSetupController_createProgramme_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/academic/programmes/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["AcademicSetupController_updateProgramme_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/academic/semesters": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AcademicSetupController_createSemester_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/academic/semesters/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["AcademicSetupController_updateSemester_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/academic/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AcademicSetupController_createSession_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/academic/sessions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["AcademicSetupController_updateSession_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/admins": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminsController_list_v1"];
        put?: never;
        post: operations["AdminsController_create_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/admins/{adminId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminsController_get_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/admins/{adminId}/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminsController_assign_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/admins/{adminId}/roles/{grantId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["AdminsController_revoke_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/admins/me/authorization": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminsController_authorization_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/audit-events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminAuditController_list_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/audit-events/{eventId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminAuditController_get_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/courses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CourseSetupController_read_v1"];
        put?: never;
        post: operations["CourseSetupController_createCourse_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/courses/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["CourseSetupController_updateCourse_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/courses/curriculum": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["CourseSetupController_addCurriculum_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/courses/curriculum/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["CourseSetupController_removeCurriculum_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/courses/lecturers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CourseSetupController_lecturers_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/courses/offerings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["CourseSetupController_createOffering_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/courses/offerings/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["CourseSetupController_updateOffering_v1"];
        trace?: never;
    };
    "/v1/admin/registrations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["DepartmentRegistrationController_report_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/registrations/students/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["DepartmentRegistrationController_register_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/registrations/students/{userId}/available": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["DepartmentRegistrationController_available_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/reports/courses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AcademicReportingController_courses_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/reports/options": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AcademicReportingController_options_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/reports/overview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AcademicReportingController_overview_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/results": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["DepartmentResultsController_list_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/results/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["DepartmentResultsController_detail_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/results/{id}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["DepartmentResultsController_approve_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/results/{id}/reopen": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["DepartmentResultsController_reopen_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/results/{id}/request-corrections": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["DepartmentResultsController_requestCorrections_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/results/options": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["DepartmentResultsController_options_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["RolesController_list_v1"];
        put?: never;
        post: operations["RolesController_create_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/roles/{roleId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["RolesController_update_v1"];
        post?: never;
        delete: operations["RolesController_delete_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminUsersController_list_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/users/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AdminUsersController_get_v1"];
        put?: never;
        post?: never;
        delete: operations["AdminUsersController_delete_v1"];
        options?: never;
        head?: never;
        patch: operations["AdminUsersController_update_v1"];
        trace?: never;
    };
    "/v1/admin/users/{userId}/revoke-sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminUsersController_revokeSessions_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/users/{userId}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["AdminUsersController_status_v1"];
        trace?: never;
    };
    "/v1/admin/users/{userId}/student-placement": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["AdminUsersController_placement_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/users/students": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AdminUsersController_createStudent_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_refresh_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/sign-in": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_signIn_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/sign-out": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_signOut_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/auth/signup/student": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_signUp_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/lecturer/offerings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["LecturerRegistrationController_offerings_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/lecturer/offerings/{id}/close-registration": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["LecturerRegistrationController_close_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/lecturer/offerings/{id}/roster": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["LecturerRegistrationController_roster_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/lecturer/results/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["LecturerResultsController_detail_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/lecturer/results/{id}/marks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["LecturerResultsController_saveMarks_v1"];
        trace?: never;
    };
    "/v1/lecturer/results/{id}/submit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["LecturerResultsController_submit_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/student/registrations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["StudentRegistrationController_terms_v1"];
        put?: never;
        post: operations["StudentRegistrationController_register_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/student/registrations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["StudentRegistrationController_summary_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/student/registrations/{id}/summary/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["StudentRegistrationController_download_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/student/registrations/available": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["StudentRegistrationController_available_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/student/results": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["StudentResultsController_history_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/student/results/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["StudentResultsController_statement_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/student/results/{id}/statement/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["StudentResultsController_download_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["UsersController_me_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["UsersController_update_v1"];
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AcademicLevelResponseDto: {
            /**
             * @description Academic level shown to users.
             * @example 100 Level
             */
            displayName: string;
            /**
             * Format: uuid
             * @description Academic level ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Whether this is the graduate stage.
             * @example false
             */
            isGraduate: boolean;
            /**
             * @description University programme type.
             * @example undergrad
             * @enum {string}
             */
            programType: "undergrad" | "postgrad" | "masters" | "doctorate";
            /**
             * @description Label that distinguishes choices in a list.
             * @example 100 Level
             */
            selectionLabel: string;
            /**
             * @description Academic stage. Zero represents a graduate.
             * @example 1
             */
            stage: number;
        };
        AcademicLevelSetupDto: {
            /**
             * @description The university’s fixed display label for the level.
             * @example 100 Level
             */
            displayName: string;
            /**
             * Format: uuid
             * @description Academic level ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description University programme family associated with the level.
             * @example undergrad
             * @enum {string}
             */
            programType: "undergrad" | "postgrad" | "masters" | "doctorate";
            /**
             * @description Study stage. Zero represents the Graduate level.
             * @example 1
             */
            stage: number;
            /**
             * @description Whether the level can be used in new placements and registration.
             * @example active
             * @enum {string}
             */
            status: "active" | "inactive";
        };
        AcademicOverviewDto: {
            /**
             * @description Offerings currently marked active.
             * @example 16
             */
            activeOfferingCount: number;
            /**
             * @description Result groups that are currently approved.
             * @example 8
             */
            approvedCount: number;
            /**
             * @description Mean total mark out of 100 across approved enrollments only, or null when none are approved.
             * @example 67.42
             */
            averageScore: number | null;
            /**
             * @description Offering rosters whose registration is permanently closed.
             * @example 14
             */
            closedRosterCount: number;
            /**
             * @description Result groups returned to the lecturer for correction.
             * @example 1
             */
            correctionRequestedCount: number;
            /**
             * Format: uuid
             * @description Department covered by the report, or null for the whole university.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId: string | null;
            /**
             * @description Course enrollments, including those with unpublished results.
             * @example 120
             */
            enrollmentCount: number;
            /**
             * @description Configured offerings, including inactive and empty offerings.
             * @example 18
             */
            offeringCount: number;
            /**
             * @description Approved enrollments with a grade other than F.
             * @example 85
             */
            passedCount: number;
            /**
             * @description Result groups currently being drafted.
             * @example 3
             */
            pendingCount: number;
            /**
             * @description Enrollments whose grade is currently approved.
             * @example 100
             */
            publishedCount: number;
            /**
             * Format: uuid
             * @description Semester covered by this report.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            semesterId: string;
            /**
             * @description Distinct students with an enrollment in this semester and scope.
             * @example 65
             */
            studentCount: number;
            /**
             * @description Result groups awaiting a decision.
             * @example 2
             */
            submittedCount: number;
        };
        AcademicReferencesResponseDto: {
            /**
             * @description Active departments within active faculties.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "facultyId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "name": "Computing"
             *       }
             *     ]
             */
            departments: components["schemas"]["DepartmentResponseDto"][];
            /**
             * @description Active faculties.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "name": "Faculty of Science"
             *       }
             *     ]
             */
            faculties: components["schemas"]["FacultyResponseDto"][];
            /**
             * @description Available academic levels.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "programType": "undergrad",
             *         "stage": 1,
             *         "displayName": "100 Level",
             *         "selectionLabel": "100 Level",
             *         "isGraduate": false
             *       }
             *     ]
             */
            levels: components["schemas"]["AcademicLevelResponseDto"][];
            /**
             * @description Active programmes within active departments.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "departmentId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "programType": "undergrad",
             *         "name": "Computer Science"
             *       }
             *     ]
             */
            programmes: components["schemas"]["ProgrammeResponseDto"][];
        };
        AcademicReportOptionDto: {
            /**
             * Format: uuid
             * @description Identifier to select in a report.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Display label for the report filter.
             * @example First Semester · 2026/2027
             */
            label: string;
        };
        AcademicReportOptionsDto: {
            /**
             * @description Departments the current staff account can report on.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "label": "Computing"
             *       }
             *     ]
             */
            departments: components["schemas"]["AcademicReportOptionDto"][];
            /**
             * @description Semesters available as report filters.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "label": "First Semester · 2026/2027"
             *       }
             *     ]
             */
            semesters: components["schemas"]["AcademicReportOptionDto"][];
        };
        AcademicSetupResponseDto: {
            /**
             * @description Academic department records available to the administrator.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "facultyId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "name": "Computing",
             *         "status": "active"
             *       }
             *     ]
             */
            departments: components["schemas"]["DepartmentSetupResponseDto"][];
            /**
             * @description Academic faculty records available to the administrator.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "name": "Faculty of Science",
             *         "status": "active",
             *         "currentSemesterId": "0191e192-67ad-746b-9acb-c850234b408a"
             *       }
             *     ]
             */
            faculties: components["schemas"]["FacultySetupResponseDto"][];
            /**
             * @description Shared academic levels, including inactive levels.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "programType": "undergrad",
             *         "stage": 1,
             *         "displayName": "100 Level",
             *         "status": "active"
             *       }
             *     ]
             */
            levels: components["schemas"]["AcademicLevelSetupDto"][];
            /**
             * @description Academic programme records available to the administrator.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "departmentId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "name": "BSc Computer Science",
             *         "programType": "undergrad",
             *         "status": "active"
             *       }
             *     ]
             */
            programmes: components["schemas"]["ProgrammeSetupResponseDto"][];
            /**
             * @description Academic semester records available to the administrator.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "academicSessionId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "termNumber": 1,
             *         "name": "First Semester",
             *         "maxUnits": 24,
             *         "status": "active"
             *       }
             *     ]
             */
            semesters: components["schemas"]["SemesterSetupResponseDto"][];
            /**
             * @description Academic session records available to the administrator.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "startYear": 2026,
             *         "endYear": 2027,
             *         "status": "active"
             *       }
             *     ]
             */
            sessions: components["schemas"]["SessionSetupResponseDto"][];
        };
        AdminAuthorizationGrantResponseDto: {
            /**
             * Format: uuid
             * @description Department where the privileges apply. Null means university-wide.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId: string | null;
            /**
             * Format: uuid
             * @description Role assignment ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Name of the assigned role.
             * @example lecturer
             */
            name: string;
            /**
             * @description Permissions supplied by this role.
             * @example [
             *       "teach_course"
             *     ]
             */
            privileges: ("read_user" | "create_student" | "update_student_placement" | "update_user" | "suspend_user" | "delete_user" | "revoke_user_sessions" | "read_admin" | "create_admin" | "manage_admin_roles" | "read_role" | "manage_roles" | "read_audit" | "manage_university" | "manage_department" | "read_registration" | "register_student_courses" | "teach_course" | "grade_result" | "approve_result" | "review_result" | "reopen_result" | "read_reports")[];
            /**
             * Format: uuid
             * @description Assigned role ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            roleId: string;
            /**
             * @description Stable key for a system role. Null for custom roles.
             * @example lecturer
             * @enum {string|null}
             */
            systemKey: "super_admin" | "hod" | "lecturer" | null;
        };
        AdminAuthorizationResponseDto: {
            /**
             * Format: uuid
             * @description Signed-in administrator profile ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            adminId: string;
            /**
             * @description The administrator’s current role assignments and scopes.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "roleId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "name": "lecturer",
             *         "systemKey": "lecturer",
             *         "departmentId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "privileges": [
             *           "teach_course"
             *         ]
             *       }
             *     ]
             */
            grants: components["schemas"]["AdminAuthorizationGrantResponseDto"][];
        };
        AdminDirectoryGrantResponseDto: {
            /**
             * Format: uuid
             * @description Department where the role applies. Null means university-wide.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId: string | null;
            /**
             * Format: uuid
             * @description Role assignment ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Role linked to the assignment.
             * @example {
             *       "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *       "name": "lecturer",
             *       "description": "Teaches assigned courses.",
             *       "kind": "system",
             *       "systemKey": "lecturer",
             *       "createdByAdminId": null,
             *       "privileges": [
             *         "teach_course"
             *       ],
             *       "createdAt": "2026-11-10T10:30:00.000Z",
             *       "updatedAt": "2026-11-10T10:30:00.000Z"
             *     }
             */
            role: components["schemas"]["RoleResponseDto"];
        };
        AdminDirectoryUserResponseDto: {
            /**
             * Format: email
             * @description Email used to sign in.
             * @example ada.okafor@example.test
             */
            email: string;
            /**
             * @description Given name, if provided.
             * @example Ada
             */
            firstName: string | null;
            /**
             * Format: uuid
             * @description Sign-in account ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Family name, if provided.
             * @example Okafor
             */
            lastName: string | null;
            /**
             * @description Whether the account can sign in.
             * @example active
             * @enum {string}
             */
            status: "active" | "suspended";
        };
        AdminPageResponseDto: {
            /**
             * @description Administrator profiles on the current page.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "userId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "createdAt": "2026-11-10T10:30:00.000Z"
             *       }
             *     ]
             */
            items: components["schemas"]["AdminResponseDto"][];
            /**
             * @description Cursor for the next page. Null means there are no more results.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            nextCursor: string | null;
        };
        AdminResponseDto: {
            /**
             * @description Whether the signed-in administrator may edit this staff member’s names. Returned with the user profile.
             * @example true
             */
            canUpdateProfile?: boolean;
            /**
             * Format: date-time
             * @description When the administrator profile was created.
             * @example 2026-11-10T10:30:00.000Z
             */
            createdAt: string;
            /**
             * Format: uuid
             * @description Administrator profile ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Visible role assignments, when requested.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "departmentId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "role": {
             *           "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *           "name": "lecturer",
             *           "description": "Teaches assigned courses.",
             *           "kind": "system",
             *           "systemKey": "lecturer",
             *           "createdByAdminId": null,
             *           "privileges": [
             *             "teach_course"
             *           ],
             *           "createdAt": "2026-11-10T10:30:00.000Z",
             *           "updatedAt": "2026-11-10T10:30:00.000Z"
             *         }
             *       }
             *     ]
             */
            roles?: components["schemas"]["AdminDirectoryGrantResponseDto"][];
            /**
             * @description Sign-in account, when requested and authorized.
             * @example {
             *       "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *       "email": "ada.okafor@example.test",
             *       "firstName": "Ada",
             *       "lastName": "Okafor",
             *       "status": "active"
             *     }
             */
            user?: components["schemas"]["AdminDirectoryUserResponseDto"];
            /**
             * Format: uuid
             * @description ID of the administrator’s sign-in account.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            userId: string;
        };
        AssignAdminRoleDto: {
            /**
             * Format: uuid
             * @description Department where the assignment applies. Null means university-wide.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId?: string | null;
            /**
             * Format: uuid
             * @description ID of the role to assign.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            roleId: string;
        };
        AuditEventPageResponseDto: {
            /**
             * @description Audit events on the current page.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "action": "user.set_status",
             *         "category": "users",
             *         "actorUserId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "actorAdminId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "targetType": "user",
             *         "targetId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "outcome": "succeeded",
             *         "reason": null,
             *         "changes": {
             *           "status": "suspended"
             *         },
             *         "metadata": null,
             *         "requestId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "traceId": null,
             *         "occurredAt": "2026-11-10T10:30:00.000Z"
             *       }
             *     ]
             */
            items: components["schemas"]["AuditEventResponseDto"][];
            /**
             * @description Cursor for the next page. Null means there are no more results.
             * @example MjAyNi0xMS0xMFQxMDozMDowMC4wMDAwMDBaLzAxOTFlMTkyLTY3YWQtNzQ2Yi05YWNiLWM4NTAyMzRiNDA4YQ
             */
            nextCursor: string | null;
        };
        AuditEventResponseDto: {
            /**
             * @description Action the administrator attempted.
             * @example user.set_status
             */
            action: string;
            /**
             * Format: uuid
             * @description ID of the administrator profile that made the request, when known.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            actorAdminId: string | null;
            /**
             * Format: uuid
             * @description ID of the account that made the request, when known.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            actorUserId: string | null;
            /**
             * @description Group used to filter events.
             * @example users
             * @enum {string}
             */
            category: "access" | "users" | "academic" | "results" | "operations";
            /**
             * @description Safe changes recorded for the action.
             * @example {
             *       "status": "suspended"
             *     }
             */
            changes: Record<string, never> | null;
            /**
             * Format: uuid
             * @description Audit event ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Additional safe context, when recorded.
             * @example {
             *       "departmentId": "0191e192-67ad-746b-9acb-c850234b408a"
             *     }
             */
            metadata: Record<string, never> | null;
            /**
             * Format: date-time
             * @description When the attempt occurred.
             * @example 2026-11-10T10:30:00.000Z
             */
            occurredAt: string;
            /**
             * @description Result of the attempt.
             * @example succeeded
             * @enum {string}
             */
            outcome: "succeeded" | "failed" | "denied";
            /**
             * @description Short reason code, if recorded.
             * @example forbidden
             */
            reason: string | null;
            /**
             * @description ID used to find the associated request in logs.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            requestId: string | null;
            /**
             * Format: uuid
             * @description ID of the affected resource, when known.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            targetId: string | null;
            /**
             * @description Kind of resource affected.
             * @example user
             */
            targetType: string;
            /**
             * @description ID used to find the associated trace.
             * @example 5e45e09177a37c66e0860a404f3a191f
             */
            traceId: string | null;
        };
        AvailableCourseDto: {
            /**
             * @description Canonical course code.
             * @example CSC101
             */
            code: string;
            /**
             * Format: uuid
             * @description University catalog course.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            courseId: string;
            /**
             * @description Title of the course.
             * @example Introduction to Computing
             */
            name: string;
            /**
             * Format: uuid
             * @description Department-owned delivery of the course.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            offeringId: string;
            /**
             * @description Credit units assigned to this course.
             * @example 3
             */
            units: number;
        };
        AvailableCoursesResponseDto: {
            /**
             * @description Eligible courses with open rosters.
             * @example [
             *       {
             *         "offeringId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "courseId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "code": "CSC101",
             *         "name": "Introduction to Computing",
             *         "units": 3
             *       }
             *     ]
             */
            courses: components["schemas"]["AvailableCourseDto"][];
            /**
             * @description Maximum total credit units a student can register in the semester.
             * @example 24
             */
            maxUnits: number;
            /**
             * @description Credit units already registered in this semester.
             * @example 0
             */
            registeredUnits: number;
            /**
             * Format: uuid
             * @description Semester used for course registration.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            semesterId: string;
        };
        CoursePerformanceDto: {
            /**
             * @description Display name of the study level for this offering.
             * @example 100 Level
             */
            academicLevel: string;
            /**
             * @description Mean total mark out of 100 across approved enrollments only, or null when none are approved.
             * @example 67.42
             */
            averageScore: number | null;
            /**
             * @description University catalog course code.
             * @example CSC101
             */
            code: string;
            /**
             * @description Name of the department that owns the offering.
             * @example Computing
             */
            department: string;
            /**
             * Format: uuid
             * @description Department that owns this offering.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId: string;
            /**
             * @description Course enrollments, including those with unpublished results.
             * @example 120
             */
            enrollmentCount: number;
            /**
             * @description University catalog course title.
             * @example Introduction to Computing
             */
            name: string;
            /**
             * Format: uuid
             * @description Course offering ID. Distinct departments have distinct offerings.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            offeringId: string;
            /**
             * @description Whether this delivery is active.
             * @example active
             * @enum {string}
             */
            offeringStatus: "active" | "inactive";
            /**
             * @description Approved enrollments with a grade other than F.
             * @example 85
             */
            passedCount: number;
            /**
             * @description Enrollments whose grade is currently approved.
             * @example 100
             */
            publishedCount: number;
            /**
             * @description Roster registration state, or null if no roster has been created.
             * @example closed
             * @enum {string|null}
             */
            registrationStatus: "opened" | "closed" | null;
            /**
             * @description Current result group state, or null if no group has been created.
             * @example approved
             * @enum {string|null}
             */
            resultStatus: "pending" | "submitted" | "correction_requested" | "approved" | null;
        };
        CoursePerformancePageDto: {
            /**
             * @description Course offering performance for the selected scope, ordered by offering ID.
             * @example [
             *       {
             *         "offeringId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "departmentId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "department": "Computing",
             *         "code": "CSC101",
             *         "name": "Introduction to Computing",
             *         "academicLevel": "100 Level",
             *         "offeringStatus": "active",
             *         "registrationStatus": "closed",
             *         "resultStatus": "approved",
             *         "enrollmentCount": 30,
             *         "publishedCount": 30,
             *         "passedCount": 25,
             *         "averageScore": 67.42
             *       }
             *     ]
             */
            items: components["schemas"]["CoursePerformanceDto"][];
            /**
             * Format: uuid
             * @description Cursor to send on the next request, or null on the last page.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            nextCursor: string | null;
        };
        CourseResponseDto: {
            /**
             * @description Canonical course code.
             * @example CSC101
             */
            code: string;
            /**
             * Format: uuid
             * @description Identifier of the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Title of the course.
             * @example Introduction to Computing
             */
            name: string;
            /**
             * @description Whether this record can be used in current academic operations.
             * @example active
             * @enum {string}
             */
            status: "active" | "inactive";
            /**
             * @description Credit units assigned to this course.
             * @example 3
             */
            units: number;
        };
        CourseSetupResponseDto: {
            /**
             * @description University catalog courses.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "code": "CSC101",
             *         "name": "Introduction to Computing",
             *         "units": 3,
             *         "status": "active"
             *       }
             *     ]
             */
            courses: components["schemas"]["CourseResponseDto"][];
            /**
             * @description Programme links in the administrator’s scope.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "courseOfStudyId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "courseId": "0191e192-67ad-746b-9acb-c850234b408a"
             *       }
             *     ]
             */
            curriculum: components["schemas"]["CurriculumResponseDto"][];
            /**
             * @description Course offerings in the administrator’s scope.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "courseId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "departmentId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "semesterId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "academicLevelId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "lecturerId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "units": 3,
             *         "gradingPolicyId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "status": "active"
             *       }
             *     ]
             */
            offerings: components["schemas"]["OfferingResponseDto"][];
        };
        CourseWriteDto: {
            /**
             * @description Canonical course code.
             * @example CSC101
             */
            code: string;
            /**
             * @description Title of the course.
             * @example Introduction to Computing
             */
            name: string;
            /**
             * @description Whether this record can be used in current academic operations.
             * @example active
             * @enum {string}
             */
            status?: "active" | "inactive";
            /**
             * @description Credit units assigned to this course.
             * @example 3
             */
            units: number;
        };
        CreateAdminDto: {
            /**
             * Format: uuid
             * @description Department where the assignment applies. Null means university-wide.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId?: string | null;
            /**
             * Format: email
             * @description Email used to sign in.
             * @example ada.okafor@example.test
             */
            email: string;
            /**
             * @description Given name, if provided.
             * @example Ada
             */
            firstName?: string | null;
            /**
             * @description Family name, if provided.
             * @example Okafor
             */
            lastName?: string | null;
            /**
             * Format: password
             * @description Password used to sign in.
             * @example Example-only-password!
             */
            password: string;
            /**
             * Format: uuid
             * @description ID of the role to assign. An HOD can omit this to provision a lecturer in their department.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            roleId?: string;
        };
        CreatedAdminResponseDto: {
            /**
             * @description Initial role assignment, if requested.
             * @example {
             *       "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *       "adminId": "0191e192-67ad-746b-9acb-c850234b408a",
             *       "roleId": "0191e192-67ad-746b-9acb-c850234b408a",
             *       "departmentId": "0191e192-67ad-746b-9acb-c850234b408a",
             *       "name": "lecturer"
             *     }
             */
            grant?: components["schemas"]["RoleAssignmentResponseDto"];
            /**
             * Format: uuid
             * @description New administrator profile ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * Format: uuid
             * @description ID of the administrator’s sign-in account.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            userId: string;
        };
        CreateStudentDto: {
            /**
             * Format: uuid
             * @description Student’s current academic level.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            academicLevelId?: string | null;
            /**
             * Format: uuid
             * @description Student’s programme of study.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            courseOfStudyId?: string | null;
            /**
             * Format: uuid
             * @description Student’s department. It can be inferred from the programme.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId?: string | null;
            /**
             * Format: email
             * @description Email used to sign in.
             * @example ada.okafor@example.test
             */
            email: string;
            /**
             * Format: uuid
             * @description Student’s faculty. It can be inferred from the department.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            facultyId?: string | null;
            /**
             * @description Given name, if provided.
             * @example Ada
             */
            firstName?: string | null;
            /**
             * @description Family name, if provided.
             * @example Okafor
             */
            lastName?: string | null;
            /**
             * Format: password
             * @description Password used to sign in.
             * @example Example-only-password!
             */
            password: string;
        };
        CurriculumResponseDto: {
            /**
             * Format: uuid
             * @description University catalog course.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            courseId: string;
            /**
             * Format: uuid
             * @description Programme that includes the course.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            courseOfStudyId: string;
            /**
             * Format: uuid
             * @description Identifier of the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
        };
        CurriculumWriteDto: {
            /**
             * Format: uuid
             * @description University catalog course.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            courseId: string;
            /**
             * Format: uuid
             * @description Programme that includes the course.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            courseOfStudyId: string;
        };
        DepartmentResponseDto: {
            /**
             * Format: uuid
             * @description ID of the faculty that owns this department.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            facultyId: string;
            /**
             * Format: uuid
             * @description Department ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Department name.
             * @example Computing
             */
            name: string;
        };
        DepartmentSetupResponseDto: {
            /**
             * Format: uuid
             * @description Faculty that owns the department.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            facultyId: string;
            /**
             * Format: uuid
             * @description Identifier of the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Department name.
             * @example Computing
             */
            name: string;
            /**
             * @description Whether this record can be used in current academic operations.
             * @example active
             * @enum {string}
             */
            status: "active" | "inactive";
        };
        DepartmentWriteDto: {
            /**
             * Format: uuid
             * @description Faculty that owns the department.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            facultyId: string;
            /**
             * @description Department name.
             * @example Computing
             */
            name: string;
            /**
             * @description Whether this record can be used in current academic operations.
             * @example active
             * @enum {string}
             */
            status?: "active" | "inactive";
        };
        ErrorResponseDto: {
            /**
             * @description Validation messages for the submitted values.
             * @example [
             *       "Enter a valid email address.",
             *       "Choose either student or admin as the account type."
             *     ]
             */
            errors?: string[];
            /**
             * @description Explanation of what happened and how to proceed.
             * @example Enter a valid email address.
             */
            message: string;
            /**
             * Format: uuid
             * @description Request ID to include when asking for support.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            requestId?: string;
            /**
             * @description HTTP status code for the failed request.
             * @example 400
             */
            statusCode: number;
            /**
             * @description Trace ID, when tracing is enabled.
             * @example 5e45e09177a37c66e0860a404f3a191f
             */
            traceId?: string;
        };
        FacultyResponseDto: {
            /**
             * Format: uuid
             * @description Faculty ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Faculty name.
             * @example Faculty of Science
             */
            name: string;
        };
        FacultySetupResponseDto: {
            /**
             * Format: uuid
             * @description Semester currently open for the faculty, or null.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            currentSemesterId: string | null;
            /**
             * Format: uuid
             * @description Identifier of the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Faculty name.
             * @example Faculty of Science
             */
            name: string;
            /**
             * @description Whether this record can be used in current academic operations.
             * @example active
             * @enum {string}
             */
            status: "active" | "inactive";
        };
        FacultyWriteDto: {
            /**
             * @description Faculty name.
             * @example Faculty of Science
             */
            name: string;
            /**
             * @description Whether this record can be used in current academic operations.
             * @example active
             * @enum {string}
             */
            status?: "active" | "inactive";
        };
        LecturerChoiceResponseDto: {
            /**
             * @description Lecturer’s given name.
             * @example Ada
             */
            firstName: string | null;
            /**
             * Format: uuid
             * @description Identifier of the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Lecturer’s family name.
             * @example Okafor
             */
            lastName: string | null;
        };
        LecturerChoicesResponseDto: {
            /**
             * @description Administrators with teaching authority in the selected department.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "firstName": "Ada",
             *         "lastName": "Okafor"
             *       }
             *     ]
             */
            lecturers: components["schemas"]["LecturerChoiceResponseDto"][];
        };
        OfferingResponseDto: {
            /**
             * Format: uuid
             * @description Academic level eligible for this offering.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            academicLevelId: string;
            /**
             * Format: uuid
             * @description University catalog course.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            courseId: string;
            /**
             * Format: uuid
             * @description Department that owns the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId: string;
            /**
             * Format: uuid
             * @description Grading policy pinned to this offering.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            gradingPolicyId: string;
            /**
             * Format: uuid
             * @description Identifier of the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * Format: uuid
             * @description Administrator assigned to teach the offering.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            lecturerId: string | null;
            /**
             * Format: uuid
             * @description Semester used for course registration.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            semesterId: string;
            /**
             * @description Whether this record can be used in current academic operations.
             * @example active
             * @enum {string}
             */
            status: "active" | "inactive";
            /**
             * @description Credit units assigned to this course.
             * @example 3
             */
            units: number;
        };
        OfferingUpdateDto: {
            /**
             * Format: uuid
             * @description Administrator assigned to teach the offering.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            lecturerId?: string | null;
            /**
             * @description Whether this record can be used in current academic operations.
             * @example active
             * @enum {string}
             */
            status?: "active" | "inactive";
        };
        OfferingWriteDto: {
            /**
             * Format: uuid
             * @description Academic level eligible for this offering.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            academicLevelId: string;
            /**
             * Format: uuid
             * @description University catalog course.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            courseId: string;
            /**
             * Format: uuid
             * @description Department that owns the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId: string;
            /**
             * Format: uuid
             * @description Administrator assigned to teach the offering.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            lecturerId?: string | null;
            /**
             * Format: uuid
             * @description Semester used for course registration.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            semesterId: string;
            /**
             * @description Whether this record can be used in current academic operations.
             * @example active
             * @enum {string}
             */
            status?: "active" | "inactive";
        };
        PlacementDto: {
            /**
             * Format: uuid
             * @description Student’s current academic level.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            academicLevelId?: string | null;
            /**
             * Format: uuid
             * @description Student’s programme of study.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            courseOfStudyId?: string | null;
            /**
             * Format: uuid
             * @description Student’s department. It can be inferred from the programme.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId?: string | null;
            /**
             * Format: uuid
             * @description Student’s faculty. It can be inferred from the department.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            facultyId?: string | null;
        };
        ProfileDto: {
            /**
             * @description Given name, if provided.
             * @example Ada
             */
            firstName?: string | null;
            /**
             * @description Family name, if provided.
             * @example Okafor
             */
            lastName?: string | null;
        };
        ProgrammeResponseDto: {
            /**
             * Format: uuid
             * @description ID of the department offering this programme.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId: string;
            /**
             * Format: uuid
             * @description Programme ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Programme name.
             * @example Computer Science
             */
            name: string;
            /**
             * @description University programme type.
             * @example undergrad
             * @enum {string}
             */
            programType: "undergrad" | "postgrad" | "masters" | "doctorate";
        };
        ProgrammeSetupResponseDto: {
            /**
             * Format: uuid
             * @description Department that owns the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId: string;
            /**
             * Format: uuid
             * @description Identifier of the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Programme name.
             * @example BSc Computer Science
             */
            name: string;
            /**
             * @description University programme family.
             * @example undergrad
             * @enum {string}
             */
            programType: "undergrad" | "postgrad" | "masters" | "doctorate";
            /**
             * @description Whether this record can be used in current academic operations.
             * @example active
             * @enum {string}
             */
            status: "active" | "inactive";
        };
        ProgrammeWriteDto: {
            /**
             * Format: uuid
             * @description Department that owns the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId: string;
            /**
             * @description Programme name.
             * @example BSc Computer Science
             */
            name: string;
            /**
             * @description University programme family.
             * @example undergrad
             * @enum {string}
             */
            programType: "undergrad" | "postgrad" | "masters" | "doctorate";
            /**
             * @description Whether this record can be used in current academic operations.
             * @example active
             * @enum {string}
             */
            status?: "active" | "inactive";
        };
        PublishedCourseResultDto: {
            /**
             * Format: date-time
             * @description Time of the approval that published this result.
             * @example 2026-11-10T10:30:00.000Z
             */
            approvedAt: string;
            /**
             * @description Continuous assessment mark.
             * @example 24.5
             */
            caScore: number;
            /**
             * @description University catalog course code.
             * @example CSC101
             */
            code: string;
            /**
             * @description Examination mark.
             * @example 49.25
             */
            examScore: number;
            /**
             * @description Letter grade on the offering’s grading scale.
             * @example A
             * @enum {string}
             */
            grade: "A" | "B" | "C" | "D" | "E" | "F";
            /**
             * @description Grade points per credit unit.
             * @example 5
             */
            gradePoint: number;
            /**
             * Format: uuid
             * @description Published course enrollment ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Course title.
             * @example Introduction to Computing
             */
            name: string;
            /**
             * @description Combined CA and examination mark.
             * @example 73.75
             */
            totalScore: number;
            /**
             * @description Credit units recorded at registration.
             * @example 3
             */
            units: number;
        };
        RefreshDto: {
            /**
             * @description Refresh token from the current session.
             * @example eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJleGFtcGxlIn0.example-signature
             */
            refreshToken: string;
        };
        RegisteredCourseDto: {
            /**
             * @description Canonical course code.
             * @example CSC101
             */
            code: string;
            /**
             * Format: uuid
             * @description University catalog course.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            courseId: string;
            /**
             * Format: uuid
             * @description Identifier of the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Title of the course.
             * @example Introduction to Computing
             */
            name: string;
            /**
             * Format: uuid
             * @description Department-owned delivery of the course.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            offeringId: string;
            /**
             * Format: uuid
             * @description Roster created for the offering.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            resultGroupId: string;
            /**
             * @description Credit units assigned to this course.
             * @example 3
             */
            units: number;
        };
        RegisteredTermDto: {
            /**
             * @description Academic level saved in the semester record.
             * @example 100 Level
             */
            academicLevel: string;
            /**
             * @description Academic session label.
             * @example 2026/2027
             */
            academicSession: string;
            /**
             * @description Department saved in the semester record.
             * @example Computing
             */
            department: string;
            /**
             * @description Faculty saved in the semester record.
             * @example Faculty of Science
             */
            faculty: string;
            /**
             * Format: uuid
             * @description Identifier of the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Programme saved in the semester record.
             * @example BSc Computer Science
             */
            programme: string;
            /**
             * Format: uuid
             * @description Semester used for course registration.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            semesterId: string;
            /**
             * @description Name of the semester.
             * @example First Semester
             */
            semesterName: string;
            /**
             * @description Total credit units registered in this term.
             * @example 3
             */
            totalUnits: number;
        };
        RegisteredTermsResponseDto: {
            /**
             * @description Semesters in which the student has a saved registration.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "semesterId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "semesterName": "First Semester",
             *         "academicSession": "2026/2027",
             *         "faculty": "Faculty of Science",
             *         "department": "Computing",
             *         "programme": "BSc Computer Science",
             *         "academicLevel": "100 Level",
             *         "totalUnits": 3
             *       }
             *     ]
             */
            terms: components["schemas"]["RegisteredTermDto"][];
        };
        RegistrationRosterResponseDto: {
            /**
             * @description Enrollments visible in this roster or report.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "offeringId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "courseId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "code": "CSC101",
             *         "name": "Introduction to Computing",
             *         "units": 3,
             *         "resultGroupId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "studentId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "firstName": "Ada",
             *         "lastName": "Okafor",
             *         "matricNumber": "26/1/2/3/42"
             *       }
             *     ]
             */
            items: components["schemas"]["RosterStudentResponseDto"][];
            /**
             * Format: uuid
             * @description Cursor for the next page, or null at the end.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            nextCursor: string | null;
        };
        RegistrationSummaryResponseDto: {
            /**
             * @description Academic level saved in the semester record.
             * @example 100 Level
             */
            academicLevel: string;
            /**
             * @description Academic session label.
             * @example 2026/2027
             */
            academicSession: string;
            /**
             * @description The student’s confirmed courses.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "offeringId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "courseId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "code": "CSC101",
             *         "name": "Introduction to Computing",
             *         "units": 3,
             *         "resultGroupId": "0191e192-67ad-746b-9acb-c850234b408a"
             *       }
             *     ]
             */
            courses: components["schemas"]["RegisteredCourseDto"][];
            /**
             * @description Department saved in the semester record.
             * @example Computing
             */
            department: string;
            /**
             * @description Faculty saved in the semester record.
             * @example Faculty of Science
             */
            faculty: string;
            /**
             * @description Student’s given name, if available.
             * @example Ada
             */
            firstName: string | null;
            /**
             * Format: uuid
             * @description Identifier of the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Student’s family name, if available.
             * @example Okafor
             */
            lastName: string | null;
            /**
             * @description The student’s issued matriculation number, if available.
             * @example 26/1/2/3/42
             */
            matricNumber: string | null;
            /**
             * @description Programme saved in the semester record.
             * @example BSc Computer Science
             */
            programme: string;
            /**
             * Format: uuid
             * @description Semester used for course registration.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            semesterId: string;
            /**
             * @description Name of the semester.
             * @example First Semester
             */
            semesterName: string;
            /**
             * @description Total credit units registered in this term.
             * @example 3
             */
            totalUnits: number;
        };
        RegistrationWriteDto: {
            /**
             * @description Unique offering IDs selected for this semester.
             * @example [
             *       "0191e192-67ad-746b-9acb-c850234b408a"
             *     ]
             */
            offeringIds: string[];
            /**
             * Format: uuid
             * @description Semester used for course registration.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            semesterId: string;
        };
        ReopenResultDto: {
            /**
             * @description Reason code retained in the audit trail when a result is reopened.
             * @example mark_correction
             * @enum {string}
             */
            reason: "mark_correction" | "review_error" | "administrative_request";
        };
        RequestResultCorrectionsDto: {
            /**
             * @description Feedback the lecturer sees before resubmitting.
             * @example Check the exam marks against the attendance sheet.
             */
            reason: string;
        };
        ResultDecisionNoteDto: {
            /**
             * @description Optional staff note on the submission or approval.
             * @example Marks verified against the course records.
             */
            note?: string | null;
        };
        ResultGroupDetailDto: {
            /**
             * @description Optional note on the latest approval.
             * @example Department review completed.
             */
            approvalReason: string | null;
            /**
             * Format: date-time
             * @description Time of the latest approval, when available.
             * @example 2026-11-10T10:30:00.000Z
             */
            approvedAt: string | null;
            /**
             * @description Mean total for enrollments with both marks, when available.
             * @example 73.5
             */
            averageScore: number | null;
            /**
             * @description University catalog course code.
             * @example CSC101
             */
            code: string;
            /**
             * Format: date-time
             * @description Time of the latest request for corrections.
             * @example 2026-11-10T10:30:00.000Z
             */
            correctionRequestedAt: string | null;
            /**
             * @description Feedback from the latest request for corrections.
             * @example Check the exam marks against the attendance sheet.
             */
            correctionRequestReason: string | null;
            /**
             * Format: uuid
             * @description Department responsible for these results.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId: string;
            /**
             * @description Number of students registered in the roster.
             * @example 26
             */
            enrolledCount: number;
            /**
             * Format: uuid
             * @description Result group ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * Format: uuid
             * @description Administrator assigned to teach this offering.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            lecturerId: string;
            /**
             * @description Number of enrollments with both marks entered.
             * @example 26
             */
            markedCount: number;
            /**
             * @description Paged enrollment marks and grade previews.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "studentId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "firstName": "Ada",
             *         "lastName": "Okafor",
             *         "matricNumber": "26/1/2/3/42",
             *         "caScore": 24.5,
             *         "examScore": 49.25,
             *         "totalScore": 73.75,
             *         "grade": "A",
             *         "gradePoint": 5
             *       }
             *     ]
             */
            marks: components["schemas"]["ResultMarkResponseDto"][];
            /**
             * @description Maximum CA mark under the offering’s grading policy.
             * @example 30
             */
            maxCaScore: number;
            /**
             * @description Maximum exam mark under the offering’s grading policy.
             * @example 70
             */
            maxExamScore: number;
            /**
             * @description Course title.
             * @example Introduction to Computing
             */
            name: string;
            /**
             * Format: uuid
             * @description Cursor for the next page, or null at the end.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            nextCursor: string | null;
            /**
             * Format: uuid
             * @description Department-owned course offering ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            offeringId: string;
            /**
             * @description Whether the roster accepts enrollment.
             * @example closed
             * @enum {string}
             */
            registrationStatus: "opened" | "closed";
            /**
             * Format: uuid
             * @description Semester of this course offering.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            semesterId: string;
            /**
             * @description Current result review state.
             * @example submitted
             * @enum {string}
             */
            status: "pending" | "submitted" | "correction_requested" | "approved";
            /**
             * @description Optional note on the latest submission.
             * @example All marks checked.
             */
            submissionReason: string | null;
            /**
             * Format: date-time
             * @description Time of the latest submission, when available.
             * @example 2026-11-10T10:30:00.000Z
             */
            submittedAt: string | null;
        };
        ResultGroupPageDto: {
            /**
             * @description Result groups visible in this role and scope.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "offeringId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "departmentId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "semesterId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "lecturerId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "code": "CSC101",
             *         "name": "Introduction to Computing",
             *         "status": "submitted",
             *         "registrationStatus": "closed",
             *         "submittedAt": "2026-11-10T10:30:00.000Z",
             *         "approvedAt": "2026-11-10T10:30:00.000Z",
             *         "correctionRequestedAt": "2026-11-10T10:30:00.000Z",
             *         "maxCaScore": 30,
             *         "maxExamScore": 70,
             *         "enrolledCount": 26,
             *         "markedCount": 26,
             *         "averageScore": 73.5
             *       }
             *     ]
             */
            items: components["schemas"]["ResultGroupSummaryDto"][];
            /**
             * Format: uuid
             * @description Cursor for the next page, or null at the end.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            nextCursor: string | null;
        };
        ResultGroupSummaryDto: {
            /**
             * Format: date-time
             * @description Time of the latest approval, when available.
             * @example 2026-11-10T10:30:00.000Z
             */
            approvedAt: string | null;
            /**
             * @description Mean total for enrollments with both marks, when available.
             * @example 73.5
             */
            averageScore: number | null;
            /**
             * @description University catalog course code.
             * @example CSC101
             */
            code: string;
            /**
             * Format: date-time
             * @description Time of the latest request for corrections.
             * @example 2026-11-10T10:30:00.000Z
             */
            correctionRequestedAt: string | null;
            /**
             * Format: uuid
             * @description Department responsible for these results.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId: string;
            /**
             * @description Number of students registered in the roster.
             * @example 26
             */
            enrolledCount: number;
            /**
             * Format: uuid
             * @description Result group ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * Format: uuid
             * @description Administrator assigned to teach this offering.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            lecturerId: string;
            /**
             * @description Number of enrollments with both marks entered.
             * @example 26
             */
            markedCount: number;
            /**
             * @description Maximum CA mark under the offering’s grading policy.
             * @example 30
             */
            maxCaScore: number;
            /**
             * @description Maximum exam mark under the offering’s grading policy.
             * @example 70
             */
            maxExamScore: number;
            /**
             * @description Course title.
             * @example Introduction to Computing
             */
            name: string;
            /**
             * Format: uuid
             * @description Department-owned course offering ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            offeringId: string;
            /**
             * @description Whether the roster accepts enrollment.
             * @example closed
             * @enum {string}
             */
            registrationStatus: "opened" | "closed";
            /**
             * Format: uuid
             * @description Semester of this course offering.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            semesterId: string;
            /**
             * @description Current result review state.
             * @example submitted
             * @enum {string}
             */
            status: "pending" | "submitted" | "correction_requested" | "approved";
            /**
             * Format: date-time
             * @description Time of the latest submission, when available.
             * @example 2026-11-10T10:30:00.000Z
             */
            submittedAt: string | null;
        };
        ResultMarkInputDto: {
            /**
             * @description CA mark within the offering’s policy limit. Omit to keep the existing value or send null to clear it.
             * @example 24.5
             */
            caScore?: number | null;
            /**
             * Format: uuid
             * @description Enrollment on this result group’s roster.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            enrollmentId: string;
            /**
             * @description Exam mark within the offering’s policy limit. Omit to keep the existing value or send null to clear it.
             * @example 49.25
             */
            examScore?: number | null;
        };
        ResultMarkResponseDto: {
            /**
             * @description Continuous assessment mark.
             * @example 24.5
             */
            caScore: number | null;
            /**
             * @description Examination mark.
             * @example 49.25
             */
            examScore: number | null;
            /**
             * @description Student’s given name, when available.
             * @example Ada
             */
            firstName: string | null;
            /**
             * @description Letter grade on the offering’s grading scale.
             * @example A
             * @enum {string|null}
             */
            grade: "A" | "B" | "C" | "D" | "E" | "F" | null;
            /**
             * @description Grade points per credit unit.
             * @example 5
             */
            gradePoint: number | null;
            /**
             * Format: uuid
             * @description Enrollment ID used to save marks.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Student’s family name, when available.
             * @example Okafor
             */
            lastName: string | null;
            /**
             * @description Student’s matriculation number, when available.
             * @example 26/1/2/3/42
             */
            matricNumber: string | null;
            /**
             * Format: uuid
             * @description Internal student profile ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            studentId: string;
            /**
             * @description Combined CA and examination mark.
             * @example 73.75
             */
            totalScore: number | null;
        };
        ResultReviewDepartmentDto: {
            /**
             * Format: uuid
             * @description Department whose results this administrator may review.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Department name, including inactive departments with retained history.
             * @example Computer Science
             */
            name: string;
        };
        ResultReviewOptionsDto: {
            /**
             * @description Departments covered by a review, approval, or reopening privilege. Includes inactive departments.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "name": "Computer Science"
             *       }
             *     ]
             */
            departments: components["schemas"]["ResultReviewDepartmentDto"][];
        };
        ResultStateResponseDto: {
            /**
             * @description Optional note on the latest approval.
             * @example Department review completed.
             */
            approvalReason: string | null;
            /**
             * Format: date-time
             * @description Time of the latest approval, when available.
             * @example 2026-11-10T10:30:00.000Z
             */
            approvedAt: string | null;
            /**
             * Format: date-time
             * @description Time of the latest request for corrections.
             * @example 2026-11-10T10:30:00.000Z
             */
            correctionRequestedAt: string | null;
            /**
             * @description Feedback from the latest request for corrections.
             * @example Check the exam marks against the attendance sheet.
             */
            correctionRequestReason: string | null;
            /**
             * Format: uuid
             * @description Department responsible for these results.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId: string;
            /**
             * Format: uuid
             * @description Result group ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * Format: uuid
             * @description Department-owned course offering ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            offeringId: string;
            /**
             * @description Whether the roster accepts enrollment.
             * @example closed
             * @enum {string}
             */
            registrationStatus: "opened" | "closed";
            /**
             * @description Current result review state.
             * @example submitted
             * @enum {string}
             */
            status: "pending" | "submitted" | "correction_requested" | "approved";
            /**
             * @description Optional note on the latest submission.
             * @example All marks checked.
             */
            submissionReason: string | null;
            /**
             * Format: date-time
             * @description Time of the latest submission, when available.
             * @example 2026-11-10T10:30:00.000Z
             */
            submittedAt: string | null;
        };
        RoleAssignmentResponseDto: {
            /**
             * Format: uuid
             * @description Administrator who received the role.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            adminId: string;
            /**
             * Format: uuid
             * @description Department where the role applies. Null means university-wide.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId: string | null;
            /**
             * Format: uuid
             * @description Role assignment ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Name of the assigned role.
             * @example lecturer
             */
            name: string;
            /**
             * Format: uuid
             * @description Assigned role ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            roleId: string;
        };
        RolePageResponseDto: {
            /**
             * @description Roles on the current page.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "name": "lecturer",
             *         "description": "Teaches assigned courses.",
             *         "kind": "system",
             *         "systemKey": "lecturer",
             *         "createdByAdminId": null,
             *         "privileges": [
             *           "teach_course"
             *         ],
             *         "createdAt": "2026-11-10T10:30:00.000Z",
             *         "updatedAt": "2026-11-10T10:30:00.000Z"
             *       }
             *     ]
             */
            items: components["schemas"]["RoleResponseDto"][];
            /**
             * @description Cursor for the next page. Null means there are no more results.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            nextCursor: string | null;
        };
        RoleResponseDto: {
            /**
             * Format: date-time
             * @description When the role was created.
             * @example 2026-11-10T10:30:00.000Z
             */
            createdAt: string;
            /**
             * Format: uuid
             * @description ID of the admin who created the role, if known.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            createdByAdminId: string | null;
            /**
             * @description Purpose of the role, when provided.
             * @example Teaches assigned courses.
             */
            description: string | null;
            /**
             * Format: uuid
             * @description Role ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Whether the role is a protected system role or a custom role.
             * @example system
             * @enum {string}
             */
            kind: "custom" | "system";
            /**
             * @description Unique role name.
             * @example lecturer
             */
            name: string;
            /**
             * @description Permissions supplied by this role.
             * @example [
             *       "teach_course"
             *     ]
             */
            privileges: ("read_user" | "create_student" | "update_student_placement" | "update_user" | "suspend_user" | "delete_user" | "revoke_user_sessions" | "read_admin" | "create_admin" | "manage_admin_roles" | "read_role" | "manage_roles" | "read_audit" | "manage_university" | "manage_department" | "read_registration" | "register_student_courses" | "teach_course" | "grade_result" | "approve_result" | "review_result" | "reopen_result" | "read_reports")[];
            /**
             * @description Stable key for a system role. Null for custom roles.
             * @example lecturer
             * @enum {string|null}
             */
            systemKey: "super_admin" | "hod" | "lecturer" | null;
            /**
             * Format: date-time
             * @description When the role was last changed.
             * @example 2026-11-10T10:30:00.000Z
             */
            updatedAt: string;
        };
        RosterClosureResponseDto: {
            /**
             * Format: date-time
             * @description Time the lecturer closed the roster.
             * @example 2026-11-10T10:30:00.000Z
             */
            closedAt: string;
            /**
             * Format: uuid
             * @description Identifier of the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * Format: uuid
             * @description Offering whose roster is closed.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            offeringId: string;
        };
        RosterStudentResponseDto: {
            /**
             * @description Canonical course code.
             * @example CSC101
             */
            code: string;
            /**
             * Format: uuid
             * @description University catalog course.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            courseId: string;
            /**
             * @description Given name if still available.
             * @example Ada
             */
            firstName: string | null;
            /**
             * Format: uuid
             * @description Identifier of the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Family name if still available.
             * @example Okafor
             */
            lastName: string | null;
            /**
             * @description Issued matriculation number if still available.
             * @example 26/1/2/3/42
             */
            matricNumber: string | null;
            /**
             * @description Title of the course.
             * @example Introduction to Computing
             */
            name: string;
            /**
             * Format: uuid
             * @description Department-owned delivery of the course.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            offeringId: string;
            /**
             * Format: uuid
             * @description Roster created for the offering.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            resultGroupId: string;
            /**
             * Format: uuid
             * @description Internal student profile ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            studentId: string;
            /**
             * @description Credit units assigned to this course.
             * @example 3
             */
            units: number;
        };
        SaveMarksResponseDto: {
            /**
             * @description Number of enrollments whose marks changed.
             * @example 2
             */
            changedCount: number;
            /**
             * Format: uuid
             * @description Result group whose marks were saved.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
        };
        SaveResultMarksDto: {
            /**
             * @description Enrollment marks to save together. Each enrollment can appear once.
             * @example [
             *       {
             *         "enrollmentId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "caScore": 24.5,
             *         "examScore": 49.25
             *       }
             *     ]
             */
            marks: components["schemas"]["ResultMarkInputDto"][];
        };
        SemesterSetupResponseDto: {
            /**
             * Format: uuid
             * @description Academic session that contains this semester.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            academicSessionId: string;
            /**
             * Format: uuid
             * @description Identifier of the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Maximum total credit units a student can register in the semester.
             * @example 24
             */
            maxUnits: number;
            /**
             * @description Semester name.
             * @example First Semester
             */
            name: string;
            /**
             * @description Whether this record can be used in current academic operations.
             * @example active
             * @enum {string}
             */
            status: "active" | "inactive";
            /**
             * @description Sequence of the term in the academic session.
             * @example 1
             */
            termNumber: number;
        };
        SemesterWriteDto: {
            /**
             * Format: uuid
             * @description Academic session that contains this semester.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            academicSessionId: string;
            /**
             * @description Maximum total credit units a student can register in the semester.
             * @example 24
             */
            maxUnits: number;
            /**
             * @description Semester name.
             * @example First Semester
             */
            name: string;
            /**
             * @description Whether this record can be used in current academic operations.
             * @example active
             * @enum {string}
             */
            status?: "active" | "inactive";
            /**
             * @description Sequence of the term in the academic session.
             * @example 1
             */
            termNumber: number;
        };
        SessionResponseDto: {
            /**
             * @description Token used to authorize API requests.
             * @example {
             *       "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJleGFtcGxlIn0.example-signature",
             *       "expiresAt": 1794307500000
             *     }
             */
            access: components["schemas"]["SessionTokenResponseDto"];
            /**
             * @description Single-use token for obtaining a new session.
             * @example {
             *       "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJleGFtcGxlIn0.example-signature",
             *       "expiresAt": 1794911400000
             *     }
             */
            refresh: components["schemas"]["SessionTokenResponseDto"];
        };
        SessionSetupResponseDto: {
            /**
             * @description Last year of the session.
             * @example 2027
             */
            endYear: number;
            /**
             * Format: uuid
             * @description Identifier of the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description First year of the session.
             * @example 2026
             */
            startYear: number;
            /**
             * @description Whether this record can be used in current academic operations.
             * @example active
             * @enum {string}
             */
            status: "active" | "inactive";
        };
        SessionTokenResponseDto: {
            /**
             * @description Expiry as a Unix timestamp in milliseconds.
             * @example 1794307500000
             */
            expiresAt: number;
            /**
             * @description Signed bearer token.
             * @example eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJleGFtcGxlIn0.example-signature
             */
            token: string;
        };
        SessionWriteDto: {
            /**
             * @description Last year of the session.
             * @example 2027
             */
            endYear: number;
            /**
             * @description First year of the session.
             * @example 2026
             */
            startYear: number;
            /**
             * @description Whether this record can be used in current academic operations.
             * @example active
             * @enum {string}
             */
            status?: "active" | "inactive";
        };
        SetAcademicLevelStatusDto: {
            /**
             * @description Whether the level can be used in new placements and registration.
             * @example active
             * @enum {string}
             */
            status: "active" | "inactive";
        };
        SetCurrentSemesterDto: {
            /**
             * Format: uuid
             * @description Semester used for course registration.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            semesterId: string | null;
        };
        SignInDto: {
            /**
             * Format: email
             * @description Email used to sign in.
             * @example ada.okafor@example.test
             */
            email: string;
            /**
             * Format: password
             * @description Password used to sign in.
             * @example Example-only-password!
             */
            password: string;
            /**
             * @description Type of account to sign in to.
             * @example student
             * @enum {string}
             */
            role: "student" | "admin";
        };
        StudentProfileResponseDto: {
            /**
             * Format: uuid
             * @description Current academic level ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            academicLevelId: string | null;
            /**
             * Format: uuid
             * @description Current programme ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            courseOfStudyId: string | null;
            /**
             * Format: uuid
             * @description Current department ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId: string | null;
            /**
             * Format: uuid
             * @description Current faculty ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            facultyId: string | null;
            /**
             * Format: uuid
             * @description Student profile ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Issued matriculation number, when placement is complete.
             * @example 26/1/2/3/42
             */
            matricNumber: string | null;
        };
        StudentResultHistoryDto: {
            /**
             * @description Credit-weighted GPA across all currently approved terms, or null without approved units.
             * @example 4.5
             */
            cgpa: number | null;
            /**
             * @description Terms in the student’s academic history.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "semesterId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "semesterName": "First Semester",
             *         "academicSession": "2026/2027",
             *         "department": "Computing",
             *         "programme": "BSc Computer Science",
             *         "academicLevel": "100 Level",
             *         "approvedUnits": 3,
             *         "gpa": 5
             *       }
             *     ]
             */
            terms: components["schemas"]["StudentResultTermDto"][];
        };
        StudentResultStatementDto: {
            /**
             * @description Academic level saved on the semester record.
             * @example 100 Level
             */
            academicLevel: string;
            /**
             * @description Academic session label.
             * @example 2026/2027
             */
            academicSession: string;
            /**
             * @description Credit units of all currently approved courses in the semester.
             * @example 3
             */
            approvedUnits: number;
            /**
             * @description Credit-weighted GPA across all currently approved terms, or null without approved units.
             * @example 4.5
             */
            cgpa: number | null;
            /**
             * @description Currently approved results belonging to this student and semester.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "code": "CSC101",
             *         "name": "Introduction to Computing",
             *         "units": 3,
             *         "caScore": 24.5,
             *         "examScore": 49.25,
             *         "totalScore": 73.75,
             *         "grade": "A",
             *         "gradePoint": 5,
             *         "approvedAt": "2026-11-10T10:30:00.000Z"
             *       }
             *     ]
             */
            courses: components["schemas"]["PublishedCourseResultDto"][];
            /**
             * @description Department saved on the semester record.
             * @example Computing
             */
            department: string;
            /**
             * @description Student’s given name, when available.
             * @example Ada
             */
            firstName: string | null;
            /**
             * @description Semester GPA, or null when no approved units exist.
             * @example 5
             */
            gpa: number | null;
            /**
             * Format: uuid
             * @description Student’s saved semester record ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Student’s family name, when available.
             * @example Okafor
             */
            lastName: string | null;
            /**
             * @description Student’s matriculation number, when available.
             * @example 26/1/2/3/42
             */
            matricNumber: string | null;
            /**
             * @description Programme saved on the semester record.
             * @example BSc Computer Science
             */
            programme: string;
            /**
             * Format: uuid
             * @description Academic semester ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            semesterId: string;
            /**
             * @description Name of the semester.
             * @example First Semester
             */
            semesterName: string;
        };
        StudentResultTermDto: {
            /**
             * @description Academic level saved on the semester record.
             * @example 100 Level
             */
            academicLevel: string;
            /**
             * @description Academic session label.
             * @example 2026/2027
             */
            academicSession: string;
            /**
             * @description Credit units of all currently approved courses in the semester.
             * @example 3
             */
            approvedUnits: number;
            /**
             * @description Department saved on the semester record.
             * @example Computing
             */
            department: string;
            /**
             * @description Semester GPA, or null when no approved units exist.
             * @example 5
             */
            gpa: number | null;
            /**
             * Format: uuid
             * @description Student’s saved semester record ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Programme saved on the semester record.
             * @example BSc Computer Science
             */
            programme: string;
            /**
             * Format: uuid
             * @description Academic semester ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            semesterId: string;
            /**
             * @description Name of the semester.
             * @example First Semester
             */
            semesterName: string;
        };
        TeachingOfferingDto: {
            /**
             * @description Canonical course code.
             * @example CSC101
             */
            code: string;
            /**
             * Format: uuid
             * @description University catalog course.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            courseId: string;
            /**
             * Format: uuid
             * @description Department that owns the record.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            departmentId: string;
            /**
             * @description Title of the course.
             * @example Introduction to Computing
             */
            name: string;
            /**
             * Format: uuid
             * @description Department-owned delivery of the course.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            offeringId: string;
            /**
             * @description Current enrollment state of this offering.
             * @example opened
             * @enum {string}
             */
            registrationStatus: "opened" | "closed";
            /**
             * Format: uuid
             * @description Semester used for course registration.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            semesterId: string;
            /**
             * @description Credit units assigned to this course.
             * @example 3
             */
            units: number;
        };
        TeachingOfferingsResponseDto: {
            /**
             * @description Offerings assigned to the signed-in lecturer.
             * @example [
             *       {
             *         "offeringId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "courseId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "code": "CSC101",
             *         "name": "Introduction to Computing",
             *         "units": 3,
             *         "semesterId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "departmentId": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "registrationStatus": "opened"
             *       }
             *     ]
             */
            offerings: components["schemas"]["TeachingOfferingDto"][];
        };
        UpdateUserDto: {
            /**
             * Format: email
             * @description Email used to sign in.
             * @example ada.okafor@example.test
             */
            email?: string;
            /**
             * @description Given name, if provided.
             * @example Ada
             */
            firstName?: string | null;
            /**
             * @description Family name, if provided.
             * @example Okafor
             */
            lastName?: string | null;
        };
        UpdateUserStatusDto: {
            /**
             * @description Whether the account can sign in.
             * @example suspended
             * @enum {string}
             */
            status: "active" | "suspended";
        };
        UserAdminProfileResponseDto: {
            /**
             * Format: uuid
             * @description Administrator profile ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
        };
        UserPageResponseDto: {
            /**
             * @description Accounts on the current page.
             * @example [
             *       {
             *         "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *         "role": "student",
             *         "email": "ada.okafor@example.test",
             *         "firstName": "Ada",
             *         "lastName": "Okafor",
             *         "status": "active",
             *         "createdAt": "2026-11-10T10:30:00.000Z"
             *       }
             *     ]
             */
            items: components["schemas"]["UserResponseDto"][];
            /**
             * @description Cursor for the next page. Null means there are no more results.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            nextCursor: string | null;
        };
        UserResponseDto: {
            /**
             * @description Administrator profile, when included.
             * @example {
             *       "id": "0191e192-67ad-746b-9acb-c850234b408a"
             *     }
             */
            admin?: components["schemas"]["UserAdminProfileResponseDto"];
            /**
             * Format: date-time
             * @description When the account was created.
             * @example 2026-11-10T10:30:00.000Z
             */
            createdAt: string;
            /**
             * Format: email
             * @description Email used to sign in.
             * @example ada.okafor@example.test
             */
            email: string;
            /**
             * @description Given name, if provided.
             * @example Ada
             */
            firstName: string | null;
            /**
             * Format: uuid
             * @description Account ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
            /**
             * @description Family name, if provided.
             * @example Okafor
             */
            lastName: string | null;
            /**
             * @description The type of account.
             * @example student
             * @enum {string}
             */
            role: "student" | "admin";
            /**
             * @description Whether the account can sign in.
             * @example active
             * @enum {string}
             */
            status: "active" | "suspended";
            /**
             * @description Student profile, when included.
             * @example {
             *       "id": "0191e192-67ad-746b-9acb-c850234b408a",
             *       "matricNumber": "26/1/2/3/42",
             *       "academicLevelId": "0191e192-67ad-746b-9acb-c850234b408a",
             *       "courseOfStudyId": "0191e192-67ad-746b-9acb-c850234b408a",
             *       "departmentId": "0191e192-67ad-746b-9acb-c850234b408a",
             *       "facultyId": "0191e192-67ad-746b-9acb-c850234b408a"
             *     }
             */
            student?: components["schemas"]["StudentProfileResponseDto"];
        };
        WriteRoleDto: {
            /**
             * @description What the role allows the administrator to do.
             * @example Coordinates undergraduate courses.
             */
            description?: string | null;
            /**
             * @description Unique role name using lowercase letters, digits, and hyphens.
             * @example course-coordinator
             */
            name: string;
            /**
             * @description Permissions granted to administrators assigned this role.
             * @example [
             *       "teach_course",
             *       "read_registration"
             *     ]
             */
            privileges?: ("read_user" | "create_student" | "update_student_placement" | "update_user" | "suspend_user" | "delete_user" | "revoke_user_sessions" | "read_admin" | "create_admin" | "manage_admin_roles" | "read_role" | "manage_roles" | "read_audit" | "manage_university" | "manage_department" | "read_registration" | "register_student_courses" | "teach_course" | "grade_result" | "approve_result" | "review_result" | "reopen_result" | "read_reports")[];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    AcademicReferencesController_list_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AcademicReferencesResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicSetupController_read_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AcademicSetupResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicSetupController_createDepartment_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DepartmentWriteDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DepartmentSetupResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicSetupController_updateDepartment_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DepartmentWriteDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DepartmentSetupResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicSetupController_createFaculty_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FacultyWriteDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FacultySetupResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicSetupController_updateFaculty_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FacultyWriteDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FacultySetupResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicSetupController_setCurrentSemester_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SetCurrentSemesterDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FacultySetupResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicSetupController_setLevelStatus_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SetAcademicLevelStatusDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AcademicLevelSetupDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicSetupController_createProgramme_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProgrammeWriteDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProgrammeSetupResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicSetupController_updateProgramme_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProgrammeWriteDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProgrammeSetupResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicSetupController_createSemester_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SemesterWriteDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SemesterSetupResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicSetupController_updateSemester_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SemesterWriteDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SemesterSetupResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicSetupController_createSession_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SessionWriteDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionSetupResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicSetupController_updateSession_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SessionWriteDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionSetupResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminsController_list_v1: {
        parameters: {
            query?: {
                /** @description Cursor returned by the previous page. */
                cursor?: string;
                /** @description Maximum number of results to return. */
                limit?: number;
                /** @description Administrator details to include: user, roles, or both separated by a space. */
                populate?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminPageResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminsController_create_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAdminDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreatedAdminResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminsController_get_v1: {
        parameters: {
            query?: {
                /** @description Cursor returned by the previous page. */
                cursor?: string;
                /** @description Maximum number of results to return. */
                limit?: number;
                /** @description Administrator details to include: user, roles, or both separated by a space. */
                populate?: string;
            };
            header?: never;
            path: {
                /** @description Administrator profile ID from the request path. */
                adminId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminsController_assign_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Administrator profile ID from the request path. */
                adminId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssignAdminRoleDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoleAssignmentResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminsController_revoke_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Administrator profile ID from the request path. */
                adminId: string;
                /** @description Role assignment ID from the request path. */
                grantId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The action completed successfully. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminsController_authorization_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminAuthorizationResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminAuditController_list_v1: {
        parameters: {
            query?: {
                /** @description Only include this audit action. */
                action?: "user.create_student" | "user.update" | "user.update_placement" | "user.set_status" | "user.revoke_sessions" | "user.delete" | "user.change_password" | "admin.create" | "admin.role.assign" | "admin.role.revoke" | "role.create" | "role.update" | "role.delete" | "academic.faculty.create" | "academic.faculty.update" | "academic.level.status" | "academic.faculty.current_semester" | "academic.department.create" | "academic.department.update" | "academic.programme.create" | "academic.programme.update" | "academic.session.create" | "academic.session.update" | "academic.semester.create" | "academic.semester.update" | "academic.course.create" | "academic.course.update" | "academic.curriculum.add" | "academic.curriculum.remove" | "academic.offering.create" | "academic.offering.update" | "registration.register_for_student" | "registration.close_roster" | "result.marks.save" | "result.grade.award" | "result.grade.clear" | "result.submit" | "result.approve" | "result.request_corrections" | "result.reopen";
                /** @description Only include events from this administrator profile. */
                actorAdminId?: string;
                /** @description Only include events from this sign-in account. */
                actorUserId?: string;
                /** @description Only include events in this audit category. */
                category?: "access" | "users" | "academic" | "results" | "operations";
                /** @description Opaque cursor returned by the previous page. */
                cursor?: string;
                /** @description Earliest timestamp to include, in ISO 8601 format. */
                from?: string;
                /** @description Maximum number of results to return. */
                limit?: number;
                /** @description Only include events with this outcome. */
                outcome?: "succeeded" | "denied" | "failed";
                /** @description Only include events for this resource ID. */
                targetId?: string;
                /** @description Latest timestamp to include, in ISO 8601 format. */
                to?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuditEventPageResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminAuditController_get_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Audit event ID from the request path. */
                eventId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuditEventResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CourseSetupController_read_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CourseSetupResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CourseSetupController_createCourse_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CourseWriteDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CourseResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CourseSetupController_updateCourse_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CourseWriteDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CourseResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CourseSetupController_addCurriculum_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CurriculumWriteDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CurriculumResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CourseSetupController_removeCurriculum_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The academic record was updated. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CourseSetupController_lecturers_v1: {
        parameters: {
            query: {
                /** @description Department that owns the record. */
                departmentId: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LecturerChoicesResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CourseSetupController_createOffering_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OfferingWriteDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OfferingResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    CourseSetupController_updateOffering_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OfferingUpdateDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OfferingResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    DepartmentRegistrationController_report_v1: {
        parameters: {
            query: {
                /** @description Cursor returned by the previous page. */
                cursor?: string;
                /** @description Department that owns the record. */
                departmentId: string;
                /** @description Maximum number of items returned. */
                limit?: number;
                /** @description Semester used for course registration. */
                semesterId: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegistrationRosterResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    DepartmentRegistrationController_register_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Student account ID from the request path. */
                userId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegistrationWriteDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegistrationSummaryResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    DepartmentRegistrationController_available_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Student account ID from the request path. */
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AvailableCoursesResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicReportingController_courses_v1: {
        parameters: {
            query: {
                /** @description The previous page’s nextCursor. Keep the same semester and department filters. */
                cursor?: string;
                /** @description Department to report on. Omit only with university-wide reporting access. */
                departmentId?: string;
                /** @description Maximum course offerings to return on this page. */
                limit?: number;
                /** @description Semester whose registrations and results are counted. */
                semesterId: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CoursePerformancePageDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicReportingController_options_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AcademicReportOptionsDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AcademicReportingController_overview_v1: {
        parameters: {
            query: {
                /** @description Department to report on. Omit only with university-wide reporting access. */
                departmentId?: string;
                /** @description Semester whose registrations and results are counted. */
                semesterId: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AcademicOverviewDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    DepartmentResultsController_list_v1: {
        parameters: {
            query: {
                /** @description Cursor returned by the previous page. */
                cursor?: string;
                /** @description Department responsible for the results. */
                departmentId: string;
                /** @description Number of records to return. */
                limit?: number;
                /** @description Filter results to this semester. */
                semesterId?: string;
                /** @description Filter groups by their current result state. Departmental review defaults to submitted. */
                status?: "pending" | "submitted" | "approved" | "correction_requested";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResultGroupPageDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    DepartmentResultsController_detail_v1: {
        parameters: {
            query?: {
                /** @description Cursor returned by the previous page. */
                cursor?: string;
                /** @description Number of records to return. */
                limit?: number;
            };
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResultGroupDetailDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    DepartmentResultsController_approve_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResultDecisionNoteDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResultStateResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    DepartmentResultsController_reopen_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReopenResultDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResultStateResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    DepartmentResultsController_requestCorrections_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestResultCorrectionsDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResultStateResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    DepartmentResultsController_options_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResultReviewOptionsDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    RolesController_list_v1: {
        parameters: {
            query?: {
                /** @description Cursor returned by the previous page. */
                cursor?: string;
                /** @description Maximum number of results to return. */
                limit?: number;
                /** @description Related records to include, separated by spaces. Omit this field if the endpoint has no supported relations. */
                populate?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RolePageResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    RolesController_create_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WriteRoleDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoleResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    RolesController_update_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Role ID from the request path. */
                roleId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WriteRoleDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoleResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    RolesController_delete_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Role ID from the request path. */
                roleId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The action completed successfully. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminUsersController_list_v1: {
        parameters: {
            query?: {
                /** @description Cursor returned by the previous page. */
                cursor?: string;
                /** @description Maximum number of results to return. */
                limit?: number;
                /** @description Related profiles to include: student, admin, or both separated by a space. */
                populate?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserPageResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminUsersController_get_v1: {
        parameters: {
            query?: {
                /** @description Cursor returned by the previous page. */
                cursor?: string;
                /** @description Maximum number of results to return. */
                limit?: number;
                /** @description Related profiles to include: student, admin, or both separated by a space. */
                populate?: string;
            };
            header?: never;
            path: {
                /** @description Account ID from the request path. */
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminUsersController_delete_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Account ID from the request path. */
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The action completed successfully. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminUsersController_update_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Account ID from the request path. */
                userId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminUsersController_revokeSessions_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Account ID from the request path. */
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The action completed successfully. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminUsersController_status_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Account ID from the request path. */
                userId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserStatusDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminUsersController_placement_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Account ID from the request path. */
                userId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PlacementDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AdminUsersController_createStudent_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateStudentDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AuthController_refresh_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AuthController_signIn_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SignInDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AuthController_signOut_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The action completed successfully. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AuthController_signUp_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateStudentDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    LecturerRegistrationController_offerings_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TeachingOfferingsResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    LecturerRegistrationController_close_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RosterClosureResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    LecturerRegistrationController_roster_v1: {
        parameters: {
            query?: {
                /** @description Cursor returned by the previous page. */
                cursor?: string;
                /** @description Maximum number of items returned. */
                limit?: number;
            };
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegistrationRosterResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    LecturerResultsController_detail_v1: {
        parameters: {
            query?: {
                /** @description Cursor returned by the previous page. */
                cursor?: string;
                /** @description Number of records to return. */
                limit?: number;
            };
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResultGroupDetailDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    LecturerResultsController_saveMarks_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SaveResultMarksDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SaveMarksResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    LecturerResultsController_submit_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResultDecisionNoteDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResultStateResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    StudentRegistrationController_terms_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegisteredTermsResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    StudentRegistrationController_register_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegistrationWriteDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegistrationSummaryResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    StudentRegistrationController_summary_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegistrationSummaryResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    StudentRegistrationController_download_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": string;
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    StudentRegistrationController_available_v1: {
        parameters: {
            query?: {
                /** @description Semester used for course registration. */
                semesterId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AvailableCoursesResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    StudentResultsController_history_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StudentResultHistoryDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    StudentResultsController_statement_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StudentResultStatementDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    StudentResultsController_download_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifier of the academic record in the request path. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": string;
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    UsersController_me_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    UsersController_update_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfileDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description The request could not be completed. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
}
