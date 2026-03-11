import { createSwaggerSpec } from "next-swagger-doc";
import { NextResponse } from "next/server";

export const GET = async () => {
    const spec = createSwaggerSpec({
        apiFolder: "app/api",
        definition: {
            openapi: "3.0.0",
            info: {
                title: "Sales Insight Automator API",
                version: "1.0",
            },
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                },
            },
            security: [],
        },
    });

    return NextResponse.json(spec);
};
