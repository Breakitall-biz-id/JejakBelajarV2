import { NextResponse } from "next/server"
import { requireStudentUser } from "@/lib/auth/session"
import type { RaporData } from "../route"

// Simple PDF generation using HTML template
// In production, you might want to use libraries like puppeteer, jsPDF, or react-pdf

export async function POST(request: Request) {
  try {
    const session = await requireStudentUser()
    const raporData: RaporData = await request.json()

    // Generate HTML content for PDF
    const htmlContent = generatePDFHTML(raporData)

    // Return as HTML response that can be printed/saved as PDF
    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="rapor-${raporData.project.title}-${raporData.student.name}.html"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}

function generatePDFHTML(data: RaporData): string {
  const getScoreColor = (score: number) => {
    // Update thresholds for 0-100 scale
    // 3.5/4.0 = 87.5%, 3.0/4.0 = 75%, 2.0/4.0 = 50%
    if (score >= 87.5) return "#16a34a"
    if (score >= 75.0) return "#2563eb"
    if (score >= 50.0) return "#ca8a04"
    return "#dc2626"
  }

  const getProgressValue = (score: number) => {
    // Score is already in 0-100 scale, so return directly
    return score
  }

  return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapor Kokurikuler - ${data.student.name}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
        }

        .header h1 {
            color: #1f2937;
            margin: 0;
            font-size: 28px;
        }

        .header p {
            color: #6b7280;
            margin: 5px 0;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }

        .info-box {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }

        .info-box h3 {
            margin: 0 0 10px 0;
            color: #374151;
            font-size: 16px;
        }

        .info-box p {
            margin: 5px 0;
            color: #6b7280;
        }

        .score-section {
            margin-bottom: 30px;
        }

        .score-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .score-header h2 {
            margin: 0;
            color: #1f2937;
        }

        .score-value {
            font-size: 24px;
            font-weight: bold;
            padding: 10px 20px;
            border-radius: 8px;
            color: white;
        }

        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 10px;
        }

        .progress-fill {
            height: 100%;
            background: #3b82f6;
            transition: width 0.3s ease;
        }

        .dimension-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .dimension-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .dimension-name {
            font-weight: bold;
            color: #1f2937;
        }

        .dimension-score {
            font-weight: bold;
            padding: 5px 10px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
        }

        .qualitative-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
        }

        .qualitative-sb { background: #16a34a; color: white; }
        .qualitative-b { background: #2563eb; color: white; }
        .qualitative-c { background: #ca8a04; color: white; }
        .qualitative-p { background: #dc2626; color: white; }

        .insights-section {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }

        .insight-card {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
        }

        .insight-card h3 {
            margin: 0 0 15px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .insight-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .insight-list li {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 10px;
            color: #4b5563;
        }

        .recommendations {
            background: #eff6ff;
            border: 1px solid #dbeafe;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }

        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }

        @media print {
            body { margin: 0; padding: 10px; }
            .info-grid { grid-template-columns: 1fr; }
            .insights-section { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapor Kokurikuler</h1>
        <p>Kokurikuler Project Assessment Report - ${data.project.theme}</p>
        <p>Generated on ${new Date(data.generatedAt).toLocaleString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
    </div>

    <div class="info-grid">
        <div class="info-box">
            <h3>👤 Student Information</h3>
            <p><strong>Name:</strong> ${data.student.name}</p>
            <p><strong>Email:</strong> ${data.student.email}</p>
        </div>

        <div class="info-box">
            <h3>📚 Project Details</h3>
            <p><strong>Project:</strong> ${data.project.title}</p>
            <p><strong>Class:</strong> ${data.class.name}</p>
            <p><strong>Theme:</strong> ${data.project.theme || 'N/A'}</p>
        </div>

        <div class="info-box">
            <h3>📅 Academic Period</h3>
            <p><strong>Academic Year:</strong> ${data.class.academicYear}</p>
            <p><strong>Semester:</strong> ${data.class.semester}</p>
        </div>

        <div class="info-box">
            <h3>🎓 Teacher</h3>
            <p><strong>Name:</strong> ${data.teacher.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${data.teacher.email || 'N/A'}</p>
        </div>
    </div>

    <div class="score-section">
        <div class="score-header">
            <h2>📊 Overall Performance Summary</h2>
            <div class="score-value" style="background-color: ${getScoreColor(data.overallAverageScore)};">
                ${data.overallAverageScore.toFixed(1)}/4.0
            </div>
        </div>

        <div class="progress-bar">
            <div class="progress-fill" style="width: ${getProgressValue(data.overallAverageScore)}%; background-color: ${getScoreColor(data.overallAverageScore)};"></div>
        </div>

        <p><strong>Qualitative Assessment:</strong>
            <span class="qualitative-badge qualitative-${data.overallQualitativeCode.toLowerCase()}">
                ${data.overallQualitativeScore} (${data.overallQualitativeCode})
            </span>
        </p>

        <p><em>${data.overallQualitativeDescription}</em></p>
    </div>

    <div class="score-section">
        <h2>📈 Dimension Performance Details</h2>

        ${data.dimensionScores
          .sort((a, b) => b.averageScore - a.averageScore)
          .map((dimension, index) => `
            <div class="dimension-card">
                <div class="dimension-header">
                    <div>
                        <span class="dimension-name">#${index + 1} ${dimension.dimensionName}</span>
                        <span class="qualitative-badge qualitative-${dimension.qualitativeCode.toLowerCase()}">
                            ${dimension.qualitativeCode}
                        </span>
                    </div>
                    <div class="dimension-score" style="background-color: ${getScoreColor(dimension.averageScore)};">
                        ${dimension.averageScore.toFixed(1)}/100
                    </div>
                </div>

                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${getProgressValue(dimension.averageScore)}%; background-color: ${getScoreColor(dimension.averageScore)};"></div>
                </div>

                <p><em>${dimension.qualitativeDescription}</em></p>
                <p><small>Based on ${dimension.totalSubmissions} assessment${dimension.totalSubmissions !== 1 ? 's' : ''}</small></p>
            </div>
          `).join('')}
    </div>

    <div class="insights-section">
        <div class="insight-card">
            <h3>✅ Kelebihan</h3>
            <ul class="insight-list">
                ${data.performanceInsights.strengths.length > 0
                  ? data.performanceInsights.strengths.map(strength =>
                      `<li>✅ ${strength}</li>`
                    ).join('')
                  : '<li>Terus kembangkan keterampilan dan kelebihan Anda.</li>'
                }
            </ul>
        </div>

        <div class="insight-card">
            <h3>🎯 Area yang Perlu Dikembangkan</h3>
            <ul class="insight-list">
                ${data.performanceInsights.areasForImprovement.length > 0
                  ? data.performanceInsights.areasForImprovement.map(area =>
                      `<li>🎯 ${area}</li>`
                    ).join('')
                  : '<li>Tidak ada area khusus yang perlu perbaikan saat ini.</li>'
                }
            </ul>
        </div>
    </div>

    <div class="recommendations">
        <h3>💡 Rekomendasi Pengembangan</h3>
        <ul class="insight-list">
            ${data.performanceInsights.recommendations.map(rec =>
                `<li>💡 ${rec}</li>`
            ).join('')}
        </ul>
    </div>

    <div class="footer">
        <p><strong>Rapor Kokurikuler - Sistem Penilaian Proyek Kokurikuler</strong></p>
        <p>Laporan ini dibuat otomatis berdasarkan penilaian dan aktivitas proyek.</p>
    </div>
</body>
</html>
  `
}