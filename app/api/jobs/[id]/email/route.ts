import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSummaryEmail } from '@/lib/services/mailer';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: jobId } = await params;

    try {
        const { email } = await req.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
        }

        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        if (job.status !== 'COMPLETED' || !job.summary) {
            return NextResponse.json({ error: 'Job is not completed or has no summary' }, { status: 400 });
        }

        // Send Email
        await sendSummaryEmail(email, job.summary);

        return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
