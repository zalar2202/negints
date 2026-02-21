import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

/**
 * POST /api/contact - Handle contact form submissions
 * Sends an email notification with the visitor's inquiry
 */
export async function POST(request) {
    try {
        const { name, email, phone, subject, message } = await request.json();

        // Basic validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: "لطفاً تمام فیلدهای ضروری را تکمیل کنید." },
                { status: 400 }
            );
        }

        const subjectLabels = {
            consultation: "مشاوره تجهیزات پزشکی",
            quote: "استعلام قیمت",
            order: "ثبت سفارش",
            support: "پشتیبانی فنی",
            calibration: "خدمات کالیبراسیون",
            partnership: "همکاری تجاری",
            other: "سایر موارد",
        };

        const subjectLabel = subjectLabels[subject] || subject;

        // Send notification email to team
        await sendMail({
            to: process.env.CONTACT_EMAIL || "info@negints.com",
            subject: `پیام جدید از وب‌سایت: ${subjectLabel}`,
            fromType: "CONTACT",
            html: `
                <div dir="rtl" style="font-family: Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
                    <div style="background: #0a3d62; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0; font-size: 20px;">📩 پیام جدید از وب‌سایت</h2>
                    </div>
                    <div style="background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0a3d62; width: 120px;">نام:</td>
                                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0a3d62;">ایمیل:</td>
                                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;"><a href="mailto:${email}" style="color: #0a3d62;">${email}</a></td>
                            </tr>
                            ${phone ? `
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0a3d62;">تلفن:</td>
                                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;" dir="ltr">${phone}</td>
                            </tr>
                            ` : ""}
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0a3d62;">موضوع:</td>
                                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${subjectLabel}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; font-weight: bold; color: #0a3d62; vertical-align: top;">پیام:</td>
                                <td style="padding: 12px; color: #334155; line-height: 1.7; white-space: pre-wrap;">${message}</td>
                            </tr>
                        </table>
                    </div>
                    <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">
                        این پیام از طریق فرم تماس وب‌سایت negints.com ارسال شده است.
                    </p>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact form error:", error);
        return NextResponse.json(
            { error: "خطایی در ارسال پیام رخ داد." },
            { status: 500 }
        );
    }
}
