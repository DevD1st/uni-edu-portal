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
        patch?: never;
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
        RefreshDto: {
            /**
             * @description Refresh token from the current session.
             * @example eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJleGFtcGxlIn0.example-signature
             */
            refreshToken: string;
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
        UserAdminProfileResponseDto: {
            /**
             * Format: uuid
             * @description Administrator profile ID.
             * @example 0191e192-67ad-746b-9acb-c850234b408a
             */
            id: string;
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
}
