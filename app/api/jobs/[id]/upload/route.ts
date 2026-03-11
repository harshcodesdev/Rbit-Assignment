import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseFile } from '@/lib/services/dataParser';
import { generateSummary } from '@/lib/services/llm';
import { sendSummaryEmail } from '@/lib/services/mailer';

/**
 * @swagger
 * /api/jobs/{id}/upload:
 *   post:
 *     summary: Upload a sales data file and trigger processing
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Processing complete
 */

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: jobId } = await params;
    try {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Read the file as buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Update job to processing
        await prisma.job.update({
            where: { id: jobId },
            data: { status: 'PROCESSING', fileName: file.name }
        });

        // We process synchronously for simplicity, but in a real-world high-traffic app
        // this could trigger a background job queue (e.g. BullMQ, Inngest).

        // 1. Parse File
        const parsedData = parseFile(buffer, file.type);

        // 2. Generate summary via LLM
        const summaryStr = await generateSummary(parsedData);

        // 3. Update database
        const updatedJob = await prisma.job.update({
            where: { id: jobId },
            data: { status: 'COMPLETED', summary: summaryStr }
        });

        // 4. Send Email
        await sendSummaryEmail(updatedJob.recipientEmail, summaryStr);

        return NextResponse.json({ message: 'Processing successful', job: updatedJob }, { status: 200 });
    } catch (error) {
        console.error('File Processing Error:', error);
        await prisma.job.update({
            where: { id: jobId },
            data: { status: 'FAILED' }
        }).catch(console.error);

        return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
    }
}
