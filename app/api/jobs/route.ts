import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new processing job
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job created successfully
 *       400:
 *         description: Invalid input
 *   get:
 *     summary: Get all jobs
 *     responses:
 *       200:
 *         description: Array of jobs
 */

export async function POST(req: Request) {
    try {
        const { recipientEmail } = await req.json();

        if (!recipientEmail || typeof recipientEmail !== "string") {
            return NextResponse.json({ error: "Invalid recipient email" }, { status: 400 });
        }

        const job = await prisma.job.create({
            data: {
                recipientEmail,
                status: "PENDING",
            },
        });

        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        console.error("Error creating job:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
